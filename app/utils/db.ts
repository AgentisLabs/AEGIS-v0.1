import { supabase } from '../lib/supabase';
import { TokenAnalysis } from '../types';

export async function getTokenAnalysis(address: string) {
  try {
    if (!address) {
      console.error('No token address provided');
      return null;
    }

    const { data, error } = await supabase
      .from('token_analyses')
      .select('*')
      .eq('address', address.toLowerCase())
      .single();

    // If no data found, return null without throwing error
    if (error?.code === 'PGRST116') {
      return null;
    }

    if (error) {
      console.error('Error fetching token analysis:', error);
      return null;
    }

    // Check if analysis needs refresh (older than 24h)
    if (data?.last_updated && 
        new Date(data.last_updated) < new Date(Date.now() - 24 * 60 * 60 * 1000)) {
      console.log('Analysis is outdated, needs refresh');
      return null;
    }

    return data as TokenAnalysis;
  } catch (error) {
    console.error('Error in getTokenAnalysis:', error);
    return null;
  }
}

export async function saveTokenAnalysis(address: string, analysisData: Partial<TokenAnalysis>) {
  try {
    const { data, error } = await supabase
      .from('token_analyses')
      .upsert({
        address: address.toLowerCase(),
        ...analysisData,
        last_updated: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving token analysis:', error);
      throw error;
    }

    // If score is high enough, update leaderboard
    if (analysisData.overall_score && analysisData.overall_score > 70) {
      await updateLeaderboard(address, data as TokenAnalysis);
    }

    return data as TokenAnalysis;
  } catch (error) {
    console.error('Error in saveTokenAnalysis:', error);
    throw error;
  }
}

export async function logSearch(address: string, ipAddress?: string) {
  try {
    // Log to search_history
    const { error: searchError } = await supabase
      .from('search_history')
      .insert({
        address: address.toLowerCase(),
        ip_address: ipAddress,
        user_agent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
        success: true
      });

    if (searchError) {
      console.error('Error logging search:', searchError);
    }

    // Get total search count
    const { count } = await supabase
      .from('search_history')
      .select('*', { count: 'exact', head: true })
      .eq('address', address.toLowerCase());

    return count || 0;
  } catch (error) {
    console.error('Error in logSearch:', error);
    return 0;
  }
}

export async function updateLeaderboard(address: string, analysis: TokenAnalysis) {
  try {
    const { error } = await supabase
      .from('token_leaderboard')
      .upsert({
        address: address.toLowerCase(),
        symbol: analysis.symbol,
        name: analysis.name,
        overall_score: analysis.overall_score,
        times_searched: analysis.times_searched,
        last_updated: new Date().toISOString()
      });

    if (error) {
      console.error('Error updating leaderboard:', error);
    }

    // Update ranks for all tokens in leaderboard
    await supabase.rpc('update_leaderboard_ranks');

  } catch (error) {
    console.error('Error in updateLeaderboard:', error);
  }
}

export async function getLeaderboard(limit = 10) {
  try {
    const { data, error } = await supabase
      .from('token_leaderboard')
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

// Helper function to check if a token exists
export async function tokenExists(address: string): Promise<boolean> {
  try {
    const { count, error } = await supabase
      .from('token_analyses')
      .select('*', { count: 'exact', head: true })
      .eq('address', address.toLowerCase());

    if (error) {
      console.error('Error checking token existence:', error);
      return false;
    }

    return (count || 0) > 0;
  } catch (error) {
    console.error('Error in tokenExists:', error);
    return false;
  }
}