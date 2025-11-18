
import React, { useState, useEffect } from 'react';
import Card from './Card';
import { DatabaseIcon } from './Icons';
import type { SupabaseConfig } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: SupabaseConfig | null) => void;
  currentConfig: SupabaseConfig | null;
  status: string;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSave, currentConfig, status }) => {
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');
  const [dashboardId, setDashboardId] = useState('main');

  useEffect(() => {
    if (currentConfig) {
      setUrl(currentConfig.url);
      setKey(currentConfig.key);
      setDashboardId(currentConfig.dashboardId);
    }
  }, [currentConfig]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!url || !key) {
        onSave(null); // Disconnect
    } else {
        onSave({ url, key, dashboardId });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-slate-800/50 px-6 py-4 border-b border-slate-700 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <DatabaseIcon className="text-violet-500" />
            Configurar Banco de Dados
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl">&times;</button>
        </div>
        <div className="p-6 space-y-4">
          <div className="text-sm text-slate-400 bg-slate-800/50 p-3 rounded border border-slate-700">
            Para permitir acesso multi-usuário, conecte um projeto do <a href="https://supabase.com" target="_blank" className="text-violet-400 underline">Supabase</a>.
            <br/>
            <span className="text-xs opacity-70 mt-1 block">Crie uma tabela chamada 'dashboards' com colunas 'id' (text) e 'content' (jsonb).</span>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Supabase Project URL</label>
            <input 
                type="text" 
                value={url} 
                onChange={e => setUrl(e.target.value)} 
                className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-white text-sm focus:ring-2 focus:ring-violet-500 outline-none"
                placeholder="https://xyz.supabase.co"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Supabase Anon Key</label>
            <input 
                type="password" 
                value={key} 
                onChange={e => setKey(e.target.value)} 
                className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-white text-sm focus:ring-2 focus:ring-violet-500 outline-none"
                placeholder="eyJh..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">ID do Dashboard (Opcional)</label>
            <input 
                type="text" 
                value={dashboardId} 
                onChange={e => setDashboardId(e.target.value)} 
                className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-white text-sm focus:ring-2 focus:ring-violet-500 outline-none"
                placeholder="main"
            />
          </div>
          
          {status === 'error' && (
              <div className="text-red-400 text-sm">Erro ao conectar ou salvar. Verifique as credenciais.</div>
          )}

          <div className="pt-4 flex gap-3">
            <button 
                onClick={handleSave}
                className="flex-1 bg-violet-600 hover:bg-violet-700 text-white py-2 rounded-md font-semibold transition shadow-lg shadow-violet-900/20"
            >
                Salvar Conexão
            </button>
             <button 
                onClick={() => { setUrl(''); setKey(''); handleSave(); }}
                className="px-4 py-2 text-slate-400 hover:text-red-400 transition text-sm"
            >
                Desconectar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
