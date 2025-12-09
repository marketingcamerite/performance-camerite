import type { Segment } from './types';

// As chaves já estão configuradas para produção
export const SUPABASE_URL = 'https://wtywtjwsuxmhqutdvcfd.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0eXd0andzdXhtaHF1dGR2Y2ZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0MDQ2MDYsImV4cCI6MjA3Nzk4MDYwNn0.FVs4aLTe-XlBHnApwGmD_40MN_i3lCdSevA-PZL_mlQ';

export const YEARS: number[] = [2024, 2025, 2026, 2027, 2028, 2029, 2030];

export const MONTHS: string[] = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

export const SEGMENTS: Segment[] = ["Franquias", "White Label", "Redes Sociais", "Site"];

export const WEEK_LABELS: string[] = ["Sem 1", "Sem 2", "Sem 3", "Sem 4", "Sem 5"];

export const ZEROS_5 = (): number[] => [0, 0, 0, 0, 0];