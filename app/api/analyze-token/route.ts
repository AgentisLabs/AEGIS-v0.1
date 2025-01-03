import { searchTokenInfo } from '@/app/utils/sources';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { address } = await request.json();
    
    if (!address) {
      return NextResponse.json({ error: 'Token address is required' }, { status: 400 });
    }

    console.log('Analyzing token:', address);
    
    // Use the simplified searchTokenInfo function that now handles everything
    const tokenInfo = await searchTokenInfo(address);
    
    if (!tokenInfo) {
      return NextResponse.json({ error: 'Failed to analyze token' }, { status: 500 });
    }

    return NextResponse.json({ data: tokenInfo });

  } catch (error) {
    console.error('Error in analyze-token:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 