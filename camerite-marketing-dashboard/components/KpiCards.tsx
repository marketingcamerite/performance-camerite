
import React from 'react';
import type { FWMonth } from '../types';
import { sum, formatCurrency, formatNumber } from '../utils/helpers';

interface KpiCardsProps {
  data: FWMonth;
  totalInvestment: number;
}

const KpiCard: React.FC<{ title: string; value: string; }> = ({ title, value }) => (
  <div className="bg-slate-800/50 p-4 rounded-lg flex-1 min-w-[160px]">
    <div className="text-sm text-slate-400 mb-1">{title}</div>
    <div className="text-2xl font-bold text-white">{value}</div>
  </div>
);

const KpiCards: React.FC<KpiCardsProps> = ({ data, totalInvestment }) => {
  const leadsMonth = sum(data.pipe.leads);
  const oppMonth = sum(data.pipe.oportunidades);
  const salesMonth = sum(data.pipe.vendas);
  const cacMonth = salesMonth > 0 ? totalInvestment / salesMonth : 0;

  return (
    <div className="flex gap-4 flex-wrap">
      <KpiCard title="Investimento Total (Mês)" value={formatCurrency(totalInvestment)} />
      <KpiCard title="Leads (Mês)" value={formatNumber(leadsMonth)} />
      <KpiCard title="Oportunidades (Mês)" value={formatNumber(oppMonth)} />
      <KpiCard title="Vendas (Mês)" value={formatNumber(salesMonth)} />
      <KpiCard title="CAC Médio (Mês)" value={formatCurrency(cacMonth)} />
    </div>
  );
};

export default KpiCards;
