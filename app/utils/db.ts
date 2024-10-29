import { supabase } from '../lib/supabase';

type FirmAnalysis = {
  firm_name: string;
  times_searched: number;
  last_updated: string;
  overall_score: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  sources: string[];
};

export async function getFirmAnalysis(firmName: string) {
  try {
    const { data, error } = await supabase
      .from('firm_analyses')
      .select('*')
      .eq('firm_name', firmName.toLowerCase())
      .single();

    if (error || !data) {
      console.error('Error fetching analysis:', error);
      return null;
    }

    const analysis = data as unknown as FirmAnalysis;

    // Check if analysis needs refresh (older than 24h)
    if (analysis.last_updated && 
        new Date(analysis.last_updated) < new Date(Date.now() - 24 * 60 * 60 * 1000)) {
      console.log('Analysis is outdated, needs refresh');
      return null;
    }

    // If found and fresh, increment times_searched
    const { error: updateError } = await supabase
      .from('firm_analyses')
      .update({ times_searched: (analysis.times_searched || 0) + 1 })
      .eq('firm_name', firmName.toLowerCase());

    if (updateError) {
      console.error('Error updating search count:', updateError);
    }

    return analysis;
  } catch (error) {
    console.error('Error in getFirmAnalysis:', error);
    return null;
  }
}

export async function saveFirmAnalysis(firmName: string, analysisData: Partial<FirmAnalysis>) {
  try {
    const { data, error } = await supabase
      .from('firm_analyses')
      .upsert({
        firm_name: firmName.toLowerCase(),
        ...analysisData,
        last_updated: new Date().toISOString(),
        times_searched: 1
      })
      .select()
      .single();

    if (error || !data) {
      console.error('Error saving analysis:', error);
      throw error;
    }

    return data as unknown as FirmAnalysis;
  } catch (error) {
    console.error('Error in saveFirmAnalysis:', error);
    throw error;
  }
}

export async function logSearch(firmName: string, ipAddress?: string) {
  try {
    const { error } = await supabase
      .from('search_history')
      .insert({
        firm_name: firmName.toLowerCase(),
        ip_address: ipAddress
      });

    if (error) {
      console.error('Error logging search:', error);
    }
  } catch (error) {
    console.error('Error in logSearch:', error);
  }
}

export async function getLeaderboard(limit = 10) {
  try {
    const { data: leaderboard, error } = await supabase
      .from('firm_analyses')
      .select('firm_name, overall_score, last_updated')
      .order('overall_score', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }

    return leaderboard;
  } catch (error) {
    console.error('Error in getLeaderboard:', error);
    return [];
  }
}
