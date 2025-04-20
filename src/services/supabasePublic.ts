// src/services/supabasePublic.ts
import { createClient } from '@supabase/supabase-js';

// Utilizar as variáveis de ambiente com verificação de undefined
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

// Verificação adicional para garantir valores válidos
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Variáveis de ambiente do Supabase não estão definidas corretamente');
}

// Cliente específico para acesso anônimo/público
export const supabasePublic = createClient(supabaseUrl, supabaseAnonKey);

// // src/services/supabasePublic.ts
// import { createClient } from '@supabase/supabase-js';

// // Obter as variáveis de ambiente do arquivo supabase.ts existente
// // Se você estiver usando um arquivo de configuração, importe-o diretamente
// import { supabase } from './supabase';

// // Criar uma nova instância do cliente Supabase para acesso público
// // Usando as mesmas credenciais do cliente principal
// export const supabasePublic = supabase;