import { Connection, PublicKey, VersionedTransaction } from '@solana/web3.js';
import { AgentTool, ToolContext, ToolResponse } from './types';

const API_HOST = 'https://gmgn.ai';

export class JupiterSwapTool implements AgentTool {
  id = 'jupiter-swap-v1';
  name = 'Jupiter Swap';
  description = 'Swap tokens using GMGN Trading API';
  
  parameters = [
    {
      name: 'inputToken',
      type: 'string',
      description: 'Input token mint address or symbol (e.g., SOL, USDC)',
      required: true
    },
    {
      name: 'outputToken',
      type: 'string',
      description: 'Output token mint address or symbol',
      required: true
    },
    {
      name: 'amount',
      type: 'number',
      description: 'Amount of input tokens to swap',
      required: true
    },
    {
      name: 'slippage',
      type: 'number',
      description: 'Maximum slippage tolerance in percentage',
      required: false,
      default: 0.5
    }
  ];

  async execute(params: any, context: ToolContext): Promise<ToolResponse> {
    try {
      const { wallet } = context;
      if (!wallet.publicKey) {
        return {
          success: false,
          error: {
            code: 'NO_WALLET',
            message: 'Please connect your wallet first'
          }
        };
      }

      // 1. Get quote with anti-MEV and simulation enabled
      const quoteUrl = `${API_HOST}/defi/router/v1/sol/tx/get_swap_route?` + 
        `token_in_address=${params.inputToken}` +
        `&token_out_address=${params.outputToken}` +
        `&in_amount=${params.amount}` +
        `&from_address=${wallet.publicKey.toString()}` +
        `&slippage=${params.slippage}` +
        `&anti_mev=true` +  // Enable anti-MEV protection
        `&simulate=true`;   // Enable transaction simulation

      const routeResponse = await fetch(quoteUrl);
      const route = await routeResponse.json();

      if (!route.data) {
        throw new Error('Failed to get swap route');
      }

      // Check price impact
      const priceImpact = route.data.quote.priceImpactPct;
      if (priceImpact > 5) { // 5% price impact threshold
        throw new Error(`Price impact too high: ${priceImpact}%`);
      }

      // Verify simulation results
      if (!route.data.simulation?.success) {
        throw new Error(`Transaction simulation failed: ${route.data.simulation?.error || 'Unknown error'}`);
      }

      // Check minimum output amount
      const minOutputAmount = route.data.quote.outAmount * (1 - (params.slippage / 100));
      if (route.data.simulation.outputAmount < minOutputAmount) {
        throw new Error('Simulation output amount below minimum threshold');
      }

      // 2. Sign transaction with anti-MEV bundle
      const swapTransactionBuf = Buffer.from(route.data.raw_tx.swapTransaction, 'base64');
      const transaction = VersionedTransaction.deserialize(swapTransactionBuf);
      
      transaction.sign([wallet.payer]);
      const signedTx = Buffer.from(transaction.serialize()).toString('base64');

      // 3. Submit signed transaction with MEV protection
      const submitResponse = await fetch(
        `${API_HOST}/defi/router/v1/sol/tx/submit_signed_transaction`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            signed_tx: signedTx,
            anti_mev: true,
            max_priority_fee: route.data.mev?.suggestedPriorityFee || 0
          })
        }
      );

      const submitResult = await submitResponse.json();
      
      if (!submitResult.data?.hash) {
        throw new Error('Failed to submit transaction');
      }

      // 4. Poll for transaction status
      let status;
      for (let i = 0; i < 30; i++) { // Poll for up to 30 seconds
        const statusResponse = await fetch(
          `${API_HOST}/defi/router/v1/sol/tx/get_transaction_status?` +
          `hash=${submitResult.data.hash}&last_valid_height=${route.data.raw_tx.lastValidBlockHeight}`
        );
        
        status = await statusResponse.json();
        
        if (status.data.success || status.data.expired) {
          break;
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      if (status.data.success) {
        return {
          success: true,
          data: {
            signature: submitResult.data.hash,
            inputAmount: params.amount,
            outputAmount: route.data.quote.outAmount
          }
        };
      } else {
        throw new Error('Transaction failed or expired');
      }

    } catch (error) {
      return {
        success: false,
        error: {
          code: 'SWAP_FAILED',
          message: error.message,
          details: {
            simulation: error.simulation || null,
            priceImpact: error.priceImpact || null,
            mevProtection: error.mevProtection || null
          }
        }
      };
    }
  }
} 