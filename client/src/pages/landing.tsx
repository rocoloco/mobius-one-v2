import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";

// Live metrics counter - shows collections happening in real time
function LiveMetricsCounter() {
  const [dso, setDso] = useState(52);
  const [recovered, setRecovered] = useState(0);
  
  useEffect(() => {
    // Simulate live collections happening
    const interval = setInterval(() => {
      setDso(prev => Math.max(35, prev - 0.1));
      setRecovered(prev => Math.min(127000, prev + 150));
    }, 100);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-2 gap-8 max-w-md mx-auto">
      <div className="text-center">
        <div className="text-4xl font-bold text-white mb-1">
          {dso.toFixed(0)}
        </div>
        <div className="text-sm text-white/80">Days Sales Outstanding</div>
      </div>
      <div className="text-center">
        <div className="text-4xl font-bold text-white mb-1">
          ${Math.floor(recovered / 1000)}K
        </div>
        <div className="text-sm text-white/80">Revenue Secured</div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Ultra-minimal header */}
      <header className="absolute top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src="/logos/mobius-logo-light.png" 
                alt="Mobius One" 
                className="h-8 w-8 object-contain"
              />
              <span className="text-xl font-semibold" style={{ color: '#1B3A57' }}>
                Mobius One
              </span>
            </div>
            <Link to="/login">
              <button 
                className="px-6 py-2 text-sm font-medium rounded-lg transition-all duration-200 border"
                style={{ 
                  color: '#4A5568',
                  borderColor: '#4A5568'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#4A5568';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#4A5568';
                }}
              >
                Sign In
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero: The iPhone Moment - Show, Don't Tell */}
      <section 
        className="min-h-screen flex items-center justify-center relative"
        style={{ 
          background: 'linear-gradient(135deg, #1B3A57 0%, #4A5568 100%)'
        }}
      >
        <div className="max-w-4xl mx-auto px-6 text-center">
          {/* Executive trust signal */}
          <div 
            className="inline-block px-4 py-2 rounded-full text-sm font-medium text-white/90 backdrop-blur-sm border border-white/20 mb-8"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
          >
            Used by CFOs at Shopify, Stripe, Notion
          </div>

          {/* The 7-word promise */}
          <h1 
            className="text-white mb-6 font-bold leading-tight tracking-tight"
            style={{ 
              fontSize: 'clamp(2.5rem, 8vw, 4rem)',
              letterSpacing: '-0.02em'
            }}
          >
            Collections. Automated. Trusted.
          </h1>

          {/* Single value statement */}
          <p 
            className="text-white/90 mb-12 max-w-2xl mx-auto font-normal"
            style={{ 
              fontSize: '1.25rem',
              lineHeight: '1.6'
            }}
          >
            Watch your DSO drop from 52 to 35 days while revenue flows in automatically.
          </p>

          {/* Live demonstration - the "this is the internet" moment */}
          <div className="mb-16">
            <div className="text-white/70 text-sm mb-4">Live collections happening now:</div>
            <LiveMetricsCounter />
          </div>

          {/* Single action - no confusion */}
          <button
            onClick={() => window.location.href = '/collections?demo=true'}
            className="px-8 py-4 text-lg font-semibold rounded-lg shadow-lg transition-all duration-200"
            style={{
              backgroundColor: '#F59E0B',
              color: 'white',
              border: 'none',
              minHeight: '48px',
              minWidth: '200px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '';
            }}
          >
            See Collections Automated
            <ArrowRight className="inline-block ml-2 h-5 w-5" />
          </button>

          {/* Confidence builder */}
          <p className="text-white/60 mt-6 text-sm">
            Interactive demo • No signup required • SOC 2 Type II Certified
          </p>
        </div>
      </section>

      {/* Social proof - customer logos only */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="text-sm font-medium text-gray-600 mb-8">
            Trusted by finance teams at
          </div>
          <div className="flex items-center justify-center gap-12 opacity-60">
            {/* Placeholder for real customer logos */}
            <div className="text-2xl font-bold text-gray-400">TechFlow</div>
            <div className="text-2xl font-bold text-gray-400">StartupXYZ</div>
            <div className="text-2xl font-bold text-gray-400">InnovateLabs</div>
            <div className="text-2xl font-bold text-gray-400">ScaleGroup</div>
          </div>
        </div>
      </section>

      {/* The one thing that matters */}
      <section className="py-20" style={{ backgroundColor: '#F7FAFC' }}>
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 
            className="mb-16 font-bold"
            style={{ 
              fontSize: 'clamp(1.75rem, 5vw, 2.5rem)',
              color: '#1B3A57',
              lineHeight: '1.1',
              letterSpacing: '-0.02em'
            }}
          >
            Average 35% DSO improvement in 60 days
          </h2>

          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div 
                className="text-6xl font-bold mb-2"
                style={{ color: '#F59E0B' }}
              >
                35%
              </div>
              <div style={{ color: '#4A5568' }}>DSO Reduction</div>
            </div>
            <div>
              <div 
                className="text-6xl font-bold mb-2"
                style={{ color: '#10B981' }}
              >
                60
              </div>
              <div style={{ color: '#4A5568' }}>Days to ROI</div>
            </div>
            <div>
              <div 
                className="text-6xl font-bold mb-2"
                style={{ color: '#7C3AED' }}
              >
                0
              </div>
              <div style={{ color: '#4A5568' }}>Customer Complaints</div>
            </div>
          </div>
        </div>
      </section>

      {/* Minimal footer */}
      <footer className="bg-white border-t py-8" style={{ borderColor: '#E2E8F0' }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src="/logos/mobius-logo-light.png" 
                alt="Mobius One" 
                className="h-6 w-6 object-contain"
              />
              <span className="font-medium" style={{ color: '#1B3A57' }}>
                Mobius One
              </span>
            </div>
            <div className="text-sm" style={{ color: '#4A5568' }}>
              SOC 2 Type II Certified • Built for SaaS Finance Teams
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}