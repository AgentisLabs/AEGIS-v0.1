import { Metadata } from 'next';
import { DAILY_SEARCH_LIMIT, DAILY_MESSAGE_LIMIT } from '../utils/db';

export const metadata: Metadata = {
  title: 'Documentation | Wexley AI',
  description: 'Documentation and roadmap for Wexley AI - AI-powered Solana token analysis'
};

export default function DocsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Wexley AI Documentation</h1>

      {/* Analysis Engine */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Analysis Engine</h2>
        <div className="space-y-4">
          <p className="text-gray-600">
            Our analysis engine combines on-chain data, market metrics, and social sentiment to provide comprehensive token analysis:
          </p>
          <div>
            <h3 className="text-xl font-medium mb-2">Current Features</h3>
            <ul className="list-disc ml-6 mt-2">
              <li>Real-time market data from DexScreener / Jupiter / Birdeye</li>
              <li>Social sentiment analysis from Twitter</li>
              <li>Risk assessment and scoring</li>
              <li>Liquidity analysis and manipulation detection</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-medium mb-2">Roadmap</h3>
            <ul className="list-disc ml-6 mt-2">
              <li>Integration with traditional ML libraries (TensorFlow, PyTorch)</li>
              <li>Custom model training for token classification</li>
              <li>Advanced pattern recognition for market manipulation</li>
              <li>Whale wallet tracking and analysis</li>
              <li>Cross-chain analysis capabilities</li>
              <li>Customizable analysis flows with user-defined data sources</li>
              <li>Integration of custom APIs and data feeds</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Wexley AI Assistant */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Meet Wexley</h2>
        <div className="space-y-4">
          <p className="text-gray-600">
            Wexley is your on-chain AI assistant, powered by advanced language models and integrated with Solana's Agent Kit. 
            He helps you analyze tokens, execute trades, and navigate the Solana ecosystem using natural language.
          </p>
          
          <div>
            <h3 className="text-xl font-medium mb-2">Current Capabilities</h3>
            <ul className="list-disc ml-6 mt-2">
              <li>Natural language token analysis</li>
              <li>Market insights and recommendations</li>
              <li>Risk assessment explanations</li>
              <li>Technical analysis of price charts</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-medium mb-2">Upcoming Features</h3>
            <ul className="list-disc ml-6 mt-2">
              <li>Natural language trading via Jupiter</li>
              <li>Custom agent creation platform</li>
              <li>Personalized trading strategies</li>
              <li>Multi-agent interactions</li>
              <li>Integration with Solana Agent Kit</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Development Roadmap */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Development Roadmap</h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-medium mb-2">Q1 2025</h3>
            <ul className="list-disc ml-6">
              <li>Jupiter trading integration</li>
              <li>Basic Solana Agent Kit integration</li>
              <li>Enhanced ML-powered market analysis</li>
              <li>Custom agent creation beta</li>
              <li>Custom data source integration framework</li>
              <li>Vector database integration for long-term memory</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-medium mb-2">Q2 2025</h3>
            <ul className="list-disc ml-6">
              <li>Advanced agent customization platform</li>
              <li>Multi-agent trading strategies</li>
              <li>Custom ML model training interface</li>
              <li>Portfolio management capabilities</li>
              <li>User-defined analysis workflows</li>
              <li>Incremental learning from user interactions</li>
              <li>Workflow marketplace for analysis and trading strategies</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-medium mb-2">Q3 2025</h3>
            <ul className="list-disc ml-6">
              <li>Open source agent framework for custom agents</li>
              <li>Advanced automated trading strategies</li>
              <li>Cross-chain analysis and trading</li>
              <li>Enterprise-grade agent deployment</li>
              <li>Adaptive learning from trading outcomes</li>
              <li>Personalized memory and learning patterns per agent</li>
              <li>Multi-agent orchestration and collaboration</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Technical Stack */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Technical Stack</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-medium mb-2">Core Technologies</h3>
            <ul className="list-disc ml-6">
              <li>Next.js 14 with App Router</li>
              <li>TypeScript</li>
              <li>OpenAI / Anthropic / Llama</li>
              <li>Solana Agent Kit (in progress)</li>
              <li>Jupiter SDK</li>
              <li>TensorFlow.js (upcoming)</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-medium mb-2">Data Sources</h3>
            <ul className="list-disc ml-6">
              <li>DexScreener API</li>
              <li>Jupiter API</li>
              <li>Birdeye API</li>
              <li>Twitter API</li>
              <li>On-chain data via RPC</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
} 