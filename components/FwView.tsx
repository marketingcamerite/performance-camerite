
import React, { useState } from 'react';
import type { FWMonth, FWMonth as IFWMonth } from '../types';
import Card from './Card';
import KpiCards from './KpiCards';
import DynamicListManager from './DynamicListManager';
import PaidDataTable from './PaidDataTable';
import { sum, parseBRNumber } from '../utils/helpers';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, ZAxis
} from 'recharts';
import { WEEK_LABELS, MONTHS } from '../constants';

interface FwViewProps {
  data: FWMonth;
  isAnnualView: boolean;
  fullYearData: FWMonth[];
  actions: any;
}

// Components defined outside to prevent focus loss issues
const SectionTitle: React.FC<{title: string; subtitle: string}> = ({title, subtitle}) => (
    <div className="mb-6 mt-10 pl-2 border-l-4 border-violet-500">
        <h2 className="text-2xl font-bold text-white tracking-tight">{title}</h2>
        <p className="text-slate-400 text-sm">{subtitle}</p>
    </div>
);

const ChartWrapper: React.FC<{title:string; children: React.ReactNode}> = ({title, children}) => (
    <Card title={title} className="col-span-12 md:col-span-6">
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {children}
          </ResponsiveContainer>
        </div>
    </Card>
);

const ToggleButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
            active 
            ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/50' 
            : 'text-slate-400 hover:text-white hover:bg-slate-800'
        }`}
    >
        {children}
    </button>
);

const FwView: React.FC<FwViewProps> = ({ data, isAnnualView, fullYearData, actions }) => {
  const [viewMode, setViewMode] = useState<'dashboard' | 'data'>('dashboard');
  
  if (!data) return null;

  const computeAutoLeads = (month: IFWMonth) => {
    const leadsPerWeek = [0, 0, 0, 0, 0];
    Object.values(month.organic.sources).forEach(arr => arr.forEach((v, i) => leadsPerWeek[i] += parseBRNumber(v)));
    Object.values(month.organic.landing).forEach(lp => lp.leads.forEach((v, i) => leadsPerWeek[i] += parseBRNumber(v)));
    for (let i = 0; i < 5; i++) {
        leadsPerWeek[i] += parseBRNumber(month.paid.meta.leads[i]) + parseBRNumber(month.paid.google.leads[i]);
    }
    return leadsPerWeek;
  }
  
  data.pipe.leads = computeAutoLeads(data);
  const totalInvestment = sum(data.paid.meta.investimento) + sum(data.paid.google.investimento);

  // Chart data preparation
  const weeklyChartData = WEEK_LABELS.map((name, i) => {
    const metaInvest = parseBRNumber(data.paid.meta.investimento[i]);
    const googleInvest = parseBRNumber(data.paid.google.investimento[i]);
    const totalInvest = metaInvest + googleInvest;
    
    const metaLeads = parseBRNumber(data.paid.meta.leads[i]);
    const googleLeads = parseBRNumber(data.paid.google.leads[i]);
    const totalPaidLeads = metaLeads + googleLeads;

    const opportunities = parseBRNumber(data.pipe.oportunidades[i]);

    return {
      name,
      investimentoMeta: metaInvest,
      investimentoGoogle: googleInvest,
      investimentoTotal: totalInvest,
      cpl: totalPaidLeads > 0 ? totalInvest / totalPaidLeads : 0,
      cpo: opportunities > 0 ? totalInvest / opportunities : 0,
      leads: parseBRNumber(data.pipe.leads[i]),
      oportunidades: opportunities,
      leadsPlanejadosMeta: parseBRNumber(data.paid.meta.leadsPlan[i]),
      leadsConquistadosMeta: metaLeads,
      leadsPlanejadosGoogle: parseBRNumber(data.paid.google.leadsPlan[i]),
      leadsConquistadosGoogle: googleLeads,
      alcance: parseBRNumber(data.paid.meta.alcance[i]) + parseBRNumber(data.paid.google.alcance[i]),
      impressoes: parseBRNumber(data.paid.meta.impressoes[i]) + parseBRNumber(data.paid.google.impressoes[i]),
      cliques: parseBRNumber(data.paid.meta.cliques[i]) + parseBRNumber(data.paid.google.cliques[i]),
    }
  });

  const annualChartData = MONTHS.map((name, i) => {
    const monthData = fullYearData[i];
    if (!monthData || monthData.weeks === 0) return { name, alcance: 0, cliques: 0, leads: 0, oportunidades: 0, vendas: 0 };
    const leads = sum(computeAutoLeads(monthData));
    return {
        name: name.substring(0, 3),
        alcance: sum(monthData.paid.meta.alcance) + sum(monthData.paid.google.alcance),
        cliques: sum(monthData.paid.meta.cliques) + sum(monthData.paid.google.cliques),
        leads: leads,
        oportunidades: sum(monthData.pipe.oportunidades),
        vendas: sum(monthData.pipe.vendas),
    };
  });

  return (
    <div className="space-y-8 pb-10">
      <KpiCards data={data} totalInvestment={totalInvestment} />

      <div className="flex justify-center mb-8">
        <div className="bg-slate-900 p-1.5 rounded-full border border-slate-800 flex gap-1">
            <ToggleButton active={viewMode === 'dashboard'} onClick={() => setViewMode('dashboard')}>
                Dashboard
            </ToggleButton>
            <ToggleButton active={viewMode === 'data'} onClick={() => setViewMode('data')}>
                Dados
            </ToggleButton>
        </div>
      </div>

      {viewMode === 'data' ? (
        <div className="space-y-8 animate-in fade-in zoom-in duration-300">
             <SectionTitle title="Landing Pages" subtitle="Acompanhamento de visualizações e conversão das LPs." />
            <DynamicListManager
                title="Landing Pages"
                items={Object.keys(data.organic.landing)}
                onAdd={(name) => actions.addFwItem('landing', name)}
                onRemove={(name) => actions.removeFwItem('landing', name)}
                itemTypeLabel="LP"
                renderTable={(name) => {
                const lpData = data.organic.landing[name];
                return (
                    <PaidDataTable
                    title={`Desempenho - ${name}`}
                    rows={[
                        { key: 'views', label: 'Visualizações', type: 'input' },
                        { key: 'leads', label: 'Leads', type: 'input' },
                        { key: 'conversion', label: 'Conversão (%)', type: 'calculated', calculation: (d, i) => (parseBRNumber(d.views[i]) > 0 ? (parseBRNumber(d.leads[i]) / parseBRNumber(d.views[i])) * 100 : 0).toFixed(2) },
                    ]}
                    data={lpData}
                    onUpdate={(metric, weekIndex, value) => actions.updateFwMetric('organic', 'landing', name, weekIndex, value, metric as 'leads'|'views')}
                    />
                );
                }}
            />

            <SectionTitle title="Origens de Tráfego (Orgânico)" subtitle="Gerencie as fontes de leads orgânicos por semana." />
            <DynamicListManager
                title="Origens de Tráfego"
                items={Object.keys(data.organic.sources)}
                onAdd={(name) => actions.addFwItem('sources', name)}
                onRemove={(name) => actions.removeFwItem('sources', name)}
                itemTypeLabel="origem"
                renderTable={(name) => (
                <PaidDataTable
                    title={`Leads - ${name}`}
                    rows={[
                        { key: 'leads', label: 'Leads', type: 'input' },
                    ]}
                    data={ { leads: data.organic.sources[name] } }
                    onUpdate={(metric, weekIndex, value) => actions.updateFwMetric('organic', 'sources', name, weekIndex, value)}
                />
                )}
            />

            <SectionTitle title="Pago" subtitle="Meta Ads e Google Ads — com Leads Planejados e Conquistados." />
            <div className="space-y-6">
                    <Card title="Meta Ads">
                        <PaidDataTable
                            rows={[
                                { key: 'investimento', label: 'Investimento (R$)', type: 'input', isCurrency: true },
                                { key: 'alcance', label: 'Alcance', type: 'input' },
                                { key: 'impressoes', label: 'Impressões', type: 'input' },
                                { key: 'cliques', label: 'Cliques', type: 'input' },
                                { key: 'ctr', label: 'CTR (%)', type: 'calculated', calculation: (d, i) => (parseBRNumber(d.impressoes[i]) > 0 ? (parseBRNumber(d.cliques[i]) / parseBRNumber(d.impressoes[i])) * 100 : 0).toFixed(2) },
                                { key: 'leadsPlan', label: 'Leads (Planejados)', type: 'input' },
                                { key: 'leads', label: 'Leads (Conquistados)', type: 'input' },
                                { key: 'cpl', label: 'CPL (R$)', type: 'calculated', isCurrency: true, calculation: (d, i) => (parseBRNumber(d.leads[i]) > 0 ? parseBRNumber(d.investimento[i]) / parseBRNumber(d.leads[i]) : 0) },
                            ]}
                            data={data.paid.meta}
                            onUpdate={(metric, weekIndex, value) => actions.updateFwMetric('paid', 'meta', metric, weekIndex, value)}
                        />
                    </Card>
                    <Card title="Google Ads">
                        <PaidDataTable
                            rows={[
                                { key: 'investimento', label: 'Investimento (R$)', type: 'input', isCurrency: true },
                                { key: 'alcance', label: 'Alcance', type: 'input' },
                                { key: 'impressoes', label: 'Impressões', type: 'input' },
                                { key: 'cliques', label: 'Cliques', type: 'input' },
                                { key: 'ctr', label: 'Taxa de Interação', type: 'calculated', calculation: (d, i) => (parseBRNumber(d.impressoes[i]) > 0 ? (parseBRNumber(d.cliques[i]) / parseBRNumber(d.impressoes[i])) * 100 : 0).toFixed(2) },
                                { key: 'cpc', label: 'CPC (R$)', type: 'calculated', isCurrency: true, calculation: (d, i) => (parseBRNumber(d.cliques[i]) > 0 ? parseBRNumber(d.investimento[i]) / parseBRNumber(d.cliques[i]) : 0) },
                                { key: 'leadsPlan', label: 'Leads (Planejados)', type: 'input' },
                                { key: 'leads', label: 'Leads (Conquistados)', type: 'input' },
                                { key: 'taxaConversao', label: 'Taxa de Conversão (%)', type: 'calculated', calculation: (d, i) => (parseBRNumber(d.cliques[i]) > 0 ? (parseBRNumber(d.leads[i]) / parseBRNumber(d.cliques[i])) * 100 : 0).toFixed(2) },
                                { key: 'cpl', label: 'CPL (R$)', type: 'calculated', isCurrency: true, calculation: (d, i) => (parseBRNumber(d.leads[i]) > 0 ? parseBRNumber(d.investimento[i]) / parseBRNumber(d.leads[i]) : 0) },
                            ]}
                            data={data.paid.google}
                            onUpdate={(metric, weekIndex, value) => actions.updateFwMetric('paid', 'google', metric, weekIndex, value)}
                        />
                    </Card>
                </div>

            <SectionTitle title="Pipeline Comercial" subtitle="Leads é preenchido automaticamente (orgânico + pago)." />
                <Card>
                    <PaidDataTable
                        rows={[
                            { key: 'leads', label: 'Leads (auto)', type: 'calculated', calculation: (d,i) => data.pipe.leads[i] },
                            { key: 'oportunidades', label: 'Oportunidades', type: 'input' },
                            { key: 'noShow', label: 'No Show', type: 'input' },
                            { key: 'perdidos', label: 'Perdidos', type: 'input' },
                            { key: 'vendas', label: 'Vendas', type: 'input' },
                            { key: 'cpo', label: 'CPO (R$)', type: 'calculated', isCurrency: true, calculation: (d,i) => (parseBRNumber(d.oportunidades[i]) > 0 ? (parseBRNumber(data.paid.meta.investimento[i]) + parseBRNumber(data.paid.google.investimento[i])) / parseBRNumber(d.oportunidades[i]) : 0) },
                            { key: 'cac', label: 'CAC (R$)', type: 'calculated', isCurrency: true, calculation: (d,i) => (parseBRNumber(d.vendas[i]) > 0 ? (parseBRNumber(data.paid.meta.investimento[i]) + parseBRNumber(data.paid.google.investimento[i])) / parseBRNumber(d.vendas[i]) : 0) },
                        ]}
                        data={data.pipe}
                        onUpdate={(metric, weekIndex, value) => actions.updateFwMetric('pipe', '', metric, weekIndex, value)}
                    />
                </Card>
        </div>
      ) : (
        <div className="animate-in fade-in zoom-in duration-300">
            <SectionTitle title="Dashboards" subtitle={isAnnualView ? "Visão anual, mês a mês." : "Visão semanal do mês atual."} />

            {isAnnualView ? (
                <Card title="Evolução Anual: Funil de Marketing e Vendas">
                    <div className="h-96">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={annualChartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                                <XAxis dataKey="name" stroke="#64748b" tick={{fontSize: 12}} />
                                <YAxis stroke="#64748b" tick={{fontSize: 12}} />
                                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)' }} />
                                <Legend />
                                <Line type="monotone" dataKey="alcance" name="Alcance" stroke="#8b5cf6" strokeWidth={2} dot={{r: 4}} />
                                <Line type="monotone" dataKey="cliques" name="Cliques" stroke="#34d399" strokeWidth={2} dot={{r: 4}} />
                                <Line type="monotone" dataKey="leads" name="Leads" stroke="#f59e0b" strokeWidth={2} dot={{r: 4}} />
                                <Line type="monotone" dataKey="oportunidades" name="Oportunidades" stroke="#ef4444" strokeWidth={2} dot={{r: 4}} />
                                <Line type="monotone" dataKey="vendas" name="Vendas" stroke="#3b82f6" strokeWidth={2} dot={{r: 4}} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            ) : (
                <div className="grid grid-cols-12 gap-6">
                    <ChartWrapper title="Investimento Semanal (Meta + Google)">
                        <BarChart data={weeklyChartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                            <XAxis dataKey="name" stroke="#64748b" tick={{fontSize: 12}} />
                            <YAxis stroke="#64748b" tickFormatter={(val) => `R$${val/1000}k`} tick={{fontSize: 12}} />
                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }} formatter={(value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)} cursor={{fill: '#1e293b', opacity: 0.5}} />
                            <Legend />
                            <Bar dataKey="investimentoMeta" name="Meta" stackId="a" fill="#8b5cf6" radius={[0, 0, 4, 4]} />
                            <Bar dataKey="investimentoGoogle" name="Google" stackId="a" fill="#34d399" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ChartWrapper>
                    <ChartWrapper title="CPL Semanal (Pago)">
                        <LineChart data={weeklyChartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                            <XAxis dataKey="name" stroke="#64748b" tick={{fontSize: 12}} />
                            <YAxis stroke="#64748b" tickFormatter={(val) => `R$${val}`} tick={{fontSize: 12}} />
                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }} formatter={(value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)} />
                            <Legend />
                            <Line type="monotone" dataKey="cpl" name="CPL" stroke="#f59e0b" strokeWidth={3} dot={{r: 4, fill: '#f59e0b', strokeWidth: 2, stroke:'#0f172a'}} />
                        </LineChart>
                    </ChartWrapper>
                    <ChartWrapper title="CPO Semanal">
                        <LineChart data={weeklyChartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                            <XAxis dataKey="name" stroke="#64748b" tick={{fontSize: 12}} />
                            <YAxis stroke="#64748b" tickFormatter={(val) => `R$${val}`} tick={{fontSize: 12}} />
                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }} formatter={(value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)} />
                            <Legend />
                            <Line type="monotone" dataKey="cpo" name="CPO" stroke="#ef4444" strokeWidth={3} dot={{r: 4, fill: '#ef4444', strokeWidth: 2, stroke:'#0f172a'}} />
                        </LineChart>
                    </ChartWrapper>
                    <ChartWrapper title="Lead x Oportunidade (Semanal)">
                        <ScatterChart>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                            <XAxis type="number" dataKey="leads" name="Leads" stroke="#64748b" tick={{fontSize: 12}} />
                            <YAxis type="number" dataKey="oportunidades" name="Oportunidades" stroke="#64748b" tick={{fontSize: 12}} />
                            <ZAxis type="number" range={[100]} />
                            <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}/>
                            <Legend/>
                            <Scatter name="Semanas" data={weeklyChartData} fill="#3b82f6"/>
                        </ScatterChart>
                    </ChartWrapper>
                    <Card title="Leads Planejados vs Conquistados" className="col-span-12">
                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={weeklyChartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                                    <XAxis dataKey="name" stroke="#64748b" tick={{fontSize: 12}} />
                                    <YAxis stroke="#64748b" tick={{fontSize: 12}} />
                                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }} />
                                    <Legend />
                                    <Line type="monotone" dataKey="leadsPlanejadosMeta" name="Meta Planejado" stroke="#a78bfa" strokeDasharray="5 5" strokeWidth={2} />
                                    <Line type="monotone" dataKey="leadsConquistadosMeta" name="Meta Conquistado" stroke="#8b5cf6" strokeWidth={2} />
                                    <Line type="monotone" dataKey="leadsPlanejadosGoogle" name="Google Planejado" stroke="#6ee7b7" strokeDasharray="5 5" strokeWidth={2} />
                                    <Line type="monotone" dataKey="leadsConquistadosGoogle" name="Google Conquistado" stroke="#34d399" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </div>
            )}
        </div>
      )}
    </div>
  );
};

export default FwView;
