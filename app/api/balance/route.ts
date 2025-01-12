import { NextRequest, NextResponse } from 'next/server';
import { Connection, PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';

const RPC_ENDPOINT = process.env.NEXT_PUBLIC_RPC_ENDPOINT || 'https://api.mainnet-beta.solana.com';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const address = searchParams.get('address');
    const token = searchParams.get('token');

    if (!address || !token) {
      return NextResponse.json({ success: false, error: 'Missing parameters' }, { status: 400 });
    }

    const connection = new Connection(RPC_ENDPOINT);
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      new PublicKey(address),
      { programId: TOKEN_PROGRAM_ID }
    );

    const tokenAccount = tokenAccounts.value.find(
      account => account.account.data.parsed.info.mint === token
    );

    const balance = tokenAccount 
      ? Number(tokenAccount.account.data.parsed.info.tokenAmount.amount)
      : 0;

    return NextResponse.json({ success: true, balance });
  } catch (error) {
    console.error('Balance fetch error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch balance' }, { status: 500 });
  }
} 