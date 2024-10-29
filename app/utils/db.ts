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
      .from('firm_analysis')
      .select('*')
      .eq('firm_name', firmName.toLowerCase())
      .single();

    if (error) {
      console.error('DB read error:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error getting firm analysis:', error);
    return null;
  }
}

export async function saveFirmAnalysis(firmName: string, analysis: any) {
  try {
    const { data: existingData, error: checkError } = await supabase
      .from('firm_analysis')
      .select('*')
      .eq('firm_name', firmName.toLowerCase())
      .single();

    if (existingData) {
      const { data, error } = await supabase
        .from('firm_analysis')
        .update({
          ...analysis,
          updated_at: new Date().toISOString()
        })
        .eq('firm_name', firmName.toLowerCase())
        .select()
        .single();

      if (error) {
        console.error('DB update error:', error);
        throw error;
      }

      return data;
    } else {
      const { data, error } = await supabase
        .from('firm_analysis')
        .insert([
          {
            firm_name: firmName.toLowerCase(),
            ...analysis,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('DB insert error:', error);
        throw error;
      }

      return data;
    }
  } catch (error) {
    console.error('Error saving firm analysis:', error);
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
