import { Metadata } from 'next';
import { DAILY_SEARCH_LIMIT, DAILY_MESSAGE_LIMIT } from '../utils/db';

export const metadata: Metadata = {
  title: 'Documentation | Wexley AI',
  description: 'Documentation and roadmap for Wexley AI - AI-powered Solana token analysis'
};

export default function DocsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">AEGIS Documentation</h1>

      {/* Title and Version */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
          AEGIS: AI-Enabled Gateway for Intelligent Solana Operations
        </h2>
        <p className="text-xl text-gray-400">Whitepaper v1.0</p>
      </div>

      {/* Abstract */}
      <section className="mb-12">
        <h3 className="text-2xl font-semibold mb-4">Abstract</h3>
        <p className="text-gray-600 leading-relaxed">
          AEGIS represents a revolutionary approach to interacting with the Solana blockchain, combining advanced artificial intelligence with sophisticated on-chain operations. By leveraging multi-agent systems, natural language processing, and distributed computation, AEGIS transforms complex blockchain operations into intuitive conversations. Our platform democratizes access to sophisticated trading strategies while providing institutional-grade market intelligence through a natural language interface.
        </p>
      </section>

      {/* Introduction */}
      <section className="mb-12">
        <h3 className="text-2xl font-semibold mb-4">1. Introduction</h3>
        <p className="text-gray-600 leading-relaxed">
          The cryptocurrency market&apos;s complexity has created a significant barrier to entry for many potential participants. AEGIS addresses this challenge by introducing an AI-powered terminal that serves as an intelligent gateway to the Solana ecosystem. By combining natural language processing with collaborative AI agents, AEGIS enables users to execute complex operations through simple conversations.
        </p>
      </section>

      {/* Core Architecture */}
      <section className="mb-12">
        <h3 className="text-2xl font-semibold mb-4">2. Core Architecture</h3>
        
        <div className="space-y-6">
          <div>
            <h4 className="text-xl font-medium mb-3">2.1 Multi-Agent Collaboration Framework</h4>
            <p className="text-gray-600 mb-3">AEGIS implements a hierarchical multi-agent system:</p>
            <ul className="list-disc ml-6 text-gray-600 space-y-2">
              <li><strong>Orchestrator Agent:</strong> Coordinates agent interactions and manages task delegation</li>
              <li><strong>Analysis Agents:</strong> Specialized in different aspects of market analysis</li>
              <li><strong>Execution Agents:</strong> Handle transaction preparation and submission</li>
              <li><strong>Risk Management Agents:</strong> Monitor and evaluate operation safety</li>
              <li><strong>Memory Agents:</strong> Maintain context and historical knowledge</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xl font-medium mb-3">2.2 Natural Language Processing Layer</h4>
            <ul className="list-disc ml-6 text-gray-600 space-y-2">
              <li>Advanced context understanding for complex trading instructions</li>
              <li>Real-time translation of natural language to executable operations</li>
              <li>Continuous learning from user interactions</li>
              <li>Multi-turn conversation handling for strategy refinement</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xl font-medium mb-3">2.3 Blockchain Integration Layer</h4>
            <ul className="list-disc ml-6 text-gray-600 space-y-2">
              <li>Direct integration with Solana&apos;s programming model</li>
              <li>Custom instruction optimization for reduced latency</li>
              <li>Parallel transaction processing capabilities</li>
              <li>Multi-program interaction management</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Key Features and Use Cases */}
      <section className="mb-12">
        <h3 className="text-2xl font-semibold mb-4">3. Key Features and Use Cases</h3>
        
        <div className="space-y-6">
          <div>
            <h4 className="text-xl font-medium mb-3">3.1 Advanced Trading Operations</h4>
            
            <div className="space-y-4">
              <div>
                <h5 className="text-lg font-medium mb-2 text-gray-400">Portfolio Rebalancing</h5>
                <ul className="list-disc ml-6 text-gray-600 space-y-2">
                  <li>Natural language commands for complex rebalancing strategies</li>
                  <li>Multi-token correlation analysis</li>
                  <li>Risk-adjusted position sizing</li>
                  <li>Tax-efficient trading paths</li>
                </ul>
              </div>

              <div>
                <h5 className="text-lg font-medium mb-2 text-gray-400">Arbitrage Detection</h5>
                <ul className="list-disc ml-6 text-gray-600 space-y-2">
                  <li>Cross-DEX opportunity identification</li>
                  <li>Risk-adjusted execution paths</li>
                  <li>Gas-optimized routing</li>
                  <li>Slippage prediction and management</li>
                </ul>
              </div>

              <div>
                <h5 className="text-lg font-medium mb-2 text-gray-400">Yield Optimization</h5>
                <ul className="list-disc ml-6 text-gray-600 space-y-2">
                  <li>Automated yield farming strategies</li>
                  <li>Risk-weighted returns analysis</li>
                  <li>Impermanent loss protection</li>
                  <li>Cross-protocol yield comparison</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-xl font-medium mb-3">3.2 Market Analysis</h4>
            
            <div className="space-y-4">
              <div>
                <h5 className="text-lg font-medium mb-2 text-gray-400">On-Chain Analytics</h5>
                <ul className="list-disc ml-6 text-gray-600 space-y-2">
                  <li>Wallet behavior analysis</li>
                  <li>Token flow tracking</li>
                  <li>Smart money movement detection</li>
                  <li>Protocol usage metrics</li>
                </ul>
              </div>

              <div>
                <h5 className="text-lg font-medium mb-2 text-gray-400">Sentiment Analysis</h5>
                <ul className="list-disc ml-6 text-gray-600 space-y-2">
                  <li>Real-time social media monitoring</li>
                  <li>News impact assessment</li>
                  <li>Community engagement metrics</li>
                  <li>Trend prediction</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-xl font-medium mb-3">3.3 Risk Management</h4>
            
            <div className="space-y-4">
              <div>
                <h5 className="text-lg font-medium mb-2 text-gray-400">Token Security Analysis</h5>
                <ul className="list-disc ml-6 text-gray-600 space-y-2">
                  <li>Contract audit verification</li>
                  <li>Ownership structure analysis</li>
                  <li>Liquidity lock verification</li>
                  <li>Rugpull risk assessment</li>
                </ul>
              </div>

              <div>
                <h5 className="text-lg font-medium mb-2 text-gray-400">Portfolio Risk Assessment</h5>
                <ul className="list-disc ml-6 text-gray-600 space-y-2">
                  <li>Correlation analysis</li>
                  <li>Volatility metrics</li>
                  <li>Liquidity risk evaluation</li>
                  <li>Concentration risk monitoring</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Implementation */}
      <section className="mb-12">
        <h3 className="text-2xl font-semibold mb-4">4. Technical Implementation</h3>
        
        <div className="space-y-6">
          <div>
            <h4 className="text-xl font-medium mb-3">4.1 Adaptive Memory Network</h4>
            <p className="text-gray-600 mb-3">
              AEGIS implements a sophisticated Adaptive Memory Network (AMN) that enables agents to learn and evolve from their interactions:
            </p>
            
            <div className="space-y-4">
              <div>
                <h5 className="text-lg font-medium mb-2 text-gray-400">Distributed Knowledge Graph</h5>
                <ul className="list-disc ml-6 text-gray-600 space-y-2">
                  <li>Dynamic relationship mapping between concepts</li>
                  <li>Real-time updates from user interactions</li>
                  <li>Cross-reference verification system</li>
                  <li>Temporal context preservation</li>
                </ul>
              </div>

              <div>
                <h5 className="text-lg font-medium mb-2 text-gray-400">Experience Synthesis</h5>
                <ul className="list-disc ml-6 text-gray-600 space-y-2">
                  <li>Pattern extraction from successful interactions</li>
                  <li>Failure analysis and adaptation</li>
                  <li>Strategy refinement based on outcomes</li>
                  <li>Cross-agent knowledge sharing</li>
                </ul>
              </div>

              <div>
                <h5 className="text-lg font-medium mb-2 text-gray-400">Contextual Memory Layers</h5>
                <ul className="list-disc ml-6 text-gray-600 space-y-2">
                  <li>Short-term interaction memory</li>
                  <li>Long-term knowledge base</li>
                  <li>Market pattern repository</li>
                  <li>User preference profiles</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-xl font-medium mb-3">4.2 AI Infrastructure</h4>
            <ul className="list-disc ml-6 text-gray-600 space-y-2">
              <li>Custom-trained financial models</li>
              <li>Domain-specific instruction tuning</li>
              <li>Multi-model orchestration</li>
              <li>Continuous learning pipeline</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xl font-medium mb-3">4.3 Blockchain Integration</h4>
            <div className="space-y-4">
              <div>
                <h5 className="text-lg font-medium mb-2 text-gray-400">Solana Program Integration</h5>
                <ul className="list-disc ml-6 text-gray-600 space-y-2">
                  <li>Custom program interfaces</li>
                  <li>Transaction optimization</li>
                  <li>Account management</li>
                  <li>State compression</li>
                </ul>
              </div>

              <div>
                <h5 className="text-lg font-medium mb-2 text-gray-400">Data Pipeline</h5>
                <ul className="list-disc ml-6 text-gray-600 space-y-2">
                  <li>Real-time block processing</li>
                  <li>Account subscription management</li>
                  <li>Event processing system</li>
                  <li>Data aggregation layer</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Novel Applications */}
      <section className="mb-12">
        <h3 className="text-2xl font-semibold mb-4">5. Novel Applications</h3>
        
        <div className="space-y-6">
          <div>
            <h4 className="text-xl font-medium mb-3">5.1 Automated Strategy Creation</h4>
            <p className="text-gray-600 mb-3">
              Users can describe trading strategies in natural language, which AEGIS converts into executable programs:
            </p>
            <div className="bg-gray-800 rounded-lg p-4 font-mono text-sm text-gray-300">
              &quot;Buy SOL when Bitcoin&apos;s 4-hour RSI drops below 30 and SOL&apos;s price is above its 200-day moving average&quot;
            </div>
          </div>

          <div>
            <h4 className="text-xl font-medium mb-3">5.2 Smart Portfolio Management</h4>
            <ul className="list-disc ml-6 text-gray-600 space-y-2">
              <li>Dynamic risk adjustment based on market conditions</li>
              <li>Automated tax-loss harvesting</li>
              <li>Custom investment policy enforcement</li>
              <li>Regular rebalancing with minimal gas costs</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xl font-medium mb-3">5.3 Institutional Features</h4>
            <ul className="list-disc ml-6 text-gray-600 space-y-2">
              <li>Multi-signature operation support</li>
              <li>Compliance rule implementation</li>
              <li>Audit trail generation</li>
              <li>Custom risk limits and controls</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Development Roadmap */}
      <section className="mb-12">
        <h3 className="text-2xl font-semibold mb-4">6. Development Roadmap</h3>
        
        <div className="space-y-6">
          <div>
            <h4 className="text-xl font-medium mb-3">Phase 1: Foundation (Q1-Q2 2025)</h4>
            <ul className="list-disc ml-6 text-gray-600 space-y-2">
              <li>Core natural language processing engine</li>
              <li>Basic trading operations</li>
              <li>Initial agent collaboration framework</li>
              <li>Solana program integration</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xl font-medium mb-3">Phase 2: Enhancement (Q3-Q4 2025)</h4>
            <ul className="list-disc ml-6 text-gray-600 space-y-2">
              <li>Advanced strategy execution</li>
              <li>Custom agent creation platform</li>
              <li>Institutional features</li>
              <li>Enhanced risk management</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xl font-medium mb-3">Phase 3: Innovation (Q1-Q2 2026)</h4>
            <ul className="list-disc ml-6 text-gray-600 space-y-2">
              <li>Cross-chain operations</li>
              <li>Advanced ML model integration</li>
              <li>Decentralized agent marketplace</li>
              <li>Community governance implementation</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Security and Risk Considerations */}
      <section className="mb-12">
        <h3 className="text-2xl font-semibold mb-4">7. Security and Risk Considerations</h3>
        
        <div className="space-y-6">
          <div>
            <h4 className="text-xl font-medium mb-3">7.1 System Security</h4>
            <ul className="list-disc ml-6 text-gray-600 space-y-2">
              <li>Multi-layer authentication</li>
              <li>Hardware security module integration</li>
              <li>Regular security audits</li>
              <li>Rate limiting and anomaly detection</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xl font-medium mb-3">7.2 Operational Risk Management</h4>
            <ul className="list-disc ml-6 text-gray-600 space-y-2">
              <li>Transaction simulation</li>
              <li>Gas optimization</li>
              <li>Slippage protection</li>
              <li>Fallback mechanisms</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Business Model */}
      <section className="mb-12">
        <h3 className="text-2xl font-semibold mb-4">8. Business Model</h3>
        
        <div className="space-y-6">
          <div>
            <h4 className="text-xl font-medium mb-3">8.1 Revenue Streams</h4>
            <ul className="list-disc ml-6 text-gray-600 space-y-2">
              <li>Subscription tiers for advanced features</li>
              <li>Transaction fee sharing</li>
              <li>Custom agent development</li>
              <li>Enterprise licensing</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xl font-medium mb-3">8.2 Token Economics</h4>
            <ul className="list-disc ml-6 text-gray-600 space-y-2">
              <li>Platform utility token</li>
              <li>Staking rewards</li>
              <li>Governance rights</li>
              <li>Fee sharing mechanism</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Conclusion */}
      <section className="mb-12">
        <h3 className="text-2xl font-semibold mb-4">9. Conclusion</h3>
        <p className="text-gray-600 leading-relaxed">
          AEGIS represents a paradigm shift in how users interact with the Solana blockchain. By combining natural language processing with collaborative AI agents, we&apos;re creating a more accessible and powerful gateway to decentralized finance. Our platform democratizes access to sophisticated trading strategies while maintaining the security and efficiency expected by institutional users.
        </p>
      </section>

      {/* Future Developments */}
      <section className="mb-12">
        <h3 className="text-2xl font-semibold mb-4">10. Future Developments</h3>
        <ul className="list-disc ml-6 text-gray-600 space-y-2">
          <li>Cross-chain integration</li>
          <li>Advanced derivatives trading</li>
          <li>Institutional-grade compliance tools</li>
          <li>Decentralized agent marketplace</li>
          <li>Community-driven strategy development</li>
        </ul>
        <p className="text-gray-600 leading-relaxed mt-4">
          The future of blockchain interaction lies in making complex operations accessible through natural language while maintaining the security and efficiency of programmatic execution. AEGIS is at the forefront of this revolution, providing a platform that grows and evolves with its users&apos; needs.
        </p>
      </section>
    </div>
  );
} 