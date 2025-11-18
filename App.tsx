
import React, { useState } from 'react';
import Header from './components/Header';
import SegmentTabs from './components/SegmentTabs';
import FwView from './components/FwView';
import SocialView from './components/SocialView';
import SettingsModal from './components/SettingsModal';
import useDashboardState from './hooks/useDashboardState';
import { SEGMENTS } from './constants';
import type { Segment, FWMonth, SocialMonth } from './types';

const App: React.FC = () => {
  const { state, dbStatus, dbConfig, updateDbConfig, ...actions } = useDashboardState();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleSegmentChange = (segment: Segment) => {
    actions.setSegment(segment);
  };

  const currentData = state.data[state.segment][state.year][state.month];
  const monthEnabled = currentData?.weeks !== 0;

  return (
    <div className="min-h-screen bg-slate-900 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]">
      <Header
        year={state.year}
        month={state.month}
        onYearChange={actions.setYear}
        onMonthChange={actions.setMonth}
        isAnnualView={state.mode === 'annual'}
        onToggleAnnualView={actions.toggleMode}
        onImport={actions.importState}
        onExport={actions.exportState}
        onOpenSettings={() => setIsSettingsOpen(true)}
        dbStatus={dbStatus}
      />
      
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={updateDbConfig}
        currentConfig={dbConfig}
        status={dbStatus}
      />

      <main className="container mx-auto max-w-7xl px-4 py-8">
        <SegmentTabs
          segments={SEGMENTS}
          activeSegment={state.segment}
          onSegmentChange={handleSegmentChange}
        />
        
        <div className={`transition-opacity duration-300 ${!monthEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
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
            <div className="text-center py-10 text-slate-500 font-semibold">
                Os dados para este mês e segmento não foram inicializados (weeks = 0).
                <br/>
                Importe um arquivo ou preencha os dados de outro mês para clonar (recurso futuro).
            </div>
        )}
      </main>
    </div>
  );
};

export default App;
