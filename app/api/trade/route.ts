import { NextRequest, NextResponse } from 'next/server';

const API_HOST = 'https://gmgn.ai';

export async function GET(request: NextRequest) {
  try {
    const searchParams = new URLSearchParams(request.nextUrl.searchParams);
    // Always use GMGN native route
    searchParams.append('use_native', 'true');
    
    const quoteUrl = `${API_HOST}/defi/router/v1/sol/tx/get_swap_route?${searchParams}`;
    console.log('Requesting GMGN API:', quoteUrl);
    
    const response = await fetch(quoteUrl, {
      headers: {
        'Accept': 'application/json',
      }
    });
    
    if (!response.ok) {
      console.error('GMGN API error:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error details:', errorText);
      return NextResponse.json({ error: 'Failed to get quote from GMGN' }, { status: response.status });
    }

    const data = await response.json();
    console.log('GMGN API response:', JSON.stringify(data, null, 2));
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { action, ...params } = body;
  
  let url = '';
  switch (action) {
    case 'submit':
      url = `${API_HOST}/defi/router/v1/sol/tx/submit_signed_transaction`;
      break;
    case 'status':
      url = `${API_HOST}/defi/router/v1/sol/tx/get_transaction_status`;
      break;
    default:
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }

  const response = await fetch(url, {
    method: action === 'submit' ? 'POST' : 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    ...(action === 'submit' && { body: JSON.stringify(params) })
  });

  const data = await response.json();
  return NextResponse.json(data);
} 