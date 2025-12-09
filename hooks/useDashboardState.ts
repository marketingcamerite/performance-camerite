
import { useState, useCallback, useEffect, useRef } from 'react';
import { YEARS, SEGMENTS, ZEROS_5 } from '../constants';
import type { AppState, Segment, FWMonth, SocialMonth, WeeklyData, LandingPageData, SiteMonth, SitePageRegistryItem } from '../types';
import { parseBRNumber } from '../utils/helpers';
import { SupabaseClient } from '@supabase/supabase-js';
import { stateToWorkbook, workbookToState } from '../utils/excel';
import * as XLSX from 'xlsx';

const LOCAL_STORAGE_KEY = 'camerite_dashboard_data';

const defaultFWMonth = (): FWMonth => ({
  weeks: 5,
  organic: {
    sources: { "Google": ZEROS_5(), "Bing": ZEROS_5(), "Site": ZEROS_5() },
    landing: { "LP Principal": { leads: ZEROS_5(), views: ZEROS_5() } }
  },
  paid: {
    meta: { investimento: ZEROS_5(), alcance: ZEROS_5(), impressoes: ZEROS_5(), cliques: ZEROS_5(), leadsPlan: ZEROS_5(), leads: ZEROS_5() },
    google: { investimento: ZEROS_5(), alcance: ZEROS_5(), impressoes: ZEROS_5(), cliques: ZEROS_5(), leadsPlan: ZEROS_5(), leads: ZEROS_5() }
  },
  pipe: { leads: ZEROS_5(), oportunidades: ZEROS_5(), noShow: ZEROS_5(), perdidos: ZEROS_5(), vendas: ZEROS_5() }
});

const defaultSocialMonth = (): SocialMonth => ({
  weeks: 5,
  metrics: ["Alcance", "Impressões", "Cliques"],
  networks: {
    "Instagram": { "Alcance": ZEROS_5(), "Impressões": ZEROS_5(), "Cliques": ZEROS_5() },
    "Facebook": { "Alcance": ZEROS_5(), "Impressões": ZEROS_5(), "Cliques": ZEROS_5() }
  }
});

const defaultSiteMonth = (): SiteMonth => ({
  weeks: 5,
  kpis: {
    visitors: 0,
    unique: 0,
    bounceRate: 0,
    avgTime: 0
  },
  pages: {
    // Data is initialized empty, keys will be populated based on interaction or registry
  },
  sources: {
    "Google": ZEROS_5(),
    "Direto": ZEROS_5()
  }
});

const generateInitialData = () => {
  const data: any = {};
  SEGMENTS.forEach(segment => {
    data[segment] = {};
    YEARS.forEach(year => {
      if (segment === 'Redes Sociais') {
        data[segment][year] = Array.from({ length: 12 }, defaultSocialMonth);
      } else if (segment === 'Site') {
        data[segment][year] = Array.from({ length: 12 }, defaultSiteMonth);
      } else {
        data[segment][year] = Array.from({ length: 12 }, defaultFWMonth);
      }
    });
  });
  return data;
};

const useDashboardState = (supabase: SupabaseClient | null, userId: string | null) => {
  const now = new Date();
  const currentYear = YEARS.includes(now.getFullYear()) ? now.getFullYear() : YEARS[0];
  const currentMonth = now.getMonth();

  const [state, setState] = useState<AppState>({
    year: currentYear,
    month: currentMonth,
    segment: 'Franquias',
    mode: 'weekly',
    data: generateInitialData(),
    siteRegistry: [], // Initialize empty registry (Global Persistence)
  });

  const [dbStatus, setDbStatus] = useState<'disconnected' | 'connected' | 'syncing' | 'error'>('disconnected');
  const isInitialLoad = useRef(true);
  
  // Helper to migrate legacy data structures to include new tabs/registries
  const migrateState = (loadedData: any): AppState => {
      // 1. Ensure 'Site' segment data exists
      if (!loadedData.data['Site']) {
          loadedData.data['Site'] = {};
          YEARS.forEach(y => loadedData.data['Site'][y] = Array.from({ length: 12 }, defaultSiteMonth));
      }

      // 2. Ensure Global Site Registry exists
      if (!loadedData.siteRegistry) {
          loadedData.siteRegistry = [];
          
          // Optional: Scan existing months to recover pages from legacy data if they exist
          const existingPages = new Set<string>();
          if (loadedData.data['Site']) {
            Object.values(loadedData.data['Site']).forEach((yearData: any) => {
                yearData.forEach((m: SiteMonth) => {
                    if (m.pages) Object.keys(m.pages).forEach(p => existingPages.add(p));
                });
            });
          }
          
          existingPages.forEach(p => {
              loadedData.siteRegistry.push({ id: p, name: p, isHidden: false, createdAt: new Date().toISOString() });
          });
      }

      return loadedData as AppState;
  };

  // Load initial data (Hybrid: DB or LocalStorage)
  useEffect(() => {
    const loadData = async () => {
        setDbStatus('syncing');
        try {
            if (userId && supabase) {
                // Online Mode
                const { data, error } = await supabase
                    .from('dashboards')
                    .select('content')
                    .eq('user_id', userId)
                    .maybeSingle();
                
                if (error) throw error;

                if (data && data.content) {
                    const migratedData = migrateState(data.content);
                    setState(prev => ({...prev, ...migratedData, mode: prev.mode})); 
                    setDbStatus('connected');
                } else {
                    // Create entry if not exists (First login)
                    const { error: insertError } = await supabase
                        .from('dashboards')
                        .insert({ user_id: userId, content: state });
                    if (insertError) throw insertError;
                    setDbStatus('connected');
                }
            } else {
                // Offline Mode (Local Storage)
                const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
                if (localData) {
                    const parsed = JSON.parse(localData);
                    const migratedData = migrateState(parsed);
                    setState(prev => ({...prev, ...migratedData, mode: prev.mode}));
                }
                setDbStatus('disconnected');
            }
        } catch (err) {
            console.error("Data Load Error:", err);
            setDbStatus('error');
        } finally {
            isInitialLoad.current = false;
        }
    };
    loadData();
  }, [userId, supabase]);

  // Auto-save (Hybrid) - SAVES THE ENTIRE ROOT STATE (INCLUDING REGISTRY)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  useEffect(() => {
      if (isInitialLoad.current) return;

      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      if (userId) setDbStatus('syncing');

      timeoutRef.current = setTimeout(async () => {
        try {
            if (userId && supabase) {
                // We save 'state', which includes 'siteRegistry' at the root level.
                // This ensures global persistence.
                const { error } = await supabase
                    .from('dashboards')
                    .upsert({ 
                        user_id: userId, 
                        content: state, 
                        updated_at: new Date().toISOString() 
                    });
                if (error) throw error;
                setDbStatus('connected');
            } else {
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
                setDbStatus('disconnected');
            }
        } catch (err) {
            console.error("Save Error:", err);
            setDbStatus('error');
        }
      }, 2000);

      return () => {
          if(timeoutRef.current) clearTimeout(timeoutRef.current);
      }
  }, [state, userId, supabase]);


  const updateState = useCallback(<T,>(key: keyof AppState, value: T) => {
    setState(prevState => ({ ...prevState, [key]: value }));
  }, []);
  
  const updateNestedState = (updateFn: (draft: AppState) => void) => {
    setState(prevState => {
        const newState = JSON.parse(JSON.stringify(prevState));
        updateFn(newState);
        return newState;
    });
  };

  const setYear = (year: number) => updateState('year', year);
  const setMonth = (month: number) => updateState('month', month);
  const setSegment = (segment: Segment) => updateState('segment', segment);
  const toggleMode = () => updateState('mode', state.mode === 'weekly' ? 'annual' : 'weekly');

  // --- FW Actions ---
  const updateFwMetric = (
    area: 'organic' | 'paid' | 'pipe',
    subArea: string,
    metric: string,
    weekIndex: number,
    value: number | string,
    subMetric?: 'leads' | 'views'
  ) => {
      updateNestedState(draft => {
          const monthData = draft.data[draft.segment][draft.year][draft.month] as FWMonth;
          if (area === 'organic' && subArea === 'landing' && subMetric) {
             (monthData.organic.landing[metric] as LandingPageData)[subMetric][weekIndex] = value;
          } else if(area === 'organic' && subArea === 'sources'){
             (monthData.organic.sources[metric] as WeeklyData)[weekIndex] = value;
          } else if (area === 'paid') {
              (monthData.paid[subArea as 'meta' | 'google'] as any)[metric][weekIndex] = value;
          } else if (area === 'pipe') {
              (monthData.pipe as any)[metric][weekIndex] = value;
          }
      });
  };

  const addFwItem = (area: 'sources' | 'landing', name: string) => {
      updateNestedState(draft => {
          const monthData = draft.data[draft.segment][draft.year][draft.month] as FWMonth;
          if (area === 'sources' && !monthData.organic.sources[name]) {
              monthData.organic.sources[name] = ZEROS_5();
          } else if (area === 'landing' && !monthData.organic.landing[name]) {
              monthData.organic.landing[name] = { leads: ZEROS_5(), views: ZEROS_5() };
          }
      });
  };

  const removeFwItem = (area: 'sources' | 'landing', name: string) => {
      updateNestedState(draft => {
          const monthData = draft.data[draft.segment][draft.year][draft.month] as FWMonth;
          if (area === 'sources') {
              delete monthData.organic.sources[name];
          } else if (area === 'landing') {
              delete monthData.organic.landing[name];
          }
      });
  };
  
  // --- Social Actions ---
  const updateSocialMetric = (network: string, metric: string, weekIndex: number, value: string | number) => {
    updateNestedState(draft => {
      const socialData = draft.data['Redes Sociais'][draft.year][draft.month] as SocialMonth;
      if (socialData.networks[network] && socialData.networks[network][metric]) {
        socialData.networks[network][metric][weekIndex] = value;
      }
    });
  };

  const addSocialNetwork = (name: string) => {
    updateNestedState(draft => {
      const socialData = draft.data['Redes Sociais'][draft.year][draft.month] as SocialMonth;
      if (!socialData.networks[name]) {
        socialData.networks[name] = Object.fromEntries(socialData.metrics.map(m => [m, ZEROS_5()]));
      }
    });
  };
  
  const removeSocialNetwork = (name: string) => {
    updateNestedState(draft => {
      const socialData = draft.data['Redes Sociais'][draft.year][draft.month] as SocialMonth;
      delete socialData.networks[name];
    });
  };

  const addSocialMetric = (name: string) => {
    updateNestedState(draft => {
      const socialData = draft.data['Redes Sociais'][draft.year][draft.month] as SocialMonth;
      if (!socialData.metrics.includes(name)) {
        socialData.metrics.push(name);
        Object.keys(socialData.networks).forEach(net => {
          socialData.networks[net][name] = ZEROS_5();
        });
      }
    });
  };
  
  const removeSocialMetric = (name: string) => {
    updateNestedState(draft => {
      const socialData = draft.data['Redes Sociais'][draft.year][draft.month] as SocialMonth;
      socialData.metrics = socialData.metrics.filter(m => m !== name);
      Object.keys(socialData.networks).forEach(net => {
        delete socialData.networks[net][name];
      });
    });
  };

  // --- Site Actions ---
  const updateSiteKpi = (metric: keyof SiteMonth['kpis'], value: number | string) => {
      updateNestedState(draft => {
          const siteData = draft.data['Site'][draft.year][draft.month] as SiteMonth;
          siteData.kpis[metric] = value;
      });
  };

  const updateSitePageMetric = (page: string, metric: 'views' | 'unique', weekIndex: number, value: number | string) => {
      updateNestedState(draft => {
          const siteData = draft.data['Site'][draft.year][draft.month] as SiteMonth;
          // Ensure page data exists in this month (lazy initialization)
          if (!siteData.pages[page]) {
              siteData.pages[page] = { views: ZEROS_5(), unique: ZEROS_5() };
          }
          siteData.pages[page][metric][weekIndex] = value;
      });
  };

  const toggleSitePageVisibility = (pageName: string) => {
      updateNestedState(draft => {
          // Updates the Global Registry, not the monthly data
          const pageDef = draft.siteRegistry.find(p => p.name === pageName);
          if (pageDef) {
              pageDef.isHidden = !pageDef.isHidden;
          }
      });
  };

  const updateSiteSource = (source: string, weekIndex: number, value: number | string) => {
      updateNestedState(draft => {
          const siteData = draft.data['Site'][draft.year][draft.month] as SiteMonth;
          if (siteData.sources[source]) {
              siteData.sources[source][weekIndex] = value;
          }
      });
  };

  const addSiteItem = (type: 'page' | 'source', name: string) => {
      updateNestedState(draft => {
          const siteData = draft.data['Site'][draft.year][draft.month] as SiteMonth;
          
          if (type === 'page') {
              // 1. Add to Global Registry (Persists across months)
              const exists = draft.siteRegistry.some(p => p.name === name);
              if (!exists) {
                  draft.siteRegistry.push({
                      id: name,
                      name: name,
                      isHidden: false,
                      createdAt: new Date().toISOString()
                  });
              }
              // 2. Initialize data for current month immediately (UX)
              if (!siteData.pages[name]) {
                  siteData.pages[name] = { views: ZEROS_5(), unique: ZEROS_5() };
              }
          } else if (type === 'source' && !siteData.sources[name]) {
              siteData.sources[name] = ZEROS_5();
          }
      });
  };

  const removeSiteItem = (type: 'page' | 'source', name: string) => {
      updateNestedState(draft => {
          const siteData = draft.data['Site'][draft.year][draft.month] as SiteMonth;
          if (type === 'page') {
              // Permanent Delete Logic
              // Removes from registry (so it disappears from all months)
              draft.siteRegistry = draft.siteRegistry.filter(p => p.name !== name);
              delete siteData.pages[name]; 
          } else if (type === 'source') {
              delete siteData.sources[name];
          }
      });
  };

  const exportState = () => {
    const wb = stateToWorkbook(state);
    XLSX.writeFile(wb, `camerite-dashboard-data.xlsx`);
  };

  const importState = async (file: File) => {
    try {
      const newState = await workbookToState(file, state);
      setState(newState);
    } catch (error) {
      console.error(error);
      alert('Erro ao importar o arquivo XLSX. Verifique se o formato está correto.');
    }
  };

  return {
    state,
    dbStatus,
    setYear,
    setMonth,
    setSegment,
    toggleMode,
    updateFwMetric,
    addFwItem,
    removeFwItem,
    updateSocialMetric,
    addSocialNetwork,
    removeSocialNetwork,
    addSocialMetric,
    removeSocialMetric,
    updateSiteKpi,
    updateSitePageMetric,
    toggleSitePageVisibility,
    updateSiteSource,
    addSiteItem,
    removeSiteItem,
    exportState,
    importState
  };
};

export default useDashboardState;
