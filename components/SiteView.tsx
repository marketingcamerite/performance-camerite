
import React, { useState } from 'react';
import type { SiteMonth, SitePageRegistryItem, SitePageValues } from '../types';
import Card from './Card';
import DynamicListManager from './DynamicListManager';
import PaidDataTable from './PaidDataTable';
import { EyeIcon, EyeOffIcon } from './Icons';
import { formatNumber, sum, parseBRNumber, filterActiveWeeks } from '../utils/helpers';
import { WEEK_LABELS, MONTHS, ZEROS_5 } from '../constants';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

interface SiteViewProps {
  data: SiteMonth;
  registry: SitePageRegistryItem[]; // Receive Global Registry
  isAnnualView: boolean;
  fullYearData: SiteMonth[];
  actions: any;
}

const tooltipStyle = {
  backgroundColor: '#0f172a',
  border: '1px solid #1e293b',
  borderRadius: '8px',
  color: '#f1f5f9',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)'
};
const tooltipItemStyle = { color: '#cbd5e1' };

const MonthlyInput: React.FC<{
  label: string; 
  value: string | number; 
  onChange: (val: string) => void; 
  suffix?: string
}> = ({ label, value, onChange, suffix }) => (
    <div className="flex flex-col gap-1">
        <label className="text-xs text-slate-400 font-medium uppercase tracking-wider">{label}</label>
        <div className="relative">
            <input 
                type="text" 
                inputMode="decimal"
                value={value} 
                onChange={(e) => {
                     const val = e.target.value;
                     if (val === '' || /^[0-9.,]+$/.test(val)) onChange(val);
                }}
                className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-white text-lg font-bold focus:ring-2 focus:ring-violet-500 outline-none"
            />
            {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">{suffix}</span>}
        </div>
    </div>
);

const SiteView: React.FC<SiteViewProps> = ({ data, registry, isAnnualView, fullYearData, actions }) => {
  const [viewMode, setViewMode] = useState<'dashboard' | 'data'>('dashboard');
  const [showHidden, setShowHidden] = useState(false);

  if (!data) return null;

  // Helper to safely get page data or default to zeros
  const getPageData = (name: string): SitePageValues => {
      return data.pages[name] || { views: ZEROS_5(), unique: ZEROS_5() };
  };

  // --- CHART PREP ---
  // Weekly aggregation
  const rawWeeklyData = WEEK_LABELS.map((label, i) => {
      let totalViews = 0;
      let totalUnique = 0;

      // Sum active pages from Registry
      registry.forEach(page => {
          if (!page.isHidden) {
              const pData = getPageData(page.name);
              totalViews += parseBRNumber(pData.views[i]);
              totalUnique += parseBRNumber(pData.unique[i]);
          }
      });
      
      return {
          name: label,
          views: totalViews,
          unique: totalUnique
      };
  });

  const weeklyData = filterActiveWeeks(rawWeeklyData, ['views', 'unique']);

  // Top Pages (Current Month Total)
  const topPagesData = registry
      .filter(p => !p.isHidden)
      .map(p => ({
          name: p.name,
          totalViews: sum(getPageData(p.name).views)
      }))
      .filter(p => p.totalViews > 0) // Only show pages with views
      .sort((a, b) => b.totalViews - a.totalViews)
      .slice(0, 5);

  // Annual Data (Uses Monthly KPIs)
  const annualData = MONTHS.map((m, i) => {
      const mData = fullYearData[i];
      return {
          name: m.substring(0, 3),
          visitors: mData ? parseBRNumber(mData.kpis.visitors) : 0,
          unique: mData ? parseBRNumber(mData.kpis.unique) : 0
      };
  });

  const KpiCard: React.FC<{ title: string; value: string; subtext?: string }> = ({ title, value, subtext }) => (
    <div className="bg-slate-800/50 p-4 rounded-lg flex-1 min-w-[160px]">
        <div className="text-sm text-slate-400 mb-1">{title}</div>
        <div className="text-2xl font-bold text-white">{value}</div>
        {subtext && <div className="text-xs text-slate-500 mt-1">{subtext}</div>}
    </div>
  );

  // FILTER LOGIC FOR PAGES LIST
  // If showHidden is false, we filter out hidden pages from the list passed to DynamicListManager
  const visiblePageNames = registry
      .filter(p => showHidden || !p.isHidden)
      .map(p => p.name);

  return (
    <div className="space-y-8 pb-10">
      
      {/* Mode Toggle */}
      <div className="flex justify-center mb-8">
        <div className="bg-slate-900 p-1.5 rounded-full border border-slate-800 flex gap-1">
            <button
                onClick={() => setViewMode('dashboard')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${viewMode === 'dashboard' ? 'bg-violet-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
                Dashboard
            </button>
            <button
                onClick={() => setViewMode('data')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${viewMode === 'data' ? 'bg-violet-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
                Dados
            </button>
        </div>
      </div>

      {viewMode === 'data' ? (
        <div className="animate-in fade-in zoom-in duration-300 space-y-8">
            <Card title="KPIs Mensais Totais (Verdade Absoluta)">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <MonthlyInput 
                        label="Visitantes (Sessões)" 
                        value={data.kpis.visitors} 
                        onChange={(v) => actions.updateSiteKpi('visitors', v)} 
                    />
                    <MonthlyInput 
                        label="Visitantes Únicos" 
                        value={data.kpis.unique} 
                        onChange={(v) => actions.updateSiteKpi('unique', v)} 
                    />
                    <MonthlyInput 
                        label="Taxa de Rejeição" 
                        value={data.kpis.bounceRate} 
                        onChange={(v) => actions.updateSiteKpi('bounceRate', v)} 
                        suffix="%"
                    />
                    <MonthlyInput 
                        label="Tempo Médio" 
                        value={data.kpis.avgTime} 
                        onChange={(v) => actions.updateSiteKpi('avgTime', v)} 
                        suffix="min"
                    />
                </div>
            </Card>

            <DynamicListManager
                title="Origens de Tráfego (Semanal)"
                items={Object.keys(data.sources)}
                onAdd={(name) => actions.addSiteItem('source', name)}
                onRemove={(name) => actions.removeSiteItem('source', name)}
                itemTypeLabel="Origem"
                renderTable={(name) => (
                    <div className="mt-6 mb-2">
                        {/* Title Logic Added */}
                        <div className="flex items-center gap-2 mb-2 pl-2 border-l-2 border-violet-500">
                             <h4 className="font-bold text-slate-200 text-lg">{name}</h4>
                        </div>
                        <PaidDataTable 
                            rows={[{ key: 'visitors', label: 'Visitantes', type: 'input' }]}
                            data={{ visitors: data.sources[name] }}
                            onUpdate={(_, w, v) => actions.updateSiteSource(name, w, v)}
                        />
                    </div>
                )}
            />

            <div className="relative">
                <div className="flex justify-between items-center mb-2">
                     <h3 className="text-xl font-bold text-white">Páginas do Site</h3>
                     <button 
                        onClick={() => setShowHidden(!showHidden)}
                        className="flex items-center gap-2 text-xs text-slate-400 hover:text-violet-400 transition"
                     >
                         {showHidden ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                         {showHidden ? 'Ocultar inativos' : 'Mostrar ocultos'}
                     </button>
                </div>
                
                <DynamicListManager
                    title=""
                    // Pass filtered items based on showHidden state
                    items={visiblePageNames} 
                    onAdd={(name) => actions.addSiteItem('page', name)}
                    onRemove={(name) => actions.removeSiteItem('page', name)} // Removes from Registry (Permanent)
                    itemTypeLabel="Página"
                    renderTable={(name) => {
                        const pageDef = registry.find(p => p.name === name);
                        if (!pageDef) return null; 

                        // Safely get data (or init virtual zeroed data)
                        const pageValues = getPageData(name);

                        return (
                            <div className={`transition-all mt-4 ${pageDef.isHidden ? 'opacity-50 grayscale border-l-2 border-red-500 pl-4 bg-red-900/5 rounded-r-lg pr-2 py-2' : ''}`}>
                                <div className="flex items-center gap-2 mb-2">
                                    <h4 className="font-semibold text-slate-300 text-lg">{name}</h4>
                                    <button 
                                        onClick={() => actions.toggleSitePageVisibility(name)}
                                        title={pageDef.isHidden ? "Reativar página" : "Ocultar página (Global)"}
                                        className="text-slate-500 hover:text-violet-400"
                                    >
                                        {pageDef.isHidden ? <EyeOffIcon /> : <EyeIcon />}
                                    </button>
                                    {pageDef.isHidden && <span className="text-xs text-red-400 font-bold tracking-wide uppercase">(Inativo)</span>}
                                </div>
                                <PaidDataTable 
                                    rows={[
                                        { key: 'views', label: 'Pageviews', type: 'input' },
                                        { key: 'unique', label: 'Únicas', type: 'input' }
                                    ]}
                                    data={pageValues}
                                    onUpdate={(metric, w, v) => actions.updateSitePageMetric(name, metric as 'views'|'unique', w, v)}
                                />
                            </div>
                        );
                    }}
                />
            </div>

        </div>
      ) : (
        <div className="animate-in fade-in zoom-in duration-300 space-y-8">
             <div className="flex gap-4 flex-wrap">
                <KpiCard title="Visitantes (Mês)" value={formatNumber(parseBRNumber(data.kpis.visitors))} />
                <KpiCard title="Visitantes Únicos" value={formatNumber(parseBRNumber(data.kpis.unique))} />
                <KpiCard title="Rejeição" value={`${parseBRNumber(data.kpis.bounceRate)}%`} />
                <KpiCard title="Tempo Médio" value={`${parseBRNumber(data.kpis.avgTime)}m`} />
             </div>

             {isAnnualView ? (
                 <Card title="Evolução Anual de Tráfego">
                    <div className="h-96">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={annualData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                                <XAxis dataKey="name" stroke="#64748b" />
                                <YAxis stroke="#64748b" />
                                <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} />
                                <Legend />
                                <Line type="monotone" dataKey="visitors" name="Visitantes" stroke="#8b5cf6" strokeWidth={2} dot={{r:4}} />
                                <Line type="monotone" dataKey="unique" name="Únicos" stroke="#34d399" strokeWidth={2} dot={{r:4}} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                 </Card>
             ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <Card title="Evolução Semanal (Páginas Ativas)">
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={weeklyData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                                    <XAxis dataKey="name" stroke="#64748b" />
                                    <YAxis stroke="#64748b" />
                                    <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} />
                                    <Legend />
                                    <Line type="monotone" dataKey="views" name="Pageviews" stroke="#8b5cf6" strokeWidth={2} />
                                    <Line type="monotone" dataKey="unique" name="Únicas" stroke="#34d399" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                     </Card>

                     <Card title="Top 5 Páginas (Views)">
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart layout="vertical" data={topPagesData} margin={{ left: 40 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                                    <XAxis type="number" stroke="#64748b" />
                                    <YAxis type="category" dataKey="name" stroke="#64748b" width={100} />
                                    <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} cursor={{fill: '#1e293b', opacity: 0.5}} />
                                    <Bar dataKey="totalViews" name="Views" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                                </BarChart>
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

export default SiteView;
