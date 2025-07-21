import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";

// Counter animation component for metrics
function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 1000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <span className="metric-display">
      {count}{suffix}
    </span>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Minimal Header - Logo + Sign In Only */}
      <header className="absolute top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src="/logos/mobius-logo-light.png" 
                alt="Mobius One" 
                className="h-8 w-8 object-contain"
              />
              <span className="text-xl font-semibold" style={{ color: 'var(--primary-blue)' }}>
                Mobius One
              </span>
            </div>
            <Link to="/login">
              <button 
                className="px-6 py-2 text-sm font-medium rounded-lg transition-all duration-200"
                style={{ 
                  color: 'var(--professional-gray)',
                  border: '1px solid var(--professional-gray)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--professional-gray)';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--professional-gray)';
                }}
              >
                Sign In
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section - Radical Simplification */}
      <section 
        className="min-h-screen flex items-center justify-center relative overflow-hidden"
        style={{ 
          background: 'linear-gradient(135deg, var(--primary-blue) 0%, var(--professional-gray) 100%)'
        }}
      >
        {/* Single Trust Signal */}
        <div className="absolute top-28 left-1/2 transform -translate-x-1/2">
          <div 
            className="px-4 py-2 rounded-full text-sm font-medium text-white backdrop-blur-sm border border-white/20"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
          >
            Trusted by 200+ SaaS CFOs
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 text-center">
          {/* 7-Word Headline */}
          <h1 
            className="headline-primary text-white mb-6"
            style={{ fontSize: 'clamp(2.5rem, 8vw, 4rem)' }}
          >
            Collections. Automated. Trusted.
          </h1>

          {/* Single Value Proposition */}
          <p 
            className="body-executive text-white/90 mb-12 max-w-2xl mx-auto"
            style={{ fontSize: '1.25rem' }}
          >
            Turn your AR team into strategic advisors with AI that finance executives actually trust.
          </p>

          {/* Single Primary CTA */}
          <button
            onClick={() => window.location.href = '/collections?demo=true'}
            className="cta-primary mb-16 px-8 py-4 text-lg font-semibold rounded-lg shadow-lg"
            style={{
              backgroundColor: 'var(--conversion-orange)',
              color: 'white',
              border: 'none',
              minHeight: '48px', // Executive mobile optimization
              minWidth: '200px'
            }}
          >
            See Collections Automated
            <ArrowRight className="inline-block ml-2 h-5 w-5" />
          </button>

          {/* 3 Powerful Metrics */}
          <div className="flex items-center justify-center gap-12 text-white/90">
            <div className="text-center">
              <div className="text-3xl font-bold mb-1">
                <AnimatedCounter value={47} suffix="%" />
              </div>
              <div className="text-sm">More Revenue Collected</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-1">
                <AnimatedCounter value={73} suffix="%" />
              </div>
              <div className="text-sm">Less Manual Effort</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-1">
                <AnimatedCounter value={60} />
              </div>
              <div className="text-sm">Days to ROI</div>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Dashboard - Larger, More Prominent */}
      <section className="py-20" style={{ backgroundColor: 'var(--subtle-gray)' }}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 
              className="headline-primary mb-4"
              style={{ 
                fontSize: 'clamp(1.75rem, 5vw, 2.5rem)',
                color: 'var(--primary-blue)'
              }}
            >
              Watch It Work
            </h2>
          </div>

          {/* Enhanced Dashboard Preview */}
          <div 
            className="bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300 hover:scale-105 animate-gentle-float"
            style={{ border: '1px solid #E2E8F0' }}
          >
            {/* Dashboard Header */}
            <div 
              className="px-6 py-4 border-b"
              style={{ backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }}
            >
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#EF4444' }}></div>
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#F59E0B' }}></div>
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--growth-green)' }}></div>
                <div className="ml-4 text-sm font-medium" style={{ color: 'var(--professional-gray)' }}>
                  Collections Dashboard
                </div>
              </div>
            </div>

            {/* Dashboard Content - Before/After */}
            <div className="p-8">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Before State */}
                <div>
                  <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--primary-blue)' }}>
                    Before: Manual Process
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 rounded-lg" style={{ backgroundColor: '#FEF2F2' }}>
                      <span className="text-sm">Days Sales Outstanding</span>
                      <span className="font-bold text-red-600">52 days</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg" style={{ backgroundColor: '#FEF2F2' }}>
                      <span className="text-sm">Weekly Manual Hours</span>
                      <span className="font-bold text-red-600">38 hours</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg" style={{ backgroundColor: '#FEF2F2' }}>
                      <span className="text-sm">At-Risk Revenue</span>
                      <span className="font-bold text-red-600">$180K</span>
                    </div>
                  </div>
                </div>

                {/* After State */}
                <div>
                  <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--growth-green)' }}>
                    After: Mobius One
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 rounded-lg" style={{ backgroundColor: '#F0FDF4' }}>
                      <span className="text-sm">Days Sales Outstanding</span>
                      <span className="font-bold" style={{ color: 'var(--growth-green)' }}>
                        35 days
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg" style={{ backgroundColor: '#F0FDF4' }}>
                      <span className="text-sm">Weekly Manual Hours</span>
                      <span className="font-bold" style={{ color: 'var(--growth-green)' }}>
                        8 hours
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg" style={{ backgroundColor: '#F0FDF4' }}>
                      <span className="text-sm">Revenue Secured</span>
                      <span className="font-bold" style={{ color: 'var(--growth-green)' }}>
                        $127K
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Core Features - Simplified */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 
              className="headline-primary mb-4"
              style={{ 
                fontSize: 'clamp(1.75rem, 5vw, 2.5rem)',
                color: 'var(--primary-blue)'
              }}
            >
              Why Finance Teams Choose Us
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: 'var(--conversion-orange)' }}
              >
                <span className="text-white text-xl font-bold">47%</span>
              </div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--primary-blue)' }}>
                More Revenue Collected
              </h3>
              <p className="body-executive" style={{ color: 'var(--professional-gray)' }}>
                AI prioritizes based on payment probability, not just amount owed.
              </p>
            </div>

            <div className="text-center">
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: 'var(--growth-green)' }}
              >
                <span className="text-white text-xl font-bold">60</span>
              </div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--primary-blue)' }}>
                Days to ROI
              </h3>
              <p className="body-executive" style={{ color: 'var(--professional-gray)' }}>
                Unlike 12-month enterprise rollouts, see results in week 4.
              </p>
            </div>

            <div className="text-center">
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: 'var(--premium-purple)' }}
              >
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--primary-blue)' }}>
                Relationship Safe
              </h3>
              <p className="body-executive" style={{ color: 'var(--professional-gray)' }}>
                Transparent AI explains every recommendation to preserve trust.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Single Strong Testimonial */}
      <section className="py-20" style={{ backgroundColor: 'var(--subtle-gray)' }}>
        <div className="max-w-4xl mx-auto px-6 text-center">
          <blockquote 
            className="text-2xl font-medium mb-8 leading-relaxed"
            style={{ color: 'var(--primary-blue)' }}
          >
            "At $7M ARR, our manual processes broke. Mobius One reduced our DSO from 52 to 35 days while we scaled to $15M. The AI actually works—it's not just marketing."
          </blockquote>
          <div className="flex items-center justify-center gap-4">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold"
              style={{ backgroundColor: 'var(--growth-green)' }}
            >
              S
            </div>
            <div className="text-left">
              <div className="font-semibold" style={{ color: 'var(--primary-blue)' }}>
                Sarah Chen
              </div>
              <div className="text-sm" style={{ color: 'var(--professional-gray)' }}>
                CFO, TechFlow Solutions
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA - Single Action */}
      <section 
        className="py-20 text-center"
        style={{ backgroundColor: 'var(--primary-blue)' }}
      >
        <div className="max-w-4xl mx-auto px-6">
          <h2 
            className="headline-primary text-white mb-8"
            style={{ fontSize: 'clamp(1.75rem, 5vw, 2.5rem)' }}
          >
            Ready to automate collections?
          </h2>

          <button
            onClick={() => window.location.href = '/collections?demo=true'}
            className="cta-primary px-8 py-4 text-lg font-semibold rounded-lg shadow-lg mb-6"
            style={{
              backgroundColor: 'var(--conversion-orange)',
              color: 'white',
              border: 'none',
              minHeight: '48px',
              minWidth: '200px'
            }}
          >
            Try Demo Now
            <ArrowRight className="inline-block ml-2 h-5 w-5" />
          </button>

          <p className="text-white/80">
            No signup • See results instantly
          </p>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="bg-white py-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src="/logos/mobius-logo-light.png" 
                alt="Mobius One" 
                className="h-6 w-6 object-contain"
              />
              <span className="font-medium" style={{ color: 'var(--primary-blue)' }}>
                Mobius One
              </span>
            </div>
            <div className="text-sm" style={{ color: 'var(--professional-gray)' }}>
              SOC 2 Certified • Built for SaaS Finance Teams
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}