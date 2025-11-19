
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import SegmentTabs from './components/SegmentTabs';
import FwView from './components/FwView';
import SocialView from './components/SocialView';
import SettingsModal from './components/SettingsModal';
import useDashboardState from './hooks/useDashboardState';
import { SEGMENTS } from './constants';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Segment, FWMonth, SocialMonth, SupabaseConfig } from './types';

const App: React.FC = () => {
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [session, setSession] = useState<any>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Tenta recuperar sessão existente silenciosamente ou configuração salva, mas não bloqueia
  useEffect(() => {
    const initAuth = async () => {
      const storedConfig = localStorage.getItem('supabase_config');
      if (storedConfig) {
        try {
          const config: SupabaseConfig = JSON.parse(storedConfig);
          const client = createClient(config.url, config.key);
          setSupabase(client);

          const { data: { session } } = await client.auth.getSession();
          setSession(session);

          const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
            setSession(session);
          });
          
          return () => subscription.unsubscribe();
        } catch (e) {
          console.error("Erro ao inicializar Supabase em background", e);
        }
      }
    };
    initAuth();
  }, []);

  const handleConnect = async (config: SupabaseConfig | null, credentials?: {email: string, password: string}) => {
    if (!config) {
        // Desconectar
        if (supabase) await supabase.auth.signOut();
        localStorage.removeItem('supabase_config');
        setSupabase(null);
        setSession(null);
        return;
    }

    try {
        const client = createClient(config.url, config.key);
        
        if (credentials) {
            const { data, error } = await client.auth.signInWithPassword({
                email: credentials.email,
                password: credentials.password
            });
            if (error) throw error;
            setSession(data.session);
        }
        
        setSupabase(client);
        localStorage.setItem('supabase_config', JSON.stringify(config));
    } catch (error) {
        console.error("Connection error", error);
        throw error; // Propaga para o modal exibir erro
    }
  };

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
      setSession(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-violet-500/30 selection:text-violet-200">
      {/* Background Ambient Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-900/20 rounded-full blur-[120px] animate-pulse" style={{animationDuration: '8s'}}></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-900/20 rounded-full blur-[120px] animate-pulse" style={{animationDuration: '10s'}}></div>
      </div>

      <DashboardContent 
        supabase={supabase} 
        session={session} 
        onLogout={handleLogout}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onConnect={handleConnect}
        currentConfig={localStorage.getItem('supabase_config') ? JSON.parse(localStorage.getItem('supabase_config')!) : null}
        isConnected={!!session}
        userEmail={session?.user?.email}
      />
    </div>
  );
};

// Componente do Dashboard
const DashboardContent: React.FC<{
  supabase: SupabaseClient | null;
  session: any;
  onLogout: () => void;
  onOpenSettings: () => void;
}> = ({ supabase, session, onLogout, onOpenSettings }) => {
  // Se não tiver sessão, userId é null -> useDashboardState cai em modo LocalStorage
  const { state, dbStatus, ...actions } = useDashboardState(supabase, session?.user?.id || null);

  const handleSegmentChange = (segment: Segment) => {
    actions.setSegment(segment);
  };

  const currentData = state.data[state.segment][state.year][state.month];
  const monthEnabled = currentData?.weeks !== 0;

  return (
      <div className="relative z-10">
        <Header
          year={state.year}
          month={state.month}
          onYearChange={actions.setYear}
          onMonthChange={actions.setMonth}
          isAnnualView={state.mode === 'annual'}
          onToggleAnnualView={actions.toggleMode}
          onImport={actions.importState}
          onExport={actions.exportState}
          onOpenSettings={onOpenSettings}
          dbStatus={dbStatus}
          userEmail={session?.user?.email}
          onLogout={onLogout}
        />

        <main className="container mx-auto max-w-7xl px-4 py-8">
          <SegmentTabs
            segments={SEGMENTS}
            activeSegment={state.segment}
            onSegmentChange={handleSegmentChange}
          />
          
          <div className={`transition-all duration-500 ease-in-out ${!monthEnabled ? 'opacity-50 grayscale-[0.5] pointer-events-none blur-[1px]' : 'opacity-100'}`}>
            {state.segment === 'Redes Sociais' ? (
              <SocialView
                data={currentData as SocialMonth}
                onUpdate={actions.updateSocialMetric}
                onAddNetwork={actions.addSocialNetwork}
                onRemoveNetwork={actions.removeSocialNetwork}
                onAddMetric={actions.addSocialMetric}
                onRemoveMetric={actions.removeSocialMetric}
              />
            ) : (
              <FwView
                data={currentData as FWMonth}
                isAnnualView={state.mode === 'annual'}
                fullYearData={state.data[state.segment][state.year] as FWMonth[]}
                actions={actions}
              />
            )}
          </div>
          {!monthEnabled && (
              <div className="mt-8 p-6 rounded-xl bg-slate-900/80 border border-slate-800 text-center backdrop-blur-md max-w-lg mx-auto shadow-2xl">
                  <div className="text-violet-400 font-bold text-lg mb-2">Dados não inicializados</div>
                  <p className="text-slate-400 text-sm">
                      Este mês ainda não possui dados configurados. 
                      <br/>Preencha um mês anterior para começar.
                  </p>
              </div>
          )}
        </main>
      </div>
  );
};

export default App;
