
import React, { useRef } from 'react';
import { YEARS, MONTHS } from '../constants';
import { LogoIcon, DatabaseIcon } from './Icons';

interface HeaderProps {
  year: number;
  month: number;
  onYearChange: (year: number) => void;
  onMonthChange: (month: number) => void;
  isAnnualView: boolean;
  onToggleAnnualView: () => void;
  dbStatus: 'disconnected' | 'connected' | 'syncing' | 'error';
  userEmail?: string;
  onLogout: () => void;
}

// Components moved outside to prevent re-mounting/focus loss
const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => (
  <div className="relative group">
      <select {...props} className={`appearance-none bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 rounded-lg pl-4 pr-8 py-2 text-sm text-slate-200 focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 outline-none transition shadow-sm cursor-pointer ${props.className}`} />
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </div>
  </div>
);

const Header: React.FC<HeaderProps> = ({
  year,
  month,
  onYearChange,
  onMonthChange,
  isAnnualView,
  onToggleAnnualView,
  dbStatus,
  userEmail,
  onLogout
}) => {
  
  const getStatusColor = () => {
      switch(dbStatus) {
          case 'connected': return 'text-emerald-400 drop-shadow-[0_0_3px_rgba(52,211,153,0.5)]';
          case 'syncing': return 'text-blue-400 animate-pulse';
          case 'error': return 'text-red-400';
          default: return 'text-slate-500';
      }
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/60 shadow-lg shadow-black/20">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="relative">
                <div className="absolute inset-0 bg-violet-600 blur-md opacity-20 rounded-full"></div>
                <LogoIcon />
            </div>
            <h1 className="text-lg font-bold text-white hidden sm:block tracking-tight">
              Camerite <span className="font-light text-slate-400">Dashboard</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-3 md:gap-5">
            <div className="flex items-center gap-2 bg-slate-900/50 p-1 rounded-xl border border-slate-800/50">
              <Select value={year} onChange={(e) => onYearChange(parseInt(e.target.value))}>
                {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </Select>
              <Select value={month} onChange={(e) => onMonthChange(parseInt(e.target.value))}>
                {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
              </Select>
            </div>

            <label className="flex items-center gap-2 text-sm cursor-pointer select-none group">
              <div className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-300 ${isAnnualView ? 'bg-violet-600' : 'bg-slate-700'}`}>
                 <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ${isAnnualView ? 'translate-x-5' : 'translate-x-0'}`}></div>
              </div>
              <input type="checkbox" checked={isAnnualView} onChange={onToggleAnnualView} className="hidden"/>
              <span className="text-slate-400 group-hover:text-slate-200 transition">Anual</span>
            </label>
            
            <div className="h-6 w-[1px] bg-slate-800 mx-1"></div>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-900/80 px-3 py-1.5 rounded-full border border-slate-800">
                     <DatabaseIcon className={`w-3 h-3 ${getStatusColor()}`} />
                     <span className="hidden md:inline">{dbStatus === 'syncing' ? 'Salvando...' : 'Salvo'}</span>
                </div>

                <div className="relative group">
                    <button className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-500 to-fuchsia-500 flex items-center justify-center text-white text-xs font-bold shadow-lg ring-2 ring-slate-900 hover:ring-violet-500/50 transition-all">
                        {userEmail?.charAt(0).toUpperCase() || 'U'}
                    </button>
                    
                    {/* Dropdown do Usuário */}
                    <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right z-50 overflow-hidden">
                        <div className="px-4 py-3 border-b border-slate-800 bg-slate-800/30">
                            <p className="text-xs text-slate-400">Logado como</p>
                            <p className="text-sm text-white truncate font-medium">{userEmail}</p>
                        </div>
                        <button 
                            onClick={onLogout}
                            className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition flex items-center gap-2"
                        >
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                           Sair
                        </button>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
