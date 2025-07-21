import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ROICalculator() {
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [arrRange, setArrRange] = useState('');
  const [isCalculating, setIsCalculating] = useState(true);
  const [results, setResults] = useState<any>(null);

  useEffect(() => {
    // Get URL parameters
    const params = new URLSearchParams(location.search);
    const emailParam = params.get('email');
    const arrParam = params.get('arr');
    
    if (emailParam) setEmail(emailParam);
    if (arrParam) setArrRange(arrParam);

    // Simulate calculation
    setTimeout(() => {
      setResults(calculateROI(arrParam || ''));
      setIsCalculating(false);
    }, 2000);
  }, [location]);

  const calculateROI = (arr: string) => {
    // Calculate based on ARR range
    let baseRevenue = 0;
    switch (arr) {
      case '1-5M':
        baseRevenue = 3000000;
        break;
      case '5-15M':
        baseRevenue = 10000000;
        break;
      case '15-50M':
        baseRevenue = 32000000;
        break;
      case '50M+':
        baseRevenue = 75000000;
        break;
      default:
        baseRevenue = 10000000;
    }

    const currentDSO = 52;
    const optimizedDSO = 35;
    const revenueIncrease = Math.round(baseRevenue * 0.47);
    const workingCapitalFreed = Math.round(baseRevenue * 0.125);
    const annualSavings = Math.round(workingCapitalFreed * 0.08); // 8% cost of capital

    return {
      currentDSO,
      optimizedDSO,
      revenueIncrease,
      workingCapitalFreed,
      annualSavings,
      paybackPeriod: '4.2 months'
    };
  };

  if (isCalculating) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F7FAFC' }}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold" style={{ color: '#1B3A57' }}>
            Calculating your personalized ROI...
          </h2>
          <p className="text-gray-600 mt-2">Analyzing your {arrRange} ARR scenario</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F7FAFC' }}>
      <div className="max-w-4xl mx-auto p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#1B3A57' }}>
            Your Personalized ROI Analysis
          </h1>
          <p className="text-lg" style={{ color: '#4A5568' }}>
            Based on {arrRange} ARR • Generated for {email}
          </p>
        </div>

        {/* Results Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* DSO Improvement */}
          <div className="bg-white rounded-xl p-6 border" style={{ borderColor: '#E2E8F0' }}>
            <h3 className="text-xl font-semibold mb-4" style={{ color: '#1B3A57' }}>
              DSO Improvement
            </h3>
            <div className="flex items-center justify-between">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-500">{results?.currentDSO}</div>
                <div className="text-sm text-gray-600">Current DSO</div>
              </div>
              <div className="text-2xl text-gray-400">→</div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-500">{results?.optimizedDSO}</div>
                <div className="text-sm text-gray-600">With Mobius</div>
              </div>
            </div>
          </div>

          {/* Revenue Impact */}
          <div className="bg-white rounded-xl p-6 border" style={{ borderColor: '#E2E8F0' }}>
            <h3 className="text-xl font-semibold mb-4" style={{ color: '#1B3A57' }}>
              Revenue Acceleration
            </h3>
            <div className="text-center">
              <div className="text-3xl font-bold" style={{ color: '#F59E0B' }}>
                ${results?.revenueIncrease?.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Additional revenue in Year 1</div>
            </div>
          </div>

          {/* Working Capital */}
          <div className="bg-white rounded-xl p-6 border" style={{ borderColor: '#E2E8F0' }}>
            <h3 className="text-xl font-semibold mb-4" style={{ color: '#1B3A57' }}>
              Working Capital Freed
            </h3>
            <div className="text-center">
              <div className="text-3xl font-bold" style={{ color: '#10B981' }}>
                ${results?.workingCapitalFreed?.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Cash flow improvement</div>
            </div>
          </div>

          {/* Payback Period */}
          <div className="bg-white rounded-xl p-6 border" style={{ borderColor: '#E2E8F0' }}>
            <h3 className="text-xl font-semibold mb-4" style={{ color: '#1B3A57' }}>
              Payback Period
            </h3>
            <div className="text-center">
              <div className="text-3xl font-bold" style={{ color: '#7C3AED' }}>
                {results?.paybackPeriod}
              </div>
              <div className="text-sm text-gray-600">Return on investment</div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-white rounded-xl p-8 border text-center" style={{ borderColor: '#E2E8F0' }}>
          <h3 className="text-2xl font-semibold mb-4" style={{ color: '#1B3A57' }}>
            Ready to start your collections optimization?
          </h3>
          <p className="text-lg mb-6" style={{ color: '#4A5568' }}>
            Schedule a 30-minute implementation call with our CFO success team
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => window.location.href = '/schedule-demo'}
              className="px-8 py-3 text-lg font-semibold rounded-lg"
              style={{
                backgroundColor: '#F59E0B',
                color: 'white',
                border: 'none'
              }}
            >
              Schedule Implementation Call
            </button>
            
            <button
              onClick={() => window.location.href = '/'}
              className="px-8 py-3 text-lg font-semibold rounded-lg border-2"
              style={{
                borderColor: '#F59E0B',
                color: '#F59E0B',
                backgroundColor: 'white'
              }}
            >
              Explore More Features
            </button>
          </div>
          
          <p className="text-xs mt-4" style={{ color: '#718096' }}>
            60-day implementation • Guaranteed 25% DSO improvement • No long-term contracts
          </p>
        </div>
      </div>
    </div>
  );
}