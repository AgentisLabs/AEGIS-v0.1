import { supabase } from '../lib/supabase';

export const DAILY_SEARCH_LIMIT = 10;
export const DAILY_MESSAGE_LIMIT = 50;

interface UsageData {
  searches_count: number;
  messages_count: number;
  last_reset: string;
}

function isNewDay(lastReset: string): boolean {
  const lastResetDate = new Date(lastReset);
  const now = new Date();
  return lastResetDate.getUTCDate() !== now.getUTCDate() ||
         lastResetDate.getUTCMonth() !== now.getUTCMonth() ||
         lastResetDate.getUTCFullYear() !== now.getUTCFullYear();
}

export async function checkUsageLimit(
  ipAddress: string,
  type: 'search' | 'message'
): Promise<boolean> {
  try {
    // Get current usage
    const { data, error } = await supabase
      .from('daily_usage')
      .select('*')
      .eq('ip_address', ipAddress)
      .single();

    const usage = data as UsageData | null;

    // If no record exists or it's a new day, create/reset the counter
    if (!usage || isNewDay(usage.last_reset)) {
      const { error: upsertError } = await supabase
        .from('daily_usage')
        .upsert({
          ip_address: ipAddress,
          searches_count: type === 'search' ? 1 : 0,
          messages_count: type === 'message' ? 1 : 0,
          last_reset: new Date().toISOString()
        });

      if (upsertError) throw upsertError;
      return true;
    }

    // Check if limit reached
    const currentCount = type === 'search' ? usage.searches_count : usage.messages_count;
    const limit = type === 'search' ? DAILY_SEARCH_LIMIT : DAILY_MESSAGE_LIMIT;

    if (currentCount >= limit) {
      return false;
    }

    // Increment counter
    const { error: updateError } = await supabase
      .from('daily_usage')
      .update({
        [type === 'search' ? 'searches_count' : 'messages_count']: currentCount + 1
      })
      .eq('ip_address', ipAddress);

    if (updateError) throw updateError;
    return true;

  } catch (error) {
    console.error('Usage limit error:', error);
    return false;
  }
}

export async function getCurrentUsage(ipAddress: string): Promise<{
  searches: number;
  messages: number;
  searchLimit: number;
  messageLimit: number;
}> {
  try {
    const { data } = await supabase
      .from('daily_usage')
      .select('*')
      .eq('ip_address', ipAddress)
      .single();

    return {
      searches: data?.searches_count || 0,
      messages: data?.messages_count || 0,
      searchLimit: DAILY_SEARCH_LIMIT,
      messageLimit: DAILY_MESSAGE_LIMIT
    };
  } catch (error) {
    return {
      searches: 0,
      messages: 0,
      searchLimit: DAILY_SEARCH_LIMIT,
      messageLimit: DAILY_MESSAGE_LIMIT
    };
  }
}