
export const parseBRNumber = (text: string | number | null | undefined): number => {
  if (text === null || text === undefined) return 0;
  let s = String(text).replace(/[^\d.,-]/g, '');
  s = s.replace(/\.(?=\d{3}(\D|$))/g, '');
  s = s.replace(',', '.');
  const v = parseFloat(s);
  return isNaN(v) ? 0 : v;
};

// FIX: Explicitly set the generic type for reduce to `number` to avoid type inference issues.
export const sum = (arr: (number | string)[]): number => arr.reduce<number>((acc, val) => acc + parseBRNumber(val), 0);

export const formatCurrency = (value: number): string => {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

export const formatNumber = (value: number): string => {
  return value.toLocaleString('pt-BR');
};

export const safeDivide = (numerator: number, denominator: number): number => {
  return denominator > 0 ? numerator / denominator : 0;
};

/**
 * Filtra os dados do gráfico para remover semanas onde TODAS as métricas relevantes são zero.
 * Útil para remover a "Semana 5" quando ela não existe no mês.
 * 
 * @param data Array de objetos (dados do gráfico)
 * @param keysToCheck Lista de chaves (propriedades) para verificar se são > 0.
 */
export const filterActiveWeeks = (data: any[], keysToCheck: string[]) => {
  return data.filter(item => {
    // Mantém o item se PELO MENOS UMA das chaves tiver valor numérico > 0
    return keysToCheck.some(key => {
      const val = item[key];
      return typeof val === 'number' && val !== 0;
    });
  });
};
