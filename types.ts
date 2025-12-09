
export type WeeklyData = (number | string)[];

export type Segment = 'Franquias' | 'White Label' | 'Redes Sociais' | 'Site';

export interface LandingPageData {
  leads: WeeklyData;
  views: WeeklyData;
}

export interface OrganicData {
  sources: { [key: string]: WeeklyData };
  landing: { [key: string]: LandingPageData };
}

export interface PaidChannelData {
  investimento: WeeklyData;
  alcance: WeeklyData;
  impressoes: WeeklyData;
  cliques: WeeklyData;
  leadsPlan: WeeklyData;
  leads: WeeklyData;
}

export interface PaidData {
  meta: PaidChannelData;
  google: PaidChannelData;
}

export interface PipeData {
  leads: WeeklyData;
  oportunidades: WeeklyData;
  noShow: WeeklyData;
  perdidos: WeeklyData;
  vendas: WeeklyData;
}

export interface FWMonth {
  weeks: number;
  organic: OrganicData;
  paid: PaidData;
  pipe: PipeData;
}

export interface SocialNetworkData {
  [metric: string]: WeeklyData;
}

export interface SocialMonth {
  weeks: number;
  metrics: string[];
  networks: {
    [network: string]: SocialNetworkData;
  };
}

// --- SITE TYPES ---

// Global definition of a page
export interface SitePageRegistryItem {
  id: string; // We will use the name as ID to maintain consistency with existing pattern
  name: string;
  isHidden: boolean;
  createdAt?: string;
}

// Monthly data values for a page
export interface SitePageValues {
  views: WeeklyData;
  unique: WeeklyData;
}

export interface SiteMonth {
  weeks: number;
  kpis: {
    visitors: number | string;
    unique: number | string;
    bounceRate: number | string;
    avgTime: number | string;
  };
  pages: { [pageName: string]: SitePageValues }; // Data only, visibility is in Registry
  sources: { [sourceName: string]: WeeklyData };
}

export type MonthlyData = FWMonth | SocialMonth | SiteMonth;

export interface YearData {
  [year: number]: MonthlyData[];
}

export interface SegmentData {
  'Franquias': YearData;
  'White Label': YearData;
  'Redes Sociais': YearData;
  'Site': YearData;
}

export interface AppState {
  year: number;
  month: number;
  segment: Segment;
  mode: 'weekly' | 'annual';
  data: SegmentData;
  siteRegistry: SitePageRegistryItem[]; // Global Registry for Site Pages
}

export interface SupabaseConfig {
  url: string;
  key: string;
  dashboardId: string;
}
