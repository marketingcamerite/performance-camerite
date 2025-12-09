
import * as XLSX from 'xlsx';
import type { AppState, Segment, FWMonth, SocialMonth, WeeklyData, SiteMonth, SitePageRegistryItem } from '../types';
import { YEARS, SEGMENTS } from '../constants';
import { parseBRNumber } from './helpers';

// Row Structure: Segment | Year | MonthIndex | Category | SubCategory | ItemName | Metric | W1 | W2 | W3 | W4 | W5
type ExcelRow = [string, number, number, string, string, string, string, number, number, number, number, number];

const HEADERS = ['Segmento', 'Ano', 'Mês (Index)', 'Categoria', 'SubCategoria', 'Item', 'Métrica', 'Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5'];

export const stateToWorkbook = (state: AppState): XLSX.WorkBook => {
  const rows: ExcelRow[] = [];

  const pushRow = (
    segment: string, 
    year: number, 
    month: number, 
    cat: string, 
    sub: string, 
    item: string, 
    metric: string, 
    data: (number | string)[]
  ) => {
    const numericData = data.map(v => parseBRNumber(v));
    while(numericData.length < 5) numericData.push(0);
    const finalData = numericData.slice(0, 5);

    rows.push([segment, year, month, cat, sub, item, metric, ...finalData] as ExcelRow);
  };

  // Export Site Registry (using a special "Config" segment or Year -1)
  // We will store it as: Segment='Global', Year=-1, Month=-1, Cat='Site', Sub='Registry', Item=PageName, Metric='hidden', Value=[1/0]
  if (state.siteRegistry) {
      state.siteRegistry.forEach(page => {
          pushRow('Global', -1, -1, 'Site', 'Registry', page.name, 'hidden', [page.isHidden ? 1 : 0, 0,0,0,0]);
      });
  }

  SEGMENTS.forEach(segment => {
    YEARS.forEach(year => {
      // Ensure year exists
      if (!state.data[segment][year]) return;

      state.data[segment][year].forEach((monthData, monthIndex) => {
        if (!monthData) return;

        if (segment === 'Redes Sociais') {
          const sData = monthData as SocialMonth;
          Object.entries(sData.networks).forEach(([network, metrics]) => {
            Object.entries(metrics).forEach(([metric, values]) => {
              pushRow(segment, year, monthIndex, 'Social', 'Network', network, metric, values);
            });
          });
        } else if (segment === 'Site') {
          const sData = monthData as SiteMonth;
          // Sources
          Object.entries(sData.sources).forEach(([source, values]) => {
            pushRow(segment, year, monthIndex, 'Site', 'Sources', source, 'visitors', values);
          });
          // Pages
          Object.entries(sData.pages).forEach(([page, pageData]) => {
             pushRow(segment, year, monthIndex, 'Site', 'Pages', page, 'views', pageData.views);
             pushRow(segment, year, monthIndex, 'Site', 'Pages', page, 'unique', pageData.unique);
          });
          // KPIs (Monthly totals stored in first week column)
          pushRow(segment, year, monthIndex, 'Site', 'KPIs', 'Monthly', 'visitors', [sData.kpis.visitors,0,0,0,0]);
          pushRow(segment, year, monthIndex, 'Site', 'KPIs', 'Monthly', 'unique', [sData.kpis.unique,0,0,0,0]);
          pushRow(segment, year, monthIndex, 'Site', 'KPIs', 'Monthly', 'bounceRate', [sData.kpis.bounceRate,0,0,0,0]);
          pushRow(segment, year, monthIndex, 'Site', 'KPIs', 'Monthly', 'avgTime', [sData.kpis.avgTime,0,0,0,0]);

        } else {
          const fData = monthData as FWMonth;
          
          // Organic Sources
          Object.entries(fData.organic.sources).forEach(([source, values]) => {
            pushRow(segment, year, monthIndex, 'Organic', 'Sources', source, 'leads', values);
          });

          // Landing Pages
          Object.entries(fData.organic.landing).forEach(([lp, lpData]) => {
            pushRow(segment, year, monthIndex, 'Organic', 'Landing', lp, 'leads', lpData.leads);
            pushRow(segment, year, monthIndex, 'Organic', 'Landing', lp, 'views', lpData.views);
          });

          // Paid Meta
          Object.entries(fData.paid.meta).forEach(([metric, values]) => {
            pushRow(segment, year, monthIndex, 'Paid', 'Meta', 'Meta Ads', metric, values);
          });

          // Paid Google
          Object.entries(fData.paid.google).forEach(([metric, values]) => {
             pushRow(segment, year, monthIndex, 'Paid', 'Google', 'Google Ads', metric, values);
          });

          // Pipeline
          Object.entries(fData.pipe).forEach(([metric, values]) => {
            pushRow(segment, year, monthIndex, 'Pipe', 'Sales', 'Pipeline', metric, values);
          });
        }
      });
    });
  });

  const ws = XLSX.utils.aoa_to_sheet([HEADERS, ...rows]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Dados");
  return wb;
};

export const workbookToState = (file: File, currentData: AppState): Promise<AppState> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json<any[]>(firstSheet, { header: 1 });

        // Deep clone current state to modify it
        const newState: AppState = JSON.parse(JSON.stringify(currentData));
        if (!newState.siteRegistry) newState.siteRegistry = [];

        // Skip header row (index 0)
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          if (!row || row.length < 8) continue;

          const [segmentStr, yearRaw, monthRaw, cat, sub, item, metric, ...weeksRaw] = row;
          
          const segment = segmentStr;
          const year = parseInt(yearRaw);
          const monthIndex = parseInt(monthRaw);
          
          const weeks: number[] = weeksRaw.slice(0, 5).map((v: any) => parseBRNumber(v));
          while(weeks.length < 5) weeks.push(0); 

          // Handle Global Registry
          if (segment === 'Global' && cat === 'Site' && sub === 'Registry') {
              const existingIndex = newState.siteRegistry.findIndex(p => p.name === item);
              const isHidden = weeks[0] === 1;
              if (existingIndex >= 0) {
                  newState.siteRegistry[existingIndex].isHidden = isHidden;
              } else {
                  newState.siteRegistry.push({ id: item, name: item, isHidden, createdAt: new Date().toISOString() });
              }
              continue;
          }

          if (!SEGMENTS.includes(segment as any) || !YEARS.includes(year) || monthIndex < 0 || monthIndex > 11) continue;

          if (segment === 'Redes Sociais') {
             const mData = newState.data[segment][year][monthIndex] as SocialMonth;
             if (!mData.networks[item]) {
                mData.networks[item] = {}; 
             }
             mData.networks[item][metric] = weeks;
             if(!mData.metrics.includes(metric)) mData.metrics.push(metric);

          } else if (segment === 'Site') {
             const sData = newState.data[segment][year][monthIndex] as SiteMonth;
             if (sub === 'Sources') {
                 sData.sources[item] = weeks;
             } else if (sub === 'Pages') {
                 // Ensure data structure exists
                 if (!sData.pages[item]) sData.pages[item] = { views: [0,0,0,0,0], unique: [0,0,0,0,0] };
                 
                 // If page is not in registry, add it (fallback)
                 if (!newState.siteRegistry.some(p => p.name === item)) {
                     newState.siteRegistry.push({ id: item, name: item, isHidden: false });
                 }

                 if (metric === 'views' || metric === 'unique') {
                     sData.pages[item][metric] = weeks;
                 }
                 // Legacy handling: if metric is config_hidden from old exports
                 if (metric === 'config_hidden') {
                      const regItem = newState.siteRegistry.find(p => p.name === item);
                      if (regItem) regItem.isHidden = weeks[0] === 1;
                 }

             } else if (sub === 'KPIs') {
                 if (metric === 'visitors') sData.kpis.visitors = weeks[0];
                 if (metric === 'unique') sData.kpis.unique = weeks[0];
                 if (metric === 'bounceRate') sData.kpis.bounceRate = weeks[0];
                 if (metric === 'avgTime') sData.kpis.avgTime = weeks[0];
             }

          } else {
            const mData = newState.data[segment as Segment][year][monthIndex] as FWMonth;

            if (cat === 'Organic' && sub === 'Sources') {
               mData.organic.sources[item] = weeks;
            } else if (cat === 'Organic' && sub === 'Landing') {
               if (!mData.organic.landing[item]) {
                 mData.organic.landing[item] = { leads: [0,0,0,0,0], views: [0,0,0,0,0] };
               }
               if (metric === 'leads' || metric === 'views') {
                 mData.organic.landing[item][metric] = weeks;
               }
            } else if (cat === 'Paid' && sub === 'Meta') {
               if ((mData.paid.meta as any)[metric]) (mData.paid.meta as any)[metric] = weeks;
            } else if (cat === 'Paid' && sub === 'Google') {
               if ((mData.paid.google as any)[metric]) (mData.paid.google as any)[metric] = weeks;
            } else if (cat === 'Pipe') {
               if ((mData.pipe as any)[metric]) (mData.pipe as any)[metric] = weeks;
            }
          }
        }

        resolve(newState);
      } catch (error) {
        reject(error);
      }
    };
    reader.readAsArrayBuffer(file);
  });
};
