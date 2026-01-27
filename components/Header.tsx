
import React, { useState, useEffect } from 'react';
import { YEARS, MONTHS } from '../constants';
import { LogoIcon, SettingsIcon, DatabaseIcon, SaveIcon, CheckIcon, LogoutIcon } from './Icons';
import type { Segment } from '../types';

interface HeaderProps {
  year: number;
  month: number;
  onYearChange: (year: number) => void;
  onMonthChange: (month: number) => void;
  isAnnualView: boolean;
  onToggleAnnualView: () => void;
  onOpenSettings: () => void;
  dbStatus: 'disconnected' | 'connected' | 'syncing' | 'error';
  // Auth Props
  session: any;
  onLogout: () => void;
  // Saving Props
  onManualSave: () => void;
  isSaving: boolean;
  // Tab Management Props
  allSegments?: Segment[];
  visibleSegments?: Segment[];
  onToggleSegment?: (s: Segment) => void;
}

const Header: React.FC<HeaderProps> = ({
  year,
  month,
  onYearChange,
  onMonthChange,
  isAnnualView,
  onToggleAnnualView,
  onOpenSettings,
  dbStatus,
  session,
  onLogout,
  onManualSave,
  isSaving,
  allSegments = [],
  visibleSegments = [],
  onToggleSegment = (_: Segment) => {}
}) => {
  const [isPrefsOpen, setIsPrefsOpen] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  // Effect to show temporary success message after saving finishes
  useEffect(() => {
    if (!isSaving && showSaveSuccess === false) {
       // logic: if it *was* saving and stopped, we might want to show success?
       // Actually simpler: when parent says isSaving=false, we check if we were saving.
       // But parent handles the state. Let's just listen to !isSaving if we clicked? 
       // For now, simpler approach: trigger success when isSaving goes from true to false? 
       // React updates are batched. 
    }
  }, [isSaving]);

  // We need a ref to track previous state to detect completion
  const prevSavingRef = React.useRef(isSaving);
  useEffect(() => {
      if (prevSavingRef.current === true && isSaving === false) {
          setShowSaveSuccess(true);
          const timer = setTimeout(() => setShowSaveSuccess(false), 2000);
          return () => clearTimeout(timer);
      }
      prevSavingRef.current = isSaving;
  }, [isSaving]);
  
  const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => (
    <select {...props} className={`bg-slate-800/60 border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-200 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition cursor-pointer ${props.className}`} />
  );

  const getStatusColor = () => {
      switch(dbStatus) {
          case 'connected': return 'text-emerald-400';
          case 'syncing': return 'text-blue-400 animate-pulse';
          case 'error': return 'text-red-400';
          default: return 'text-slate-500';
      }
  };

  const userEmail = session?.user?.email || '';
  const userInitial = userEmail ? userEmail.charAt(0).toUpperCase() : '?';

  return (
    <>
    <header className="sticky top-0 z-50 bg-slate-900/70 backdrop-blur-lg border-b border-slate-800">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <LogoIcon />
            <h1 className="text-xl font-bold text-white hidden sm:block">
              Camerite <span className="font-light text-slate-400">Dashboard</span>
            </h1>
          </div>
          <div className="flex items-center gap-2 md:gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Select value={year} onChange={(e) => onYearChange(parseInt(e.target.value))}>
                {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </Select>
              <Select value={month} onChange={(e) => onMonthChange(parseInt(e.target.value))}>
                {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
              </Select>
            </div>
            
            <label className="flex items-center gap-2 text-sm cursor-pointer select-none group hidden md:flex">
               <div className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-300 ${isAnnualView ? 'bg-violet-600' : 'bg-slate-700'}`}>
                 <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ${isAnnualView ? 'translate-x-4' : 'translate-x-0'}`}></div>
              </div>
              <input type="checkbox" checked={isAnnualView} onChange={onToggleAnnualView} className="hidden"/>
              <span className="text-slate-400 group-hover:text-white transition">Anual</span>
            </label>
            
            <div className="h-8 w-[1px] bg-slate-700 mx-2"></div>

            {/* MANUAL SAVE BUTTON */}
            <button 
                onClick={onManualSave}
                disabled={isSaving}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition duration-200 border
                    ${showSaveSuccess 
                        ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' 
                        : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'
                    }
                `}
                title="Salvar alterações agora"
            >
                {isSaving ? (
                     <div className="w-4 h-4 border-2 border-slate-400 border-t-white rounded-full animate-spin"></div>
                ) : showSaveSuccess ? (
                    <CheckIcon className="w-4 h-4" />
                ) : (
                    <SaveIcon className="w-4 h-4" />
                )}
                <span className="hidden lg:inline">
                    {isSaving ? 'Salvando...' : showSaveSuccess ? 'Salvo!' : 'Salvar'}
                </span>
            </button>

            <button 
                onClick={() => setIsPrefsOpen(true)}
                className="p-2 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition"
                title="Preferências de Exibição"
            >
                <SettingsIcon className="w-5 h-5" />
            </button>

            {/* Auth Section */}
            <div className="pl-2 ml-2 border-l border-slate-700 flex items-center">
                {session ? (
                    <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-inner select-none cursor-default" title={userEmail}>
                            {userInitial}
                         </div>
                         <button 
                            onClick={onLogout}
                            className="p-2 rounded-full text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition"
                            title="Sair"
                         >
                            <LogoutIcon className="w-5 h-5" />
                         </button>
                    </div>
                ) : (
                    <button className="px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-sm rounded-md font-medium transition">
                        Entrar
                    </button>
                )}
            </div>
          </div>
        </div>
      </div>
    </header>

    {/* Preferences Modal */}
    {isPrefsOpen && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-sm animate-in zoom-in-95 duration-200">
           <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center">
             <h3 className="text-lg font-semibold text-white flex items-center gap-2">
               <SettingsIcon className="text-violet-500 w-5 h-5" />
               Preferências
             </h3>
             <button onClick={() => setIsPrefsOpen(false)} className="text-slate-400 hover:text-white text-2xl leading-none">&times;</button>
           </div>
           <div className="p-6">
             <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Abas Visíveis</h4>
             <div className="space-y-3">
               {allSegments.map(segment => (
                 <label key={segment} className="flex items-center justify-between group cursor-pointer p-2 rounded-lg hover:bg-slate-800/50 transition">
                    <span className="text-slate-200 font-medium group-hover:text-white">{segment}</span>
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        checked={visibleSegments.includes(segment)}
                        onChange={() => onToggleSegment(segment)}
                        className="peer sr-only"
                      />
                      <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
                    </div>
                 </label>
               ))}
             </div>
             <p className="text-xs text-slate-500 mt-6 text-center">As configurações são salvas neste dispositivo.</p>
           </div>
        </div>
      </div>
    )}
    </>
  );
};

export default Header;
