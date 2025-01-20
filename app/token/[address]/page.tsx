import { searchTokenInfo } from '@/app/utils/sources';
import { TokenAnalysis } from '@/app/types';

interface PageProps {
  params: {
    address: string;
  };
}

export default async function TokenPage({ params }: PageProps) {
  const analysis = await searchTokenInfo(params.address);

  if (!analysis) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">Token Not Found</h1>
          <p>Unable to load analysis for this token.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">
          🤖 AEGIS Analysis: ${analysis.symbol}
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Market Metrics</h2>
            <div className="space-y-2">
              <p>💰 Market Cap: ${analysis.market_data?.market_metrics?.marketCap?.toLocaleString() || 'N/A'}</p>
              <p>📊 24h Change: {analysis.market_data?.market_metrics?.price_trend?.price_change_24h?.toFixed(2) || 0}%</p>
              <p>💧 Liquidity: ${analysis.market_data?.market_metrics?.liquidity_usd?.toLocaleString() || 'N/A'}</p>
            </div>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Analysis Score</h2>
            <div className="space-y-2">
              <p>🎯 Overall Score: {analysis.overall_score}/100</p>
              <p>🌐 Social Sentiment: {analysis.social_metrics?.sentiment_score}/100</p>
              <p>🔒 Risk Level: {analysis.risk_assessment?.level}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Summary</h2>
            <p>{analysis.summary}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Strengths</h2>
              <ul className="list-disc list-inside space-y-2">
                {analysis.strengths?.map((strength, i) => (
                  <li key={i}>{strength}</li>
                ))}
              </ul>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Weaknesses</h2>
              <ul className="list-disc list-inside space-y-2">
                {analysis.weaknesses?.map((weakness, i) => (
                  <li key={i}>{weakness}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Risk Assessment</h2>
            <div className="space-y-2">
              <p>Liquidity Risk: {analysis.risk_assessment?.liquidity_risk}</p>
              <p>Volatility Risk: {analysis.risk_assessment?.volatility_risk}</p>
              <p>Manipulation Risk: {analysis.risk_assessment?.manipulation_risk}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 