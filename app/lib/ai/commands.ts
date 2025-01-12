import { ToolManager } from '../tools/manager';
import { JupiterSwapTool } from '../tools/jupiter-swap';

export async function handleSwapCommand(
  message: string,
  toolManager: ToolManager,
  context: any
) {
  // Example message: "Swap 1 SOL for USDC"
  const swapRegex = /swap\s+(\d+(?:\.\d+)?)\s+(\w+)\s+(?:for|to)\s+(\w+)/i;
  const match = message.match(swapRegex);

  if (match) {
    const [_, amount, inputToken, outputToken] = match;
    
    return await toolManager.executeTool('jupiter-swap-v1', {
      inputToken,
      outputToken,
      amount: parseFloat(amount)
    }, context);
  }

  return null;
} 