import { Connection, PublicKey } from '@solana/web3.js';

const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com');

export async function getTokenHolders(mintAddress: string) {
  try {
    const mint = new PublicKey(mintAddress);
    
    // Get all token accounts for this mint
    const accounts = await connection.getProgramAccounts(
      new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'), // Token program ID
      {
        filters: [
          {
            dataSize: 165, // Size of token account
          },
          {
            memcmp: {
              offset: 0,
              bytes: mint.toBase58(),
            },
          },
        ],
      }
    );

    // Filter out accounts with 0 balance
    const activeHolders = accounts.filter(account => {
      const balance = account.account.data.readBigInt64LE(64);
      return balance > 0n;
    });

    return {
      total_holders: activeHolders.length,
      unique_holders: new Set(activeHolders.map(a => a.pubkey.toString())).size
    };
  } catch (error) {
    console.error('Error fetching token holders:', error);
    return {
      total_holders: 0,
      unique_holders: 0
    };
  }
}

export function calculatePriceTrend(priceHistory: any) {
  if (!priceHistory?.last_buy?.price || !priceHistory?.last_sell?.price) {
    return {
      price_change_24h: 0,
      price_trend: 'neutral'
    };
  }

  const avgCurrentPrice = (priceHistory.last_buy.price + priceHistory.last_sell.price) / 2;
  const priceChange = ((avgCurrentPrice - priceHistory.last_sell.price) / priceHistory.last_sell.price) * 100;

  return {
    price_change_24h: priceChange,
    price_trend: priceChange > 0 ? 'up' : priceChange < 0 ? 'down' : 'neutral'
  };
} 