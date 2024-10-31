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
    if (!firmName) {
      console.error('No firm name provided');
      return null;
    }

    const { data, error } = await supabase
      .from('firm_analyses')
      .select('*')
      .eq('firm_name', firmName.toLowerCase())
      .single();

    // If no data found, return null without throwing error
    if (error?.code === 'PGRST116') {
      return null;
    }

    if (error) {
      console.error('Error fetching analysis:', error);
      return null;
    }

    const analysis = data as unknown as FirmAnalysis;

    // Check if analysis needs refresh (older than 24h)
    if (analysis?.last_updated && 
        new Date(analysis.last_updated) < new Date(Date.now() - 24 * 60 * 60 * 1000)) {
      console.log('Analysis is outdated, needs refresh');
      return null;
    }

    // If found and fresh, increment times_searched
    if (analysis) {
      const { error: updateError } = await supabase
        .from('firm_analyses')
        .update({ times_searched: (analysis.times_searched || 0) + 1 })
        .eq('firm_name', firmName.toLowerCase());

      if (updateError) {
        console.error('Error updating search count:', updateError);
      }
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
    // Log to search_history
    const { error: searchError } = await supabase
      .from('search_history')
      .insert({
        firm_name: firmName.toLowerCase(),
        ip_address: ipAddress
      });

    if (searchError) {
      console.error('Error logging search:', searchError);
    }

    // Get total search count
    const { count } = await supabase
      .from('search_history')
      .select('*', { count: 'exact', head: true })
      .eq('firm_name', firmName.toLowerCase());

    // Update times_searched in firm_analyses
    const { error: updateError } = await supabase
      .from('firm_analyses')
      .update({ times_searched: count })
      .eq('firm_name', firmName.toLowerCase());

    // Update times_searched in leaderboard
    const { error: leaderboardError } = await supabase
      .from('leaderboard')
      .update({ times_searched: count })
      .eq('firm_name', firmName.toLowerCase());

    if (updateError || leaderboardError) {
      console.error('Error updating search count:', updateError || leaderboardError);
    }

    return count || 0;
  } catch (error) {
    console.error('Error in logSearch:', error);
    return 0;
  }
}

export async function getLeaderboard(limit = 10) {
  try {
    const { data, error } = await supabase
      .from('leaderboard')
      .select('*')
      .order('overall_score', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }

    return data;
  } catch (error) {
    console.error('Error in getLeaderboard:', error);
    return [];
  }
}

export async function updateLeaderboard(firmName: string, score: number) {
  try {
    // First, remove any existing entry for this firm
    await supabase
      .from('leaderboard')
      .delete()
      .eq('firm_name', firmName.toLowerCase());

    // Get current rank before insert
    const { data: rankings } = await supabase
      .from('leaderboard')
      .select('overall_score')
      .order('overall_score', { ascending: false });
    
    const rank = rankings ? rankings.findIndex(r => r.overall_score <= score) + 1 : 1;

    // Insert new entry
    const { data, error } = await supabase
      .from('leaderboard')
      .insert({
        firm_name: firmName.toLowerCase(),
        overall_score: score,
        rank: rank,
        last_updated: new Date().toISOString()
      })
      .select();

    if (error) {
      console.error('Error updating leaderboard:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in updateLeaderboard:', error);
    throw error;
  }
}