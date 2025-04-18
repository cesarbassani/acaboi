// src/store/AuthContext.tsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../services/supabase';
import { Session, User } from '@supabase/supabase-js';
import { UserRole } from '../types/auth';

// Interface estendida para adicionar o campo role ao usuário
interface ExtendedUser extends User {
  role: UserRole;
  name?: string;
}

// Interface para o contexto de autenticação
interface AuthContextType {
  user: ExtendedUser | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{
    error: Error | null;
    success: boolean;
    redirectTo?: string;
  }>;
  signUp: (email: string, password: string, name: string, userType: string) => Promise<{
    error: Error | null;
    success: boolean;
  }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{
    error: Error | null;
    success: boolean;
  }>;
  updateProfile: (data: { name?: string; userType?: string; phone?: string; mobilePhone?: string }) => Promise<{
    error: Error | null;
    success: boolean;
  }>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Timeout de segurança - Força loading para false após 5 segundos
    const timer = setTimeout(() => {
      console.log("Timeout de segurança acionado - forçando loading para false");
      setLoading(false);
    }, 5000);
    
    // Carregar sessão inicial de forma simplificada
    const loadSession = async () => {
      try {
        console.log("Iniciando carregamento da sessão");
        const { data: { session } } = await supabase.auth.getSession();
        console.log("Sessão obtida:", session);
        
        setSession(session);
        
        if (!session || !session.user) {
          console.log("Nenhum usuário na sessão");
          setUser(null);
          setLoading(false);
          return;
        }
        
        // Tentar carregar o perfil, mas não bloquear se falhar
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          // Criar usuário com dados do perfil
          const extendedUser: ExtendedUser = {
            ...session.user,
            role: (profile?.role || profile?.type || 'tecnico') as UserRole,
            name: session.user.user_metadata?.name || profile?.name || ''
          };
          console.log("Usuário autenticado com role:", extendedUser.role);
          setUser(extendedUser);
        } catch (error) {
          // Em caso de erro, criar um usuário básico
          console.error("Erro ao carregar perfil:", error);
          const basicUser: ExtendedUser = {
            ...session.user,
            role: 'tecnico' as UserRole
          };
          setUser(basicUser);
        }
      } catch (error) {
        console.error("Erro ao carregar sessão:", error);
        setUser(null);
        setSession(null);
      } finally {
        setLoading(false);
      }
    };
    
    loadSession();
    
    // Configurar listener simplificado
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("Evento de autenticação:", _event);
      setSession(session);
      
      if (!session) {
        setUser(null);
        setLoading(false);
        return;
      }
      
      // Função assíncrona para carregar o perfil
      const loadUserProfile = async () => {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          const extendedUser: ExtendedUser = {
            ...session.user,
            role: (profile?.role || profile?.type || 'tecnico') as UserRole,
            name: session.user.user_metadata?.name || profile?.name || ''
          };
          setUser(extendedUser);
        } catch (error) {
          console.error("Erro ao carregar perfil em onAuthStateChange:", error);
          const basicUser: ExtendedUser = {
            ...session.user,
            role: 'tecnico' as UserRole
          };
          setUser(basicUser);
        } finally {
          setLoading(false);
        }
      };
      
      // Iniciar carregamento do perfil, mas não bloquear a UI
      loadUserProfile();
    });
  
    return () => {
      clearTimeout(timer);
      subscription?.unsubscribe();
    };
  }, []);

  // Função simplificada para atualizar os dados do usuário
  const refreshUser = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setUser(null);
        setLoading(false);
        return;
      }
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      const extendedUser: ExtendedUser = {
        ...session.user,
        role: (profile?.role || profile?.type || 'tecnico') as UserRole,
        name: session.user.user_metadata?.name || profile?.name || ''
      };
      
      setUser(extendedUser);
    } catch (error) {
      console.error("Erro em refreshUser:", error);
    } finally {
      setLoading(false);
    }
  };

  // Função de login simplificada
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      console.log("Iniciando login para:", email);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        console.error("Erro no login:", error);
        setLoading(false);
        return { error, success: false };
      }
      
      // Não tentamos carregar o perfil aqui - deixamos o evento onAuthStateChange fazer isso
      // Isso evita que o login fique bloqueado por problemas no carregamento do perfil
      
      return { error: null, success: true, redirectTo: '/dashboard' };
    } catch (error) {
      console.error("Erro crítico no login:", error);
      return { error: error as Error, success: false };
    } finally {
      // Garantir que o loading seja definido como false
      setTimeout(() => setLoading(false), 1000);
    }
  };

  // Função de registro simplificada
  const signUp = async (email: string, password: string, name: string, userType: string) => {
    try {
      setLoading(true);
      
      console.log("Iniciando registro para:", email);
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            name: name,
            type: userType
          }
        }
      });

      if (error) {
        console.error("Erro no registro:", error);
        setLoading(false);
        return { error, success: false };
      }

      // Inserir no perfil com os valores recebidos
      if (data.user) {
        try {
          await supabase.from('profiles').insert({
            id: data.user.id,
            name: name,
            email: email,
            type: userType,
            role: userType
          });
          console.log("Perfil criado com sucesso");
        } catch (profileError) {
          console.error("Erro ao criar perfil:", profileError);
          // Continuar mesmo com erro no perfil
        }
      }

      return { error: null, success: true };
    } catch (error) {
      console.error("Erro crítico no registro:", error);
      return { error: error as Error, success: false };
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  };

  const signOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setLoading(false);
  };

  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      return { error, success: !error };
    } catch (error) {
      return { error: error as Error, success: false };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: { name?: string; userType?: string; phone?: string; mobilePhone?: string }) => {
    try {
      setLoading(true);
      
      if (!user) return { error: new Error('Usuário não autenticado'), success: false };

      // Atualizar dados de autenticação se necessário
      if (data.name) {
        const { error: authError } = await supabase.auth.updateUser({
          data: {
            name: data.name,
            type: data.userType
          }
        });

        if (authError) {
          setLoading(false);
          return { error: authError, success: false };
        }
      }

      // Atualizar perfil na tabela profiles
      const { error: profileError } = await supabase.from('profiles').update({
        name: data.name,
        type: data.userType,
        role: data.userType,
        phone: data.phone,
        mobile_phone: data.mobilePhone,
        updated_at: new Date().toISOString()
      }).match({ id: user.id });

      // Atualizar o estado do usuário
      await refreshUser();

      return { error: profileError, success: !profileError };
    } catch (error) {
      return { error: error as Error, success: false };
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        session, 
        loading, 
        signIn, 
        signUp, 
        signOut, 
        resetPassword,
        updateProfile,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};