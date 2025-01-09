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

      {/* Current Features */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Current Features</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-medium mb-2">Token Analysis</h3>
            <p className="text-gray-600">
              Analyze any Solana token by providing its address. Our AI examines:
            </p>
            <ul className="list-disc ml-6 mt-2">
              <li>Price history and trends</li>
              <li>Liquidity analysis</li>
              <li>Social sentiment</li>
              <li>Risk assessment</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-medium mb-2">AI Chat Assistant</h3>
            <p className="text-gray-600">
              Chat with our AI to get detailed insights about tokens and market conditions.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-medium mb-2">Usage Limits</h3>
            <p className="text-gray-600">
              Free tier includes:
            </p>
            <ul className="list-disc ml-6 mt-2">
              <li>{DAILY_SEARCH_LIMIT} token analyses per day</li>
              <li>{DAILY_MESSAGE_LIMIT} chat messages per day</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Roadmap</h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-medium mb-2">Q2 2024</h3>
            <ul className="list-disc ml-6">
              <li>Trading integration with Jupiter</li>
              <li>Trade history tracking</li>
              <li>Enhanced token analysis with ML models</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-medium mb-2">Q3 2024</h3>
            <ul className="list-disc ml-6">
              <li>User accounts and authentication</li>
              <li>Portfolio tracking</li>
              <li>Custom alerts and notifications</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-medium mb-2">Q4 2024</h3>
            <ul className="list-disc ml-6">
              <li>Automated trading strategies</li>
              <li>Advanced market analytics</li>
              <li>Premium subscription tiers</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Technical Details */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Technical Details</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-medium mb-2">Technology Stack</h3>
            <ul className="list-disc ml-6">
              <li>Next.js 14 with App Router</li>
              <li>TypeScript</li>
              <li>Tailwind CSS</li>
              <li>OpenAI GPT-4</li>
              <li>Supabase</li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-medium mb-2">Data Sources</h3>
            <ul className="list-disc ml-6">
              <li>Jupiter API for price and liquidity data</li>
              <li>Birdeye API for market data</li>
              <li>Twitter API for social sentiment</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
} 