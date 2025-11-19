
import React, { useState, useEffect } from 'react';
import { DatabaseIcon } from './Icons';
import type { SupabaseConfig } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (config: SupabaseConfig | null, credentials?: {email: string, password: string}) => Promise<void>;
  currentConfig: SupabaseConfig | null;
  isConnected: boolean;
  userEmail?: string;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onConnect, currentConfig, isConnected, userEmail }) => {
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
        if (currentConfig) {
            setUrl(currentConfig.url);
            setKey(currentConfig.key);
        }
        setError('');
        setIsLoading(false);
    }
  }, [isOpen, currentConfig]);

  if (!isOpen) return null;

  const handleConnect = async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      setIsLoading(true);
      
      try {
          if (!url || !key || !email || !password) {
              throw new Error("Preencha todos os campos.");
          }

          await onConnect(
              { url, key, dashboardId: 'main' },
              { email, password }
          );
          onClose();
      } catch (err: any) {
          console.error(err);
          setError(err.message || "Erro ao conectar. Verifique credenciais.");
      } finally {
          setIsLoading(false);
      }
  };

  const handleDisconnect = () => {
      onConnect(null);
      onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-slate-800/50 px-6 py-4 border-b border-slate-700 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <DatabaseIcon className="text-violet-500" />
            {isConnected ? 'Conta Conectada' : 'Conectar Supabase'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl">&times;</button>
        </div>
        
        <div className="p-6">
            {isConnected ? (
                 <div className="text-center space-y-4">
                     <div className="w-16 h-16 bg-violet-600/20 rounded-full flex items-center justify-center mx-auto">
                         <span className="text-2xl font-bold text-violet-400">{userEmail?.charAt(0).toUpperCase()}</span>
                     </div>
                     <div>
                         <p className="text-slate-400 text-sm">Logado como</p>
                         <p className="text-white font-medium">{userEmail}</p>
                     </div>
                     <div className="text-xs text-emerald-400 bg-emerald-900/20 p-2 rounded border border-emerald-900/50">
                         Sincronização automática ativa
                     </div>
                     <button 
                        onClick={handleDisconnect}
                        className="w-full py-2 px-4 border border-red-900/50 text-red-400 hover:bg-red-900/20 rounded-lg transition text-sm"
                     >
                         Desconectar e usar Offline
                     </button>
                 </div>
            ) : (
                <form onSubmit={handleConnect} className="space-y-4">
                    <div className="text-sm text-slate-400 bg-slate-800/50 p-3 rounded border border-slate-700 mb-4">
                        Insira os dados do seu projeto Supabase e suas credenciais de acesso.
                    </div>

                    <div className="space-y-3">
                        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Projeto</h4>
                        <input 
                            type="text" 
                            value={url} 
                            onChange={e => setUrl(e.target.value)} 
                            className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-white text-sm focus:ring-2 focus:ring-violet-500 outline-none"
                            placeholder="Project URL"
                        />
                        <input 
                            type="password" 
                            value={key} 
                            onChange={e => setKey(e.target.value)} 
                            className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-white text-sm focus:ring-2 focus:ring-violet-500 outline-none"
                            placeholder="Anon Key"
                        />
                    </div>

                    <div className="space-y-3 pt-2 border-t border-slate-800">
                        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Autenticação</h4>
                        <input 
                            type="email" 
                            value={email} 
                            onChange={e => setEmail(e.target.value)} 
                            className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-white text-sm focus:ring-2 focus:ring-violet-500 outline-none"
                            placeholder="E-mail"
                        />
                         <input 
                            type="password" 
                            value={password} 
                            onChange={e => setPassword(e.target.value)} 
                            className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-white text-sm focus:ring-2 focus:ring-violet-500 outline-none"
                            placeholder="Senha"
                        />
                    </div>
                    
                    {error && (
                        <div className="text-red-400 text-xs bg-red-900/20 p-2 rounded border border-red-900/50">
                            {error}
                        </div>
                    )}

                    <button 
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-violet-600 hover:bg-violet-700 text-white py-2.5 rounded-lg font-semibold transition shadow-lg shadow-violet-900/20 flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : 'Conectar e Entrar'}
                    </button>
                </form>
            )}
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
