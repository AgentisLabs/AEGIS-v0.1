export interface ApiResponse<T = unknown> {
  error?: string;
  data?: T;
}

export interface SearchResult {
  title: string;
  url: string;
  summary: string;
  text: string;
  highlights: string[];
}

export interface FirmAnalysis {
  firm_name: string;
  overall_score: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  sources: string[];
  twitter_data?: SearchResult[];
  propfirm_data?: SearchResult[];
  trustpilot_data?: SearchResult[];
  last_updated: string;
  times_searched: number;
  is_in_leaderboard: boolean;
}
