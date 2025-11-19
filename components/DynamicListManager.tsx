
import React, { useState } from 'react';
import Card from './Card';
import { PlusIcon, TrashIcon } from './Icons';

interface DynamicListManagerProps {
  title: string;
  items: string[];
  onAdd: (name: string) => void;
  onRemove: (name: string) => void;
  renderTable?: (name: string) => React.ReactNode;
  itemTypeLabel: string;
  pillsOnly?: boolean;
}

// Components defined outside to maintain focus stability
const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input {...props} className={`bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-sm text-slate-200 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition w-full ${props.className}`} />
);

const Button = (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button {...props} className={`px-3 py-2 text-sm font-semibold rounded-md flex items-center gap-2 transition bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-900/50 whitespace-nowrap ${props.className}`} />
);

const Pill: React.FC<{name: string; onRemove: (name: string) => void}> = ({name, onRemove}) => (
  <div className="bg-slate-700 text-slate-200 text-sm px-3 py-1 rounded-full flex items-center gap-2">
    <span>{name}</span>
    <button onClick={() => onRemove(name)} className="text-slate-400 hover:text-white">
      <TrashIcon className="w-3 h-3" />
    </button>
  </div>
);

const DynamicListManager: React.FC<DynamicListManagerProps> = ({
  title,
  items,
  onAdd,
  onRemove,
  renderTable,
  itemTypeLabel,
  pillsOnly = false,
}) => {
  const [newItem, setNewItem] = useState('');

  const handleAdd = () => {
    if (newItem.trim()) {
      onAdd(newItem.trim());
      setNewItem('');
    }
  };

  return (
    <Card title={pillsOnly ? undefined : title}>
      {pillsOnly && <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>}
      <div className="flex gap-2 mb-4">
        <Input
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder={`Nova ${itemTypeLabel}`}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <Button onClick={handleAdd}><PlusIcon/> Adicionar</Button>
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        {items.map((item) => <Pill key={item} name={item} onRemove={onRemove} />)}
      </div>
      {!pillsOnly && renderTable && (
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item}>{renderTable(item)}</div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default DynamicListManager;
