
import React, { useState, useEffect } from 'react';
import { DatabaseIcon } from './Icons';
import type { SupabaseConfig } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (config: SupabaseConfig | null, credentials?: {email: string, password: string}) => Promise<void>;
  onDisconnect: () => void;
  currentConfig: SupabaseConfig | null;
  isConnected: boolean;
  userEmail?: string;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ 
    isOpen, 
    onClose, 
    onConnect, 
    onDisconnect,
    currentConfig, 
    isConnected, 
    userEmail 
}) => {
  const [step, setStep] = useState<'config' | 'login'>('config');
  
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
            setStep('login');
        } else {
            setUrl('');
            setKey('');
            setStep('config');
        }
        setError('');
        setIsLoading(false);
    }
  }, [isOpen, currentConfig]);

  if (!isOpen) return null;

  const handleConfigSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if(!url.trim() || !key.trim()){
          setError('Preencha a URL e a Chave do projeto.');
          return;
      }
      setError('');
      setStep('login');
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
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

  const handleBackToConfig = () => {
      setStep('config');
      setError('');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-slate-800/50 px-6 py-4 border-b border-slate-700 flex justify-between items-center shrink-0">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <DatabaseIcon className="text-violet-500" />
            {isConnected ? 'Conta Conectada' : (step === 'config' ? 'Configurar Projeto' : 'Fazer Login')}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl leading-none">&times;</button>
        </div>
        
        <div className="p-6 overflow-y-auto">
            {isConnected ? (
                 <div className="flex flex-col items-center justify-center py-4 space-y-6">
                     <div className="w-20 h-20 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-full flex items-center justify-center shadow-lg shadow-violet-900/30">
                         <span className="text-3xl font-bold text-white">{userEmail?.charAt(0).toUpperCase()}</span>
                     </div>
                     <div className="text-center">
                         <p className="text-slate-400 text-sm uppercase tracking-wide font-semibold">Logado como</p>
                         <p className="text-xl text-white font-medium mt-1">{userEmail}</p>
                     </div>
                     <div className="flex items-center gap-2 text-sm text-emerald-400 bg-emerald-900/10 px-4 py-2 rounded-full border border-emerald-900/30">
                         <span className="relative flex h-2 w-2">
                           <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                           <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                         </span>
                         Online
                     </div>
                     
                     <div className="w-full max-w-xs pt-6 border-t border-slate-800">
                         <button 
                            onClick={onDisconnect}
                            className="w-full py-3 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg transition flex items-center justify-center gap-2"
                         >
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                             Desconectar e Sair
                         </button>
                         <p className="text-xs text-slate-500 text-center mt-3">Remove as credenciais deste dispositivo.</p>
                     </div>
                 </div>
            ) : (
                <>
                    {step === 'config' ? (
                        <form onSubmit={handleConfigSubmit} className="space-y-4 animate-in slide-in-from-left-4 fade-in duration-300">
                            <div className="p-3 bg-slate-800/50 border border-slate-700 rounded-lg mb-4">
                                <p className="text-sm text-slate-300">Insira as credenciais do seu projeto Supabase para habilitar a conexão.</p>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase">Project URL</label>
                                <input 
                                    type="text" 
                                    value={url} 
                                    onChange={e => setUrl(e.target.value)} 
                                    className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2.5 text-white text-sm focus:ring-2 focus:ring-violet-500 outline-none font-mono"
                                    placeholder="https://seu-projeto.supabase.co"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase">Anon Key</label>
                                <input 
                                    type="password" 
                                    value={key} 
                                    onChange={e => setKey(e.target.value)} 
                                    className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2.5 text-white text-sm focus:ring-2 focus:ring-violet-500 outline-none font-mono"
                                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                                />
                            </div>
                            
                            {error && <p className="text-red-400 text-xs mt-2">{error}</p>}

                            <button 
                                type="submit"
                                className="w-full bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg font-bold transition mt-2"
                            >
                                Continuar
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleLoginSubmit} className="space-y-4 animate-in slide-in-from-right-4 fade-in duration-300">
                             <div className="flex items-center justify-between mb-2">
                                 <h4 className="text-sm text-slate-400">Credenciais de Usuário</h4>
                                 <button type="button" onClick={handleBackToConfig} className="text-xs text-violet-400 hover:text-violet-300">
                                     Alterar Projeto
                                 </button>
                             </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase">E-mail</label>
                                <input 
                                    type="email" 
                                    value={email} 
                                    onChange={e => setEmail(e.target.value)} 
                                    className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2.5 text-white text-sm focus:ring-2 focus:ring-violet-500 outline-none"
                                    placeholder="seu@email.com"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase">Senha</label>
                                <input 
                                    type="password" 
                                    value={password} 
                                    onChange={e => setPassword(e.target.value)} 
                                    className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2.5 text-white text-sm focus:ring-2 focus:ring-violet-500 outline-none"
                                    placeholder="••••••••"
                                />
                            </div>

                            {error && (
                                <div className="text-red-400 text-xs bg-red-900/20 p-3 rounded border border-red-900/50 mt-2">
                                    {error}
                                </div>
                            )}

                            <button 
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-violet-600 hover:bg-violet-500 text-white py-3 rounded-lg font-bold transition shadow-lg shadow-violet-900/20 flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                            >
                                {isLoading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : 'Entrar'}
                            </button>
                        </form>
                    )}
                </>
            )}
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
