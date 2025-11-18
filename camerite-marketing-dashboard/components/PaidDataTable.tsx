
import React from 'react';
import { WEEK_LABELS } from '../constants';
import { parseBRNumber, sum, formatCurrency, formatNumber } from '../utils/helpers';

type RowType = 'input' | 'calculated';

interface RowConfig {
  key: string;
  label: string;
  type: RowType;
  isCurrency?: boolean;
  calculation?: (data: any, weekIndex: number) => number | string;
}

interface PaidDataTableProps {
  title?: string;
  rows: RowConfig[];
  data: any;
  onUpdate: (metric: string, weekIndex: number, value: string | number) => void;
}

const PaidDataTable: React.FC<PaidDataTableProps> = ({ title, rows, data, onUpdate }) => {
  return (
    <div>
        {title && <h4 className="text-md font-semibold text-slate-300 mb-2">{title}</h4>}
        <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
            <thead className="bg-slate-700/50">
            <tr>
                <th className="px-4 py-2 font-semibold text-slate-300 rounded-tl-lg">Métrica</th>
                {WEEK_LABELS.map((label) => <th key={label} className="px-4 py-2 font-semibold text-slate-300 text-center">{label}</th>)}
                <th className="px-4 py-2 font-semibold text-slate-300 rounded-tr-lg text-center">Total</th>
            </tr>
            </thead>
            <tbody>
            {rows.map((row, rowIndex) => {
                const weeklyValues = WEEK_LABELS.map((_, i) => {
                    if (row.type === 'calculated' && row.calculation) {
                        return row.calculation(data, i);
                    }
                    return data[row.key] ? data[row.key][i] : 0;
                });

                const total = sum(weeklyValues);
                
                return (
                <tr key={row.key} className="border-b border-slate-700 last:border-0">
                    <td className="px-4 py-2 font-medium text-slate-400 whitespace-nowrap">{row.label}</td>
                    {WEEK_LABELS.map((_, i) => (
                    <td key={i} className="px-4 py-2">
                        {row.type === 'input' ? (
                        <input
                            type="text"
                            value={data[row.key] ? data[row.key][i] : ''}
                            onChange={(e) => onUpdate(row.key, i, e.target.value)}
                            className="w-24 bg-slate-700 border border-slate-600 rounded-md px-2 py-1 text-sm text-slate-200 text-right focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition"
                        />
                        ) : (
                            <div className="w-24 text-right px-2 py-1 text-slate-300">
                                {row.isCurrency ? formatCurrency(parseBRNumber(weeklyValues[i])) : (typeof weeklyValues[i] === 'number' ? formatNumber(weeklyValues[i]) : weeklyValues[i])}
                            </div>
                        )}
                    </td>
                    ))}
                    <td className="px-4 py-2 font-bold text-slate-200 text-right">
                        {row.isCurrency ? formatCurrency(total) : formatNumber(total)}
                    </td>
                </tr>
                );
            })}
            </tbody>
        </table>
        </div>
    </div>
  );
};

export default PaidDataTable;
