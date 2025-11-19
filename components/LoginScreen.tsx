
import React, { useState, useEffect } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { LogoIcon } from './Icons';
import type { SupabaseConfig } from '../types';

interface LoginScreenProps {
  onSetup: (config: SupabaseConfig) => void;
  supabase: SupabaseClient | null;
  isLoading: boolean;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onSetup, supabase, isLoading }) => {
  const [step, setStep] = useState<'setup' | 'login'>('setup');
  
  // Setup States
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');
  
  // Login States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
      // Se já existe uma instância do supabase (configurada), vai direto para login
      if (supabase) {
          setStep('login');
      }
  }, [supabase]);

  const handleSetupSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!url || !key) {
          setError('Preencha todos os campos.');
          return;
      }
      try {
        // Salva e inicializa
        onSetup({ url, key, dashboardId: 'default' });
        setStep('login');
        setError('');
      } catch (e) {
          setError('Configuração inválida.');
      }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!supabase) return;
      
      setIsLoggingIn(true);
      setError('');
      
      try {
          const { data, error } = await supabase.auth.signInWithPassword({
              email,
              password,
          });
          
          if (error) throw error;
          // O App.tsx detectará a mudança de sessão automaticamente
      } catch (err: any) {
          console.error(err);
          setError('Email ou senha incorretos.');
      } finally {
          setIsLoggingIn(false);
      }
  };

  const resetConfig = () => {
      localStorage.removeItem('supabase_config');
      window.location.reload();
  };

  if (isLoading) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
       {/* Animated Background */}
       <div className="absolute inset-0 z-0">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px]"></div>
       </div>

       <div className="z-10 w-full max-w-md">
           <div className="text-center mb-8">
               <div className="inline-block p-4 rounded-2xl bg-slate-900/50 border border-slate-800 mb-4 shadow-2xl shadow-violet-500/10">
                    <div className="transform scale-150"><LogoIcon /></div>
               </div>
               <h1 className="text-3xl font-bold text-white tracking-tight">Camerite <span className="text-slate-500 font-light">Analytics</span></h1>
               <p className="text-slate-400 mt-2">Painel de inteligência de marketing.</p>
           </div>

           <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl">
               {step === 'setup' ? (
                   <form onSubmit={handleSetupSubmit} className="space-y-4">
                       <h2 className="text-xl font-semibold text-white mb-6">Configuração Inicial</h2>
                       <div className="p-3 bg-blue-900/20 border border-blue-800/50 rounded-lg text-xs text-blue-200">
                           Insira as credenciais do seu projeto Supabase para conectar o aplicativo.
                       </div>
                       <div>
                           <label className="block text-sm font-medium text-slate-300 mb-1.5">Project URL</label>
                           <input 
                               type="text" 
                               value={url}
                               onChange={e => setUrl(e.target.value)}
                               placeholder="https://xyz.supabase.co"
                               className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition"
                           />
                       </div>
                       <div>
                           <label className="block text-sm font-medium text-slate-300 mb-1.5">Anon Key</label>
                           <input 
                               type="password" 
                               value={key}
                               onChange={e => setKey(e.target.value)}
                               placeholder="eyJh..."
                               className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition"
                           />
                       </div>
                       {error && <p className="text-red-400 text-sm">{error}</p>}
                       <button type="submit" className="w-full bg-violet-600 hover:bg-violet-500 text-white font-semibold py-3 rounded-lg transition shadow-lg shadow-violet-900/20">
                           Conectar Projeto
                       </button>
                   </form>
               ) : (
                   <div className="space-y-6">
                       <form onSubmit={handleLoginSubmit} className="space-y-4">
                           <h2 className="text-xl font-semibold text-white">Acessar Painel</h2>
                           <p className="text-sm text-slate-400">Entre com suas credenciais de acesso.</p>
                           
                           <div>
                               <label className="block text-sm font-medium text-slate-300 mb-1.5">E-mail</label>
                               <input 
                                   type="email" 
                                   value={email}
                                   onChange={e => setEmail(e.target.value)}
                                   placeholder="usuario@camerite.com"
                                   className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition"
                                   required
                               />
                           </div>

                           <div>
                               <label className="block text-sm font-medium text-slate-300 mb-1.5">Senha</label>
                               <input 
                                   type="password" 
                                   value={password}
                                   onChange={e => setPassword(e.target.value)}
                                   placeholder="••••••••"
                                   className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition"
                                   required
                               />
                           </div>
                           
                           {error && <p className="text-red-400 text-sm bg-red-900/20 p-2 rounded border border-red-900/50">{error}</p>}
                           
                           <button 
                                type="submit" 
                                disabled={isLoggingIn}
                                className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-semibold py-3 rounded-lg transition shadow-lg shadow-emerald-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                            >
                               {isLoggingIn ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : 'Entrar'}
                           </button>
                       </form>
                       
                       <div className="pt-4 border-t border-slate-800 text-center">
                           <button onClick={resetConfig} className="text-xs text-slate-600 hover:text-slate-400 transition">
                               Alterar Projeto Supabase
                           </button>
                       </div>
                   </div>
               )}
           </div>
       </div>
    </div>
  );
};

export default LoginScreen;
