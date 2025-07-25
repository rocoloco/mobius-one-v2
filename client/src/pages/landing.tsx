import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle, Shield, Clock } from "lucide-react";
import { useState, useEffect } from "react";

// Interactive collections workflow demonstration
function CollectionsWorkflowDemo() {
  const [currentStep, setCurrentStep] = useState(0);
  const [dso, setDso] = useState(52);
  const [recovered, setRecovered] = useState(0);

  const steps = [
    {
      title: "Mobius 1 Analyzes Customer Data",
      description: "Scans Salesforce + NetSuite for payment history, relationship score, financial health",
      customerName: "TechStart Solutions",
      amount: "$8,500",
      daysOverdue: "8 days",
      relationshipScore: 85,
      recommendation: "Gentle reminder - strong relationship, likely oversight"
    },
    {
      title: "Smart Outreach Recommendation",
      description: "Mobius 1 generates relationship-preserving collection strategy",
      customerName: "TechStart Solutions", 
      amount: "$8,500",
      daysOverdue: "8 days",
      relationshipScore: 85,
      recommendation: "Send friendly reminder with payment link. 89% success rate for similar profiles."
    },
    {
      title: "One-Click Approval",
      description: "Human in the loop approves AI recommendation in seconds",
      customerName: "TechStart Solutions",
      amount: "$8,500", 
      daysOverdue: "8 days",
      relationshipScore: 85,
      recommendation: "✓ Approved - Automated email sent"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep(prev => (prev + 1) % steps.length);
      if (currentStep === 2) {
        setDso(prev => Math.max(35, prev - 0.5));
        setRecovered(prev => Math.min(127000, prev + 500));
      }
    }, 6000);
    
    return () => clearInterval(interval);
  }, [currentStep]);

  const currentData = steps[currentStep];

  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
      {/* Dashboard Header */}
      <div className="px-6 py-4 border-b" style={{ backgroundColor: '#F8FAFC' }}>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-400"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#10B981' }}></div>
          <div className="ml-4 text-sm font-medium" style={{ color: '#4A5568' }}>
           Mobius 1 Dashboard
          </div>
        </div>
      </div>

      {/* Live Workflow Content */}
      <div className="p-8">
        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-8">
          {steps.map((_, index) => (
            <div key={index} className="flex items-center">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  index <= currentStep 
                    ? 'text-white' 
                    : 'text-gray-400 border-2 border-gray-200'
                }`}
                style={{ 
                  backgroundColor: index <= currentStep ? '#F59E0B' : 'transparent'
                }}
              >
                {index + 1}
              </div>
              {index < steps.length - 1 && (
                <div 
                  className={`w-12 h-0.5 mx-2 ${
                    index < currentStep ? 'bg-orange-400' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Current Step */}
        <div className="text-center mb-8">
          <h3 className="text-xl font-semibold mb-2" style={{ color: '#1B3A57' }}>
            {currentData.title}
          </h3>
          <p className="text-gray-600">{currentData.description}</p>
        </div>

        {/* Customer Card */}
        <div 
          className="border rounded-xl p-6 mb-6"
          style={{ 
            borderColor: currentStep === 0 ? '#F59E0B' : currentStep === 1 ? '#7C3AED' : '#10B981',
            backgroundColor: currentStep === 0 ? '#FEF3C7' : currentStep === 1 ? '#F3E8FF' : '#D1FAE5'
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="font-semibold" style={{ color: '#1B3A57' }}>
                {currentData.customerName}
              </div>
              <div className="text-sm" style={{ color: '#4A5568' }}>
                {currentData.amount} • {currentData.daysOverdue} overdue
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Relationship Score</div>
              <div 
                className="text-2xl font-bold"
                style={{ color: '#10B981' }}
              >
                {currentData.relationshipScore}
              </div>
            </div>
          </div>
          
          <div 
            className="text-sm italic p-3 rounded-lg"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }}
          >
            {currentData.recommendation}
          </div>
        </div>

        {/* Results Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 rounded-lg" style={{ backgroundColor: '#F0FDF4' }}>
            <div className="text-2xl font-bold" style={{ color: '#10B981' }}>
              {Math.round(dso)}
            </div>
            <div className="text-sm text-gray-600">Days Sales Outstanding</div>
          </div>
          <div className="text-center p-4 rounded-lg" style={{ backgroundColor: '#FEF3C7' }}>
            <div className="text-2xl font-bold" style={{ color: '#F59E0B' }}>
              ${Math.floor(recovered / 1000)}K
            </div>
            <div className="text-sm text-gray-600">Revenue Secured</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Responsive Header */}
      <header className="absolute top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <img 
                src="/logos/mobius-logo-light.png" 
                alt="Mobius One" 
                className="h-6 w-6 sm:h-8 sm:w-8 object-contain"
              />
              <span className="text-lg sm:text-xl font-semibold" style={{ color: '#1B3A57' }}>
                Mobius One
              </span>
            </div>
            <Link to="/login">
              <button 
                className="px-4 sm:px-6 py-2 text-sm font-medium rounded-lg transition-all duration-200 border"
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

      {/* Responsive Hero Section */}
      <section 
        className="min-h-screen flex items-center justify-center relative py-16 sm:py-20 lg:py-8"
        style={{ 
          background: 'linear-gradient(135deg, #1B3A57 0%, #4A5568 100%)'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center">
            {/* Left: Value Proposition - shows first on mobile */}
            <div className="text-center lg:text-left order-1 lg:order-1 pt-4 sm:pt-0">
              {/* Trust Signal - centered on mobile, left-aligned on desktop */}
              <div className="text-center lg:text-left mb-6 sm:mb-8">
                <div 
                  className="inline-block px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium text-white/90 backdrop-blur-sm border border-white/20"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                >
                  Native Salesforce + NetSuite integration
                </div>
              </div>

              {/* 7-Word Headline - centered on mobile, left-aligned on desktop */}
              <h1 
                className="text-white mb-3 sm:mb-4 font-bold leading-tight text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-center lg:text-left"
                style={{ 
                  letterSpacing: '-0.02em'
                }}
              >
                Collections. Automated. Trusted.
              </h1>

              {/* Value Statement - centered on mobile, left-aligned on desktop */}
              <p 
                className="text-white/90 mb-4 sm:mb-6 max-w-lg mx-auto lg:mx-0 text-lg sm:text-xl text-center lg:text-left"
                style={{ 
                  lineHeight: '1.6'
                }}
              >
                Mobius 1 analyzes your customer data, preserves relationships, and accelerates payment.
              </p>

              {/* Key Differentiators - centered on mobile, left-aligned on desktop */}
              <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6 max-w-lg mx-auto lg:mx-0">
                <div className="flex items-start gap-3 text-white/90 text-sm sm:text-base justify-center lg:justify-start">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0" style={{ color: '#10B981' }} />
                  <span>First results in 2 weeks vs 12-month enterprise rollouts</span>
                </div>
                <div className="flex items-start gap-3 text-white/90 text-sm sm:text-base justify-center lg:justify-start">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0" style={{ color: '#10B981' }} />
                  <span>You see the data behind every suggested action</span>
                </div>
                <div className="flex items-start gap-3 text-white/90 text-sm sm:text-base justify-center lg:justify-start">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0" style={{ color: '#10B981' }} />
                  <span>Smart outreach that protects customer lifetime value</span>
                </div>
              </div>
            </div>

            {/* Right: Live Product Demo - shows second on mobile */}
            <div className="relative order-2 lg:order-2">
              <CollectionsWorkflowDemo />
            </div>
          </div>
        </div>
      </section>

      {/* Responsive Centered CTA Section */}
      <section className="py-8 sm:py-12 lg:py-16" style={{ backgroundColor: '#F7FAFC' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <button
            onClick={() => window.location.href = '/collections?demo=true'}
            className="w-full sm:w-auto px-8 sm:px-12 py-3 sm:py-4 text-lg sm:text-xl font-semibold rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105"
            style={{
              backgroundColor: '#F59E0B',
              color: 'white',
              border: 'none',
              minHeight: '48px',
              maxWidth: '320px'
            }}
          >
            Try Interactive Demo
            <ArrowRight className="inline-block ml-2 h-5 w-5 sm:h-6 sm:w-6" />
          </button>
          
          <p className="text-xs sm:text-sm mt-3 sm:mt-4" style={{ color: '#4A5568' }}>
            No signup required • See results instantly
          </p>
        </div>
      </section>

      {/* Responsive Results Section */}
      <section className="py-10 sm:py-12 lg:py-16" style={{ backgroundColor: '#F7FAFC' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 
            className="mb-3 sm:mb-4 font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl"
            style={{ 
              color: '#1B3A57',
              lineHeight: '1.1',
              letterSpacing: '-0.02em'
            }}
          >
            Built to reduce DSO by 15-25% within 60 days
          </h2>
          
          <p className="text-gray-600 mb-8 sm:mb-12 max-w-2xl mx-auto text-base sm:text-lg">
            Unlike 6-12 month enterprise implementations, our streamlined approach delivers measurable results in 2 weeks.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="text-center p-3 sm:p-4">
              <div 
                className="text-4xl sm:text-5xl md:text-6xl font-bold mb-1"
                style={{ color: '#F59E0B' }}
              >
                15-25%
              </div>
              <div className="text-sm sm:text-base" style={{ color: '#4A5568' }}>DSO Reduction</div>
            </div>
            <div className="text-center p-3 sm:p-4">
              <div 
                className="text-4xl sm:text-5xl md:text-6xl font-bold mb-1"
                style={{ color: '#10B981' }}
              >
                60
              </div>
              <div className="text-sm sm:text-base" style={{ color: '#4A5568' }}>Days to ROI</div>
            </div>
            <div className="text-center p-3 sm:p-4 sm:col-span-2 lg:col-span-1">
              <div 
                className="text-4xl sm:text-5xl md:text-6xl font-bold mb-1"
                style={{ color: '#7C3AED' }}
              >
                100%
              </div>
              <div className="text-sm sm:text-base" style={{ color: '#4A5568' }}>Transparent AI</div>
            </div>
          </div>
        </div>
      </section>

      {/* Responsive Testimonial */}
      <section className="py-10 sm:py-12 lg:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <blockquote 
            className="text-lg sm:text-xl md:text-2xl font-medium mb-4 sm:mb-6 leading-relaxed max-w-3xl mx-auto"
            style={{ color: '#1B3A57' }}
          >
            "At $7M ARR, our manual processes broke. Mobius One reduced our DSO from 52 to 35 days while we scaled to $15M. The AI actually works—it's not just marketing fluff."
          </blockquote>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
            <div 
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-white font-semibold"
              style={{ backgroundColor: '#10B981' }}
            >
              S
            </div>
            <div className="text-center sm:text-left">
              <div className="font-semibold text-sm sm:text-base" style={{ color: '#1B3A57' }}>
                Sarah Chen
              </div>
              <div className="text-xs sm:text-sm" style={{ color: '#4A5568' }}>
                CFO, TechFlow Solutions
              </div>
              <div className="text-xs" style={{ color: '#10B981' }}>
                17-day DSO reduction • $180K freed
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Responsive Trust Architecture */}
      <section className="py-10 sm:py-12 lg:py-16" style={{ backgroundColor: '#F7FAFC' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="text-center p-3 sm:p-4">
              <Shield className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2" style={{ color: '#10B981' }} />
              <h3 className="font-semibold mb-1 text-sm sm:text-base" style={{ color: '#1B3A57' }}>
                Secure API architecture
              </h3>
              <p className="text-xs sm:text-sm" style={{ color: '#4A5568' }}>
                Industry-standard protocols protect all data exchanges
              </p>
            </div>
            <div className="text-center p-3 sm:p-4">
              <Clock className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2" style={{ color: '#F59E0B' }} />
              <h3 className="font-semibold mb-1 text-sm sm:text-base" style={{ color: '#1B3A57' }}>
                Rapid Implementation
              </h3>
              <p className="text-xs sm:text-sm" style={{ color: '#4A5568' }}>
                Full optimization in 2 weeks vs 6-12 month enterprise rollouts
              </p>
            </div>
            <div className="text-center p-3 sm:p-4 sm:col-span-2 lg:col-span-1">
              <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2" style={{ color: '#7C3AED' }} />
              <h3 className="font-semibold mb-1 text-sm sm:text-base" style={{ color: '#1B3A57' }}>
                Human-Controlled AI
              </h3>
              <p className="text-xs sm:text-sm" style={{ color: '#4A5568' }}>
                AI recommends, you decide, complete transparency guaranteed
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Responsive Footer */}
      <footer className="bg-white border-t py-4 sm:py-6" style={{ borderColor: '#E2E8F0' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <img 
                src="/logos/mobius-logo-light.png" 
                alt="Mobius One" 
                className="h-5 w-5 sm:h-6 sm:w-6 object-contain"
              />
              <span className="font-medium text-sm sm:text-base" style={{ color: '#1B3A57' }}>
                Mobius One
              </span>
            </div>
            <div className="text-xs sm:text-sm text-center sm:text-right" style={{ color: '#4A5568' }}>
              Built for SaaS Finance Teams • Native Salesforce + NetSuite Integration
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}