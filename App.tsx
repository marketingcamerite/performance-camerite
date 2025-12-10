
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import SegmentTabs from './components/SegmentTabs';
import FwView from './components/FwView';
import SocialView from './components/SocialView';
import SiteView from './components/SiteView';
import LoginScreen from './components/LoginScreen';
import useDashboardState from './hooks/useDashboardState';
import { SEGMENTS, SUPABASE_URL, SUPABASE_ANON_KEY } from './constants';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Segment, FWMonth, SocialMonth, SiteMonth } from './types';

// Initialize Supabase client immediately with hardcoded credentials
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // -- TAB VISIBILITY MANAGEMENT --
  const [visibleSegments, setVisibleSegments] = useState<Segment[]>(() => {
    const saved = localStorage.getItem('dashboard_visible_tabs');
    return saved ? JSON.parse(saved) : [...SEGMENTS];
  });

  const handleToggleSegment = (segment: Segment) => {
    setVisibleSegments(prev => {
      const isVisible = prev.includes(segment);
      let newSet;
      if (isVisible) {
        // Prevent hiding all tabs
        if (prev.length === 1) return prev; 
        newSet = prev.filter(s => s !== segment);
      } else {
        // Maintain original order based on SEGMENTS constant
        const pendingSet = [...prev, segment];
        newSet = SEGMENTS.filter(s => pendingSet.includes(s));
      }
      localStorage.setItem('dashboard_visible_tabs', JSON.stringify(newSet));
      return newSet;
    });
  };
  // -------------------------------

  useEffect(() => {
    // Check for existing session
    const initSession = async () => {
      try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        setSession(session);
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setIsLoading(false);
      }
    };
    initSession();

    // Listen for auth changes
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabaseClient.auth.signOut();
    setSession(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  if (!session) {
    return <LoginScreen supabase={supabaseClient} isLoading={isLoading} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-violet-500/30 selection:text-violet-200">
      {/* Background Ambient Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-900/20 rounded-full blur-[120px] animate-pulse" style={{animationDuration: '8s'}}></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-900/20 rounded-full blur-[120px] animate-pulse" style={{animationDuration: '10s'}}></div>
      </div>

      <DashboardContent 
        supabase={supabaseClient} 
        session={session} 
        onLogout={handleLogout}
        visibleSegments={visibleSegments}
        onToggleSegment={handleToggleSegment}
      />
    </div>
  );
};

// Componente do Dashboard
const DashboardContent: React.FC<{
  supabase: SupabaseClient;
  session: any;
  onLogout: () => void;
  visibleSegments: Segment[];
  onToggleSegment: (s: Segment) => void;
}> = ({ supabase, session, onLogout, visibleSegments, onToggleSegment }) => {
  const { state, dbStatus, ...actions } = useDashboardState(supabase, session?.user?.id || null);

  // Safety: If current segment is hidden, switch to the first visible one
  useEffect(() => {
    if (!visibleSegments.includes(state.segment) && visibleSegments.length > 0) {
      actions.setSegment(visibleSegments[0]);
    }
  }, [visibleSegments, state.segment, actions]);

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
          onOpenSettings={() => {}} 
          dbStatus={dbStatus}
          userEmail={session?.user?.email}
          onLogout={onLogout}
          onImport={actions.importState}
          onExport={actions.exportState}
          // Tab Management Props
          allSegments={SEGMENTS}
          visibleSegments={visibleSegments}
          onToggleSegment={onToggleSegment}
        />

        <main className="container mx-auto max-w-7xl px-4 py-8">
          <SegmentTabs
            segments={visibleSegments} // Pass filtered segments
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
            ) : state.segment === 'Site' ? (
              <SiteView 
                data={currentData as SiteMonth}
                registry={state.siteRegistry || []} 
                isAnnualView={state.mode === 'annual'}
                fullYearData={state.data['Site'][state.year] as SiteMonth[]}
                actions={actions}
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
