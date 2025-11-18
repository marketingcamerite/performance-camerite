export const parseBRNumber = (text: string | number | null | undefined): number => {
  if (text === null || text === undefined) return 0;
  let s = String(text).replace(/[^\d.,-]/g, '');
  s = s.replace(/\.(?=\d{3}(\D|$))/g, '');
  s = s.replace(',', '.');
  const v = parseFloat(s);
  return isNaN(v) ? 0 : v;
};

// FIX: Explicitly set the generic type for reduce to `number` to avoid type inference issues. The `reduce` on an array of `(string | number)` could have its accumulator inferred incorrectly without this hint.
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
