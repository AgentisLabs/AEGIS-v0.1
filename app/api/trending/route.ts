import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../lib/supabase';
import { searchTokenMarketData } from '@/app/utils/sources';
import { rateLimit } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const { success } = await rateLimit(ip);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Get recent analyses, ordered by most recent
    const { data: recentSearches, error } = await supabase
      .from('analyses')
      .select('token_address, analysis_data, created_at')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false });

    if (error) throw error;

    // For recent feed, just get the first occurrence of each token
    const seenTokens = new Set();
    const recentTokens = recentSearches
      .filter(search => {
        if (seenTokens.has(search.token_address)) {
          return false;
        }
        seenTokens.add(search.token_address);
        return true;
      })
      .slice(0, 10)
      .map(search => ({
        address: search.token_address,
        analysis_data: search.analysis_data,
        last_searched: search.created_at,
        search_count: recentSearches.filter(s => s.token_address === search.token_address).length
      }));

    // Get market data for each token
    const enrichedTokens = await Promise.all(
      recentTokens.map(async (token) => {
        const marketData = await searchTokenMarketData(token.address);
        return {
          address: token.address,
          marketData: marketData?.market_metrics || null,
          name: marketData?.name || token.analysis_data?.name || 'Unknown Token',
          symbol: marketData?.symbol || token.analysis_data?.symbol || 'UNKNOWN',
          price_usd: marketData?.price_usd || 0,
          search_count: token.search_count,
          last_searched: token.last_searched
        };
      })
    );

    // Filter out invalid tokens
    const validTokens = enrichedTokens
      .filter(token => token.address && token.symbol !== 'UNKNOWN');

    return NextResponse.json(validTokens);
    
  } catch (error) {
    console.error('Error in trending API route:', error);
    return NextResponse.json({ error: 'Failed to fetch trending tokens' }, { status: 500 });
  }
} 