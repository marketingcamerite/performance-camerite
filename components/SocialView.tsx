
import React, { useState } from 'react';
import type { SocialMonth } from '../types';
import Card from './Card';
import DynamicListManager from './DynamicListManager';
import PaidDataTable from './PaidDataTable';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { WEEK_LABELS } from '../constants';
import { parseBRNumber } from '../utils/helpers';


interface SocialViewProps {
  data: SocialMonth;
  onUpdate: (network: string, metric: string, weekIndex: number, value: string) => void;
  onAddNetwork: (name: string) => void;
  onRemoveNetwork: (name: string) => void;
  onAddMetric: (name: string) => void;
  onRemoveMetric: (name: string) => void;
}

const SocialView: React.FC<SocialViewProps> = ({ data, onUpdate, onAddNetwork, onRemoveNetwork, onAddMetric, onRemoveMetric }) => {
  const [selectedNetwork, setSelectedNetwork] = useState(Object.keys(data.networks)[0] || '');
  const [selectedMetric, setSelectedMetric] = useState(data.metrics[0] || '');

  React.useEffect(() => {
      if (!selectedNetwork && Object.keys(data.networks).length > 0) {
          setSelectedNetwork(Object.keys(data.networks)[0]);
      }
       if (!selectedMetric && data.metrics.length > 0) {
          setSelectedMetric(data.metrics[0]);
      }
  }, [data, selectedNetwork, selectedMetric]);
  
  const chartData = WEEK_LABELS.map((name, i) => {
    const networkData = data.networks[selectedNetwork];
    const value = networkData && networkData[selectedMetric] ? networkData[selectedMetric][i] : 0;
    return {
      name,
      value: parseBRNumber(value),
    };
  });
  
  const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => (
    <select {...props} className={`bg-slate-700/80 border border-slate-600 rounded-md px-3 py-2 text-sm text-slate-200 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition ${props.className}`} />
  );

  return (
    <div className="space-y-8">
      <Card title="Gerenciar Redes e Métricas">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DynamicListManager
                title="Redes Sociais"
                items={Object.keys(data.networks)}
                onAdd={onAddNetwork}
                onRemove={onRemoveNetwork}
                itemTypeLabel="rede"
                pillsOnly
            />
            <DynamicListManager
                title="Métricas"
                items={data.metrics}
                onAdd={onAddMetric}
                onRemove={onRemoveMetric}
                itemTypeLabel="métrica"
                pillsOnly
            />
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(data.networks).map(([networkName, networkData]) => (
              <Card title={networkName} key={networkName}>
                  <PaidDataTable
                    rows={data.metrics.map(m => ({ key: m, label: m, type: 'input' }))}
                    data={networkData}
                    onUpdate={(metric, weekIndex, value) => onUpdate(networkName, metric, weekIndex, value as string)}
                  />
              </Card>
          ))}
      </div>
      
      <Card title="Dashboard Social">
          <div className="flex gap-4 mb-4">
              <Select value={selectedNetwork} onChange={e => setSelectedNetwork(e.target.value)}>
                  {Object.keys(data.networks).map(n => <option key={n} value={n}>{n}</option>)}
              </Select>
              <Select value={selectedMetric} onChange={e => setSelectedMetric(e.target.value)}>
                  {data.metrics.map(m => <option key={m} value={m}>{m}</option>)}
              </Select>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                <Legend />
                <Line type="monotone" dataKey="value" name={`${selectedNetwork} - ${selectedMetric}`} stroke="#8b5cf6" />
              </LineChart>
            </ResponsiveContainer>
          </div>
      </Card>

    </div>
  );
};

export default SocialView;
