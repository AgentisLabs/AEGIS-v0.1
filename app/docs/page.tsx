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

      {/* Version */}
      <div className="mb-8">
        <h2 className="text-3xl font-semibold mb-2">Whitepaper: Version 1.0</h2>
      </div>

      {/* Abstract */}
      <section className="mb-12">
        <h3 className="text-2xl font-semibold mb-4">Abstract</h3>
        <p className="text-gray-600 leading-relaxed">
          <strong>AEGIS</strong> represents a paradigm shift in Solana token analysis and trading, combining cutting-edge artificial intelligence with robust on-chain data analysis. Leveraging multi-agent systems, advanced natural language processing (NLP), and distributed computation, our platform democratizes sophisticated trading strategies and market intelligence. By integrating a real-time data pipeline with user-friendly AI interfaces, Wexley empowers traders and institutions to harness the full potential of DeFi ecosystems on Solana. As a living document, these docs and the roadmap will evolve alongside the project. If you are reading this, you are early.
        </p>
      </section>

      {/* Core Architecture */}
      <section className="mb-12">
        <h3 className="text-2xl font-semibold mb-4">Core Architecture</h3>
        <p className="text-gray-600 mb-4">
          Wexley&apos;s architecture is built on a multi-layered AI ecosystem, providing unparalleled efficiency and accessibility:
        </p>
        <ul className="list-disc ml-6 text-gray-600 space-y-2">
          <li><strong>Multi-Layered AI Framework:</strong> Combines large language models (LLMs) with domain-specific market analysis models to deliver nuanced insights.</li>
          <li><strong>Distributed Agent Network:</strong> Facilitates parallel market analysis, personalized trading strategies, and efficient execution across Solana&apos;s ecosystem.</li>
          <li><strong>Real-Time Data Aggregation:</strong> Seamlessly integrates on-chain and off-chain data sources, ensuring a holistic view of the market.</li>
          <li><strong>Natural Language Interface:</strong> Simplifies complex trading operations with conversational commands and intuitive workflows.</li>
        </ul>
      </section>

      {/* Technical Innovation */}
      <section className="mb-12">
        <h3 className="text-2xl font-semibold mb-4">Technical Innovation</h3>
        <p className="text-gray-600 mb-4">
          <strong>Wexley AI introduces several groundbreaking capabilities:</strong>
        </p>
        <ol className="list-decimal ml-6 text-gray-600 space-y-4">
          <li>
            <strong>Advanced Pattern Recognition:</strong>
            <ul className="list-disc ml-6 mt-2">
              <li>Detects market manipulation and emerging trading patterns with precision.</li>
            </ul>
          </li>
          <li>
            <strong>Customizable Agent Framework:</strong>
            <ul className="list-disc ml-6 mt-2">
              <li>Users can create and deploy personalized trading agents tailored to their strategies.</li>
            </ul>
          </li>
          <li>
            <strong>Solana Agent Kit Integration:</strong>
            <ul className="list-disc ml-6 mt-2">
              <li>Optimizes on-chain interactions, reducing latency and costs.</li>
            </ul>
          </li>
          <li>
            <strong>Incremental Learning with Vector Databases:</strong>
            <ul className="list-disc ml-6 mt-2">
              <li>Stores and analyzes historical patterns, enabling adaptive and long-term insights.</li>
            </ul>
          </li>
        </ol>
      </section>

      {/* Market Impact */}
      <section className="mb-12">
        <h3 className="text-2xl font-semibold mb-4">Market Impact</h3>
        <p className="text-gray-600 mb-4">Wexley AI transforms the Solana trading landscape by:</p>
        <ul className="list-disc ml-6 text-gray-600 space-y-4">
          <li>
            <strong>Democratizing Advanced Trading:</strong>
            <ul className="list-disc ml-6 mt-2">
              <li>Empowering users with tools previously accessible only to institutional traders.</li>
            </ul>
          </li>
          <li>
            <strong>Enhancing Market Efficiency:</strong>
            <ul className="list-disc ml-6 mt-2">
              <li>AI-driven insights lead to better-informed trading decisions and reduced volatility.</li>
            </ul>
          </li>
          <li>
            <strong>Increasing Market Transparency:</strong>
            <ul className="list-disc ml-6 mt-2">
              <li>Mitigates manipulation through intelligent detection systems.</li>
            </ul>
          </li>
          <li>
            <strong>Lowering Barriers to Entry:</strong>
            <ul className="list-disc ml-6 mt-2">
              <li>Simplifies DeFi operations for users at all experience levels.</li>
            </ul>
          </li>
        </ul>
      </section>

      {/* Analysis Engine */}
      <section className="mb-12">
        <h3 className="text-2xl font-semibold mb-4">Analysis Engine</h3>
        <p className="text-gray-600 mb-6">
          The Wexley Analysis Engine delivers comprehensive token intelligence through:
        </p>
        
        <div className="space-y-6">
          <div>
            <h4 className="text-xl font-medium mb-3">Current Features:</h4>
            <ul className="list-disc ml-6 text-gray-600 space-y-2">
              <li><strong>Real-Time Market Data:</strong> Integrates APIs from DexScreener, Birdeye, and Jupiter.</li>
              <li><strong>Social Sentiment Analysis:</strong> Scrapes and evaluates data from Twitter and other online platforms.</li>
              <li><strong>Risk Scoring:</strong> Provides token-specific risk metrics and assessments.</li>
              <li><strong>Liquidity Analysis:</strong> Detects anomalies and evaluates market health.</li>
              <li><strong>Manipulation Detection:</strong> Flags suspicious trading patterns to protect users.</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xl font-medium mb-3">Roadmap Features:</h4>
            <ul className="list-disc ml-6 text-gray-600 space-y-2">
              <li><strong>Integration with ML Libraries:</strong> TensorFlow and PyTorch for custom model training.</li>
              <li><strong>Whale Wallet Tracking:</strong> Monitors significant market players for actionable insights.</li>
              <li><strong>Cross-Chain Analysis:</strong> Bridges insights across ecosystems to enable strategic interoperability.</li>
              <li><strong>Custom APIs and Data Feeds:</strong> Allows users to integrate proprietary data sources for analysis.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Meet Wexley */}
      <section className="mb-12">
        <h3 className="text-2xl font-semibold mb-4">Meet Wexley</h3>
        <p className="text-gray-600 mb-6">
          Wexley is an AI-powered assistant seamlessly integrated into the Solana ecosystem. It enables natural language-driven market insights, trading execution, and ecosystem navigation.
        </p>

        <div className="space-y-6">
          <div>
            <h4 className="text-xl font-medium mb-3">Current Capabilities:</h4>
            <ul className="list-disc ml-6 text-gray-600 space-y-2">
              <li><strong>Token Analysis:</strong> Explains token metrics and performance in plain language.</li>
              <li><strong>Market Insights:</strong> Provides actionable recommendations based on live data.</li>
              <li><strong>Risk Explanations:</strong> Breaks down risk scores with context.</li>
              <li><strong>Technical Chart Analysis:</strong> Highlights price trends and patterns.</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xl font-medium mb-3">Upcoming Features:</h4>
            <ul className="list-disc ml-6 text-gray-600 space-y-2">
              <li><strong>Natural Language Trading:</strong> Execute trades on Jupiter via conversational commands.</li>
              <li><strong>Custom Agent Platform:</strong> Build and deploy personalized trading agents.</li>
              <li><strong>Multi-Agent Collaboration:</strong> Combine agent insights for advanced strategies.</li>
              <li><strong>Portfolio Optimization:</strong> Leverage AI for asset allocation and risk balancing.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Development Roadmap */}
      <section className="mb-12">
        <h3 className="text-2xl font-semibold mb-4">Development Roadmap</h3>
        <div className="space-y-6">
          <div>
            <h4 className="text-xl font-medium mb-3">Q1 2025:</h4>
            <ul className="list-disc ml-6 text-gray-600 space-y-2">
              <li>Jupiter trading integration.</li>
              <li>Initial Solana Agent Kit deployment.</li>
              <li>Beta release of custom agent creation platform.</li>
              <li>Advanced ML-driven market analysis.</li>
              <li>Incremental learning with vector database integration.</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xl font-medium mb-3">Q2 2025:</h4>
            <ul className="list-disc ml-6 text-gray-600 space-y-2">
              <li>Advanced agent customization.</li>
              <li>Multi-agent strategy orchestration.</li>
              <li>Custom ML training tools for bespoke strategies.</li>
              <li>User-defined workflows for analysis.</li>
              <li>Portfolio management system with real-time optimization.</li>
              <li>Workflow marketplace for strategy sharing.</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xl font-medium mb-3">Q3 2025:</h4>
            <ul className="list-disc ml-6 text-gray-600 space-y-2">
              <li>Open-source agent framework for community-driven innovation.</li>
              <li>Cross-chain trading and analysis capabilities.</li>
              <li>Adaptive agent learning based on trading outcomes.</li>
              <li>Enterprise-grade deployment options.</li>
              <li>Collaborative multi-agent ecosystems with personalized memory.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Technical Stack */}
      <section className="mb-12">
        <h3 className="text-2xl font-semibold mb-4">Technical Stack</h3>
        <div className="space-y-6">
          <div>
            <h4 className="text-xl font-medium mb-3">Core Technologies:</h4>
            <ul className="list-disc ml-6 text-gray-600 space-y-2">
              <li><strong>Frontend:</strong> Next.js 14 with App Router, TypeScript.</li>
              <li><strong>AI Models:</strong> OpenAI, Anthropic, Llama.</li>
              <li><strong>Blockchain:</strong> Solana Agent Kit (in progress), Jupiter SDK.</li>
              <li><strong>Machine Learning:</strong> TensorFlow.js (upcoming).</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xl font-medium mb-3">Data Sources:</h4>
            <ul className="list-disc ml-6 text-gray-600 space-y-2">
              <li><strong>On-Chain:</strong> Solana RPC.</li>
              <li><strong>Off-Chain APIs:</strong> DexScreener, Birdeye, Jupiter, Twitter, CoinGecko, Exa.</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xl font-medium mb-3">Future Integrations:</h4>
            <ul className="list-disc ml-6 text-gray-600 space-y-2">
              <li>Decentralized data storage for agent state and memory.</li>
              <li>Interoperability with multi-chain ecosystems.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Conclusion */}
      <section className="mb-12">
        <h3 className="text-2xl font-semibold mb-4">Conclusion</h3>
        <p className="text-gray-600 mb-4">
          Wexley AI represents a bold step forward in DeFi innovation, bringing enterprise-grade intelligence and accessibility to Solana&apos;s vibrant ecosystem. With its modular architecture, cutting-edge AI capabilities, and user-centric design, Wexley is poised to redefine how traders and institutions navigate the blockchain.
        </p>
      </section>

      {/* Get Involved */}
      <section className="mb-12">
        <h3 className="text-2xl font-semibold mb-4">Get Involved</h3>
        <p className="text-gray-600">
          Join us on this journey. Whether you&apos;re a developer, trader, or blockchain enthusiast, your feedback and participation will shape the future of Wexley AI! Together, we&apos;re building the tools that will define the next era of decentralized finance.
        </p>
      </section>
    </div>
  );
} 