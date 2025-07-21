import { useState } from 'react';

export default function DemoCompletion() {
  const [email, setEmail] = useState("");
  const [arrRange, setArrRange] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Submit lead data
    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          arrRange, 
          source: 'demo_completion',
          timestamp: new Date().toISOString()
        })
      });
      
      // Redirect to personalized ROI calculator or thank you page
      window.location.href = `/roi-calculator?email=${encodeURIComponent(email)}&arr=${arrRange}`;
    } catch (error) {
      console.error('Lead submission failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F7FAFC' }}>
      <div className="max-w-lg mx-auto p-8">
        
        {/* Success State */}
        <div className="text-center mb-8">
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: '#10B981' }}
          >
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h1 
            className="text-2xl font-bold mb-2"
            style={{ color: '#1B3A57' }}
          >
            You just optimized collections!
          </h1>
          
          <p 
            className="text-lg"
            style={{ color: '#4A5568' }}
          >
            Ready to see this working with your actual data?
          </p>
        </div>

        {/* Demo Results Summary */}
        <div 
          className="bg-white rounded-xl p-6 mb-8 border"
          style={{ borderColor: '#E2E8F0' }}
        >
          <h3 
            className="text-lg font-semibold mb-4"
            style={{ color: '#1B3A57' }}
          >
            What you just accomplished:
          </h3>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div 
                className="text-2xl font-bold"
                style={{ color: '#F59E0B' }}
              >
                47%
              </div>
              <div className="text-sm text-gray-600">More Revenue</div>
            </div>
            <div>
              <div 
                className="text-2xl font-bold"
                style={{ color: '#10B981' }}
              >
                17
              </div>
              <div className="text-sm text-gray-600">Days DSO Reduced</div>
            </div>
            <div>
              <div 
                className="text-2xl font-bold"
                style={{ color: '#7C3AED' }}
              >
                $127K
              </div>
              <div className="text-sm text-gray-600">Working Capital</div>
            </div>
          </div>
        </div>

        {/* Lead Capture Form */}
        <div 
          className="bg-white rounded-xl p-6 border"
          style={{ borderColor: '#E2E8F0' }}
        >
          <h3 
            className="text-xl font-semibold mb-4 text-center"
            style={{ color: '#1B3A57' }}
          >
            Calculate your company's DSO reduction
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: '#4A5568' }}
              >
                Work Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sarah@yourcompany.com"
                className="w-full p-3 border-2 rounded-lg"
                style={{ 
                  borderColor: '#E2E8F0',
                  fontSize: '16px' // Prevents zoom on mobile
                }}
                required
              />
            </div>
            
            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: '#4A5568' }}
              >
                Annual Recurring Revenue
              </label>
              <select
                value={arrRange}
                onChange={(e) => setArrRange(e.target.value)}
                className="w-full p-3 border-2 rounded-lg"
                style={{ borderColor: '#E2E8F0' }}
                required
              >
                <option value="">Select ARR range</option>
                <option value="1-5M">$1M - $5M</option>
                <option value="5-15M">$5M - $15M</option>
                <option value="15-50M">$15M - $50M</option>
                <option value="50M+">$50M+</option>
              </select>
            </div>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full p-3 text-lg font-semibold rounded-lg transition-all duration-200"
              style={{
                backgroundColor: '#F59E0B',
                color: 'white',
                border: 'none',
                opacity: isSubmitting ? 0.7 : 1
              }}
            >
              {isSubmitting ? 'Calculating...' : 'Get My ROI Calculation'}
            </button>
          </form>
          
          <p className="text-xs text-center mt-3" style={{ color: '#718096' }}>
            Personalized results in 30 seconds • No credit card required
          </p>
        </div>

        {/* Social Proof */}
        <div className="text-center mt-8">
          <p className="text-sm" style={{ color: '#4A5568' }}>
            Join 200+ SaaS CFOs who've reduced DSO by 31% in 60 days
          </p>
          
          <div className="flex items-center justify-center gap-6 mt-4 text-xs" style={{ color: '#718096' }}>
            <span>📊 SOC 2 Certified</span>
            <span>🚀 60-day ROI</span>
            <span>🤝 Relationship Safe</span>
          </div>
        </div>

        {/* Alternative: Talk to Sales */}
        <div className="text-center mt-6">
          <button
            onClick={() => window.location.href = '/schedule-demo'}
            className="text-sm underline"
            style={{ color: '#048BA8' }}
          >
            Or talk to our CFO success team instead
          </button>
        </div>
      </div>
    </div>
  );
}