const SOLSCAN_BASE_URL = 'https://public-api.solscan.io';
const SOLSCAN_API_KEY = process.env.SOLSCAN_API_KEY;

// Update the headers in our fetch calls
const headers = {
  'Accept': 'application/json',
  'Token': SOLSCAN_API_KEY
};

interface SolscanTokenResponse {
  success: boolean;
  data: {
    symbol: string;
    name: string;
    decimals: number;
    tokenAuthority: string;
    supply: string;
    type: string;
    holder: number;
  };
}

interface SolscanHolderResponse {
  success: boolean;
  data: {
    total: number;
    result: Array<{
      address: string;
      amount: string;
      rank: number;
      owner: string;
      percentage: number;
    }>;
  };
}

export async function getSolscanTokenInfo(address: string) {
  try {
    const cleanAddress = address.trim();
    console.log('Fetching Solscan data for:', cleanAddress);

    // Use the account endpoint first to verify token
    const response = await fetch(
      `${SOLSCAN_BASE_URL}/account/${cleanAddress}`,
      { headers }
    );

    if (!response.ok) {
      throw new Error(`Solscan API error: ${response.status}`);
    }

    // Then get token metadata
    const metaResponse = await fetch(
      `${SOLSCAN_BASE_URL}/token/meta?tokenAddress=${cleanAddress}`,
      { headers }
    );

    if (!metaResponse.ok) {
      throw new Error(`Solscan API error: ${metaResponse.status}`);
    }

    const data: SolscanTokenResponse = await metaResponse.json();
    console.log('Solscan token data:', data);

    return {
      name: data.data.name,
      symbol: data.data.symbol,
      total_holders: data.data.holder,
      decimals: data.data.decimals,
      total_supply: data.data.supply,
      token_type: data.data.type
    };

  } catch (error) {
    console.error('Error fetching Solscan token info:', error);
    return null;
  }
}

export async function getTopHolders(address: string) {
  try {
    const cleanAddress = address.trim();
    console.log('Fetching Solscan holders for:', cleanAddress);

    // Use the holders endpoint with proper parameters
    const response = await fetch(
      `${SOLSCAN_BASE_URL}/token/holders?tokenAddress=${cleanAddress}&offset=0&limit=20`,
      { headers }
    );

    if (!response.ok) {
      throw new Error(`Solscan API error: ${response.status}`);
    }

    const data: SolscanHolderResponse = await response.json();
    console.log('Solscan holders data:', data);

    return {
      total_holders: data.data.total,
      top_holders: data.data.result.map(holder => ({
        address: holder.owner,
        percentage: holder.percentage,
        rank: holder.rank
      }))
    };

  } catch (error) {
    console.error('Error fetching Solscan holder info:', error);
    return null;
  }
} 