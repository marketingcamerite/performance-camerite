
import React, { useRef, useState } from 'react';
import { YEARS, MONTHS } from '../constants';
import { LogoIcon, ImportIcon, ExportIcon, SettingsIcon, DatabaseIcon } from './Icons';
import type { Segment } from '../types';

interface HeaderProps {
  year: number;
  month: number;
  onYearChange: (year: number) => void;
  onMonthChange: (month: number) => void;
  isAnnualView: boolean;
  onToggleAnnualView: () => void;
  onImport: (file: File) => void;
  onExport: () => void;
  onOpenSettings: () => void;
  dbStatus: 'disconnected' | 'connected' | 'syncing' | 'error';
  // New Props for Tab Management
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
  onImport,
  onExport,
  onOpenSettings,
  dbStatus,
  allSegments = [],
  visibleSegments = [],
  onToggleSegment = (_: Segment) => {}
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPrefsOpen, setIsPrefsOpen] = useState(false);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImport(file);
    }
    event.target.value = '';
  };
  
  const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => (
    <select {...props} className={`bg-slate-800/60 border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-200 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition cursor-pointer ${props.className}`} />
  );

  const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & {variant?:'primary'|'secondary'}> = ({variant = 'secondary', ...props}) => {
    const baseClasses = "px-3 py-2 text-sm font-semibold rounded-md flex items-center gap-2 transition";
    const variantClasses = {
      primary: 'bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-900/50',
      secondary: 'bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600 hover:border-slate-500'
    };
    return <button {...props} className={`${baseClasses} ${variantClasses[variant]} ${props.className}`} />;
  }

  const getStatusColor = () => {
      switch(dbStatus) {
          case 'connected': return 'text-emerald-400';
          case 'syncing': return 'text-blue-400 animate-pulse';
          case 'error': return 'text-red-400';
          default: return 'text-slate-500';
      }
  };

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

            <button 
                onClick={() => setIsPrefsOpen(true)}
                className="p-2 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition"
                title="Preferências de Exibição"
            >
                <SettingsIcon className="w-5 h-5" />
            </button>

            <button 
                onClick={onOpenSettings}
                className="flex items-center gap-2 px-2 py-2 rounded hover:bg-slate-800 transition"
                title="Status da Conexão DB"
            >
                <DatabaseIcon className={getStatusColor()} />
                <span className="text-xs text-slate-400 hidden md:inline">DB</span>
            </button>

            <div className="flex items-center gap-2 ml-2">
                <Button onClick={handleImportClick}> <ImportIcon /> <span className='hidden lg:inline'>Importar</span></Button>
                <Button onClick={onExport} variant="primary"> <ExportIcon /> <span className='hidden lg:inline'>Exportar</span></Button>
                <input type="file" accept=".xlsx, .xls, .json" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
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
