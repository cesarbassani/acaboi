// Função para formatar valores monetários no padrão brasileiro
export const formatCurrency = (value: number | null): string => {
  if (value === null || value === undefined) return '-';
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

// Função para formatar datas no padrão brasileiro
export const formatDate = (dateString: string | null): string => {
  if (!dateString) return '-';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
};

// Função para formatar valores decimais com 2 casas decimais
export const formatDecimal = (value: number | null): string => {
  if (value === null || value === undefined) return '-';
  
  return value.toFixed(2).replace('.', ',');
};

// Função para formatar valores inteiros com separador de milhar
export const formatInteger = (value: number | null): string => {
  if (value === null || value === undefined) return '-';
  
  return value.toLocaleString('pt-BR');
};

export const formatDayOfWeek = (day: string): string => {
  const key = day.trim().toLowerCase().replace(/^./, c => c.toUpperCase()); 
  // " monday " → "Monday"
  const daysMap: Record<string, string> = {
    Monday: 'Segunda-feira',
    Tuesday: 'Terça-feira',
    Wednesday: 'Quarta-feira',
    Thursday: 'Quinta-feira',
    Friday: 'Sexta-feira',
    Saturday: 'Sábado',
    Sunday: 'Domingo'
  };
  return daysMap[key] || day;
};

export function parseDateLocal(dateString: string): Date {
  // Pega só "YYYY-MM-DD"
  const [year, month, day] = dateString.slice(0, 10).split('-').map(Number);
  return new Date(year, month - 1, day);
}

export const formatDateBR = (date: Date): string => {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}