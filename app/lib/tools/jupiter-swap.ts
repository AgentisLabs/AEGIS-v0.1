import { Connection, PublicKey, VersionedTransaction } from '@solana/web3.js';
import { AgentTool, ToolContext, ToolResponse } from './types';

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

      // Use our API route instead of calling gmgn.ai directly
      const queryParams = new URLSearchParams({
        token_in_address: params.inputToken,
        token_out_address: params.outputToken,
        in_amount: params.amount.toString(),
        from_address: wallet.publicKey.toString(),
        slippage: (params.slippage || 1).toString()
      });

      console.log('Requesting quote with params:', Object.fromEntries(queryParams.entries()));

      // 1. Get quote through our API route
      const quoteResponse = await fetch(`/api/trade?${queryParams.toString()}`);
      console.log('Quote response status:', quoteResponse.status);
      
      const route = await quoteResponse.json();
      console.log('Full quote response:', JSON.stringify(route, null, 2));

      if (!route.data) {
        throw new Error(route.msg || 'Failed to get quote');
      }

      // 2. Sign transaction
      const swapTransactionBuf = Buffer.from(route.data.raw_tx.swapTransaction, 'base64');
      const transaction = VersionedTransaction.deserialize(swapTransactionBuf);
      
      console.log('Requesting wallet signature...');
      const signedTx = await wallet.signTransaction(transaction);
      const serializedTx = Buffer.from(signedTx.serialize()).toString('base64');

      // 3. Submit signed transaction through our API route
      console.log('Submitting signed transaction...');
      const submitResponse = await fetch('/api/trade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'submit',
          signed_tx: serializedTx
        })
      });

      const submitResult = await submitResponse.json();
      console.log('Submit response:', submitResult);
      
      if (!submitResult.data) {
        throw new Error(submitResult.msg || 'Failed to submit transaction');
      }

      // 4. Poll for status through our API route
      console.log('Polling for transaction status...');
      let status;
      for (let i = 0; i < 3; i++) { // Reduced polling attempts
        const statusResponse = await fetch('/api/trade', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'status',
            hash: submitResult.data.hash,
            last_valid_height: route.data.raw_tx.lastValidBlockHeight
          })
        });
        
        status = await statusResponse.json();
        console.log('Status response:', status);
        
        if (status.code === 0 && status.data?.success === true) {
          break;
        }
        
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      return {
        success: true,
        data: {
          signature: submitResult.data.hash,
          inputAmount: params.amount,
          outputAmount: route.data.quote.outAmount
        }
      };

    } catch (error) {
      console.error('Swap error:', error);
      return {
        success: false,
        error: {
          code: 'SWAP_FAILED',
          message: error.message || 'Failed to execute swap',
          details: error
        }
      };
    }
  }
} 