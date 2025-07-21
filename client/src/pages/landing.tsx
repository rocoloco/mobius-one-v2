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
      title: "AI Analyzes Customer Data",
      description: "Scans Salesforce + NetSuite for payment history, relationship score, financial health",
      customerName: "TechStart Solutions",
      amount: "$8,500",
      daysOverdue: "8 days",
      relationshipScore: 85,
      recommendation: "Gentle reminder - strong relationship, likely oversight"
    },
    {
      title: "Smart Outreach Recommendation",
      description: "AI generates relationship-preserving collection strategy",
      customerName: "TechStart Solutions", 
      amount: "$8,500",
      daysOverdue: "8 days",
      relationshipScore: 85,
      recommendation: "Send friendly reminder with payment link. 89% success rate for similar profiles."
    },
    {
      title: "One-Click Approval",
      description: "CFO approves AI recommendation in seconds",
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
    }, 3000);
    
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
            Collections AI Dashboard
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
      {/* Minimal Header */}
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

      {/* Hero Section */}
      <section 
        className="min-h-screen flex items-center justify-center relative"
        style={{ 
          background: 'linear-gradient(135deg, #1B3A57 0%, #4A5568 100%)'
        }}
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Value Proposition */}
            <div className="text-center lg:text-left">
              {/* Trust Signal */}
              <div 
                className="inline-block px-4 py-2 rounded-full text-sm font-medium text-white/90 backdrop-blur-sm border border-white/20 mb-8"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
              >
                SOC 2 Type II Certified • 60-Day Implementation
              </div>

              {/* 7-Word Headline */}
              <h1 
                className="text-white mb-6 font-bold leading-tight"
                style={{ 
                  fontSize: 'clamp(2.5rem, 8vw, 4rem)',
                  letterSpacing: '-0.02em'
                }}
              >
                Collections. Automated. Trusted.
              </h1>

              {/* Value Statement */}
              <p 
                className="text-white/90 mb-8 max-w-lg"
                style={{ 
                  fontSize: '1.25rem',
                  lineHeight: '1.6'
                }}
              >
                AI analyzes your customer data, preserves relationships, and accelerates payment by 35% in 60 days.
              </p>

              {/* Key Differentiators */}
              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 text-white/90">
                  <CheckCircle className="w-5 h-5" style={{ color: '#10B981' }} />
                  <span>60-day implementation vs 12-month enterprise rollouts</span>
                </div>
                <div className="flex items-center gap-3 text-white/90">
                  <Shield className="w-5 h-5" style={{ color: '#10B981' }} />
                  <span>Transparent AI explains every recommendation</span>
                </div>
                <div className="flex items-center gap-3 text-white/90">
                  <Clock className="w-5 h-5" style={{ color: '#10B981' }} />
                  <span>Zero relationship damage with smart outreach</span>
                </div>
              </div>

              {/* Single CTA */}
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

              <p className="text-white/60 mt-4 text-sm">
                Interactive demo • No signup required
              </p>
            </div>

            {/* Right: Live Product Demo */}
            <div className="relative">
              <CollectionsWorkflowDemo />
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-20" style={{ backgroundColor: '#F7FAFC' }}>
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 
            className="mb-4 font-bold"
            style={{ 
              fontSize: 'clamp(1.75rem, 5vw, 2.5rem)',
              color: '#1B3A57',
              lineHeight: '1.1',
              letterSpacing: '-0.02em'
            }}
          >
            Average 35% DSO improvement in 60 days
          </h2>
          
          <p className="text-gray-600 mb-16 max-w-2xl mx-auto">
            Unlike 6-12 month enterprise implementations, our staged approach delivers measurable results quickly.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div 
                className="text-6xl font-bold mb-2"
                style={{ color: '#F59E0B' }}
              >
                35%
              </div>
              <div style={{ color: '#4A5568' }}>DSO Reduction</div>
            </div>
            <div className="text-center">
              <div 
                className="text-6xl font-bold mb-2"
                style={{ color: '#10B981' }}
              >
                60
              </div>
              <div style={{ color: '#4A5568' }}>Days to ROI</div>
            </div>
            <div className="text-center">
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

      {/* Single Strong Testimonial */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <blockquote 
            className="text-2xl font-medium mb-8 leading-relaxed max-w-3xl mx-auto"
            style={{ color: '#1B3A57' }}
          >
            "At $7M ARR, our manual processes broke. Mobius One reduced our DSO from 52 to 35 days while we scaled to $15M. The AI actually works—it's not just marketing fluff."
          </blockquote>
          <div className="flex items-center justify-center gap-4">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold"
              style={{ backgroundColor: '#10B981' }}
            >
              S
            </div>
            <div className="text-left">
              <div className="font-semibold" style={{ color: '#1B3A57' }}>
                Sarah Chen
              </div>
              <div className="text-sm" style={{ color: '#4A5568' }}>
                CFO, TechFlow Solutions
              </div>
              <div className="text-xs" style={{ color: '#10B981' }}>
                17-day DSO reduction • $180K freed
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Architecture */}
      <section className="py-16" style={{ backgroundColor: '#F7FAFC' }}>
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <Shield className="w-8 h-8 mx-auto mb-3" style={{ color: '#10B981' }} />
              <h3 className="font-semibold mb-2" style={{ color: '#1B3A57' }}>
                Enterprise Security
              </h3>
              <p className="text-sm" style={{ color: '#4A5568' }}>
                SOC 2 Type II certified with bank-level encryption
              </p>
            </div>
            <div className="text-center">
              <Clock className="w-8 h-8 mx-auto mb-3" style={{ color: '#F59E0B' }} />
              <h3 className="font-semibold mb-2" style={{ color: '#1B3A57' }}>
                Rapid Implementation
              </h3>
              <p className="text-sm" style={{ color: '#4A5568' }}>
                60-day deployment vs 6-12 month enterprise rollouts
              </p>
            </div>
            <div className="text-center">
              <CheckCircle className="w-8 h-8 mx-auto mb-3" style={{ color: '#7C3AED' }} />
              <h3 className="font-semibold mb-2" style={{ color: '#1B3A57' }}>
                Guaranteed Results
              </h3>
              <p className="text-sm" style={{ color: '#4A5568' }}>
                ROI guarantee with transparent AI decision-making
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Minimal Footer */}
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
              Built for SaaS Finance Teams • Native Salesforce + NetSuite Integration
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}