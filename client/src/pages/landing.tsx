import { Link } from "react-router-dom";
import { Button } from "@heroui/react";
import { 
  ArrowRight, DollarSign, TrendingUp, Clock, 
  Shield, CheckCircle, Users, Globe, Target,
  AlertTriangle, Zap
} from "lucide-react";

export default function LandingPage() {
  const features = [
    {
      icon: DollarSign,
      title: "Autonomous Collections",
      description: "AI-powered collection recommendations that reduce DSO by 15+ days while preserving customer relationships."
    },
    {
      icon: TrendingUp,
      title: "Working Capital Optimization",
      description: "Free up $100K+ in working capital through intelligent cash flow acceleration and payment velocity improvements."
    },
    {
      icon: Target,
      title: "One-Click Approvals",
      description: "Review and approve AI recommendations in under 30 seconds with confidence scoring and relationship risk assessment."
    },
    {
      icon: Shield,
      title: "Relationship Preservation",
      description: "Advanced relationship scoring ensures collections actions protect customer lifetime value and expansion opportunities."
    },
    {
      icon: Clock,
      title: "30-Day Implementation",
      description: "Complete setup in 30 days vs 18 months for enterprise tools. Start seeing results immediately."
    },
    {
      icon: Users,
      title: "Salesforce + NetSuite",
      description: "Pre-built integrations with your existing CRM and ERP systems. No professional services required."
    }
  ];

  const testimonials = [
    {
      quote: "Mobius One reduced our DSO from 58 to 41 days in 6 weeks. We freed up $180K in working capital without losing a single customer.",
      author: "Sarah Chen",
      role: "CFO, TechFlow Solutions",
      metrics: "$180K freed, 17-day DSO reduction"
    },
    {
      quote: "The AI recommendations are spot-on. 94% approval rate and zero relationship damage. Our collections team loves it.",
      author: "Michael Rodriguez", 
      role: "AR Manager, StartupXYZ",
      metrics: "94% approval rate, 0 complaints"
    },
    {
      quote: "Finally, collections that actually preserve relationships. Our expansion revenue is up 23% since implementation.",
      author: "David Park",
      role: "CEO, InnovateLabs",
      metrics: "23% expansion growth"
    }
  ];

  const comparisonData = [
    { feature: "Implementation Time", mobius: "30 days", enterprise: "18 months" },
    { feature: "Setup Cost", mobius: "$0", enterprise: "$50K+" },
    { feature: "Time to Value", mobius: "Week 1", enterprise: "Month 18" },
    { feature: "Professional Services", mobius: "Not required", enterprise: "Required" },
    { feature: "Relationship Preservation", mobius: "Built-in", enterprise: "Manual" },
    { feature: "Approval Speed", mobius: "<30 seconds", enterprise: "15+ minutes" }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img 
                src="/logos/mobius-logo-light.png" 
                alt="Mobius Logo" 
                className="h-8 w-8 object-contain"
              />
              <span className="text-xl font-semibold text-gray-900">Mobius One</span>
            </div>
            <Link to="/login">
              <button style={{
                background: 'linear-gradient(135deg, #048BA8 0%, #061A40 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 16px',
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}>
                Sign In
                <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm font-medium">
                  Collections Acceleration Engine
                </div>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                Reduce DSO by 15+ Days
                <span className="text-blue-600"> Without Losing Customers</span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 mb-8 leading-relaxed">
                Autonomous revenue optimization that accelerates collections while preserving customer relationships. 
                Free up $100K+ in working capital with AI-powered collection recommendations.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link to="/login" className="w-full sm:w-auto">
                  <button style={{
                    background: 'linear-gradient(135deg, #048BA8 0%, #061A40 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px 24px',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease',
                    width: '100%',
                    maxWidth: '100%',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    Start 30-Day Trial
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </Link>
                <button style={{
                  background: 'white',
                  color: '#048BA8',
                  border: '2px solid #048BA8',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  width: '100%',
                  maxWidth: '100%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }} className="w-full sm:w-auto">
                  Watch Demo
                </button>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span>30-day implementation</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span>No professional services</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span>Zero relationship damage</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white rounded-xl shadow-2xl p-8 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Collections Dashboard</h3>
                  <div className="bg-green-100 text-green-700 px-2 py-1 rounded text-sm font-medium">
                    Live
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">38 days</div>
                    <div className="text-sm text-gray-600">Current DSO</div>
                    <div className="text-green-600 text-sm">↓ 16 days</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">$127K</div>
                    <div className="text-sm text-gray-600">Capital Freed</div>
                    <div className="text-green-600 text-sm">↑ $87K</div>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">AI Recommendation</span>
                    <span className="text-sm font-medium text-green-600">94% confidence</span>
                  </div>
                  <div className="text-sm text-gray-900">
                    Send gentle reminder to Acme Corp with payment plan options
                  </div>
                  <button className="mt-3 w-full bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium">
                    Approve Action
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why SaaS CFOs Choose Mobius One
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The only collections platform built specifically for SaaS companies hitting the $5M ARR breaking point
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-shadow">
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              18x Faster Than Enterprise Tools
            </h2>
            <p className="text-xl text-gray-600">
              Skip the 18-month implementation. Get results in 30 days.
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="grid grid-cols-3 bg-gray-50 p-4">
              <div className="font-semibold text-gray-900">Feature</div>
              <div className="font-semibold text-blue-600 text-center">Mobius One</div>
              <div className="font-semibold text-gray-600 text-center">Enterprise Tools</div>
            </div>
            {comparisonData.map((row, index) => (
              <div key={index} className="grid grid-cols-3 p-4 border-t border-gray-100">
                <div className="text-gray-900">{row.feature}</div>
                <div className="text-center text-blue-600 font-medium">{row.mobius}</div>
                <div className="text-center text-gray-600">{row.enterprise}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Proven Results for SaaS Companies
            </h2>
            <p className="text-xl text-gray-600">
              Finance leaders share their success stories
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-4 w-4 text-yellow-400 fill-current">★</div>
                  ))}
                </div>
                <blockquote className="text-gray-900 mb-4 italic">
                  "{testimonial.quote}"
                </blockquote>
                <div className="border-t pt-4">
                  <div className="font-semibold text-gray-900">{testimonial.author}</div>
                  <div className="text-gray-600 text-sm">{testimonial.role}</div>
                  <div className="text-blue-600 text-sm font-medium mt-1">{testimonial.metrics}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 leading-tight">
            Ready to Free Up $100K+ in Working Capital?
          </h2>
          <p className="text-lg sm:text-xl text-blue-100 mb-8 leading-relaxed">
            Join SaaS CFOs who've reduced DSO by 15+ days in 30 days. Zero relationship damage guaranteed.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/login" className="w-full sm:w-auto">
              <button style={{
                background: 'white',
                color: '#048BA8',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                fontFamily: 'Inter, sans-serif',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
                width: '100%',
                maxWidth: '100%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                Start 30-Day Trial
                <ArrowRight className="h-5 w-5" />
              </button>
            </Link>
            <button style={{
              background: 'transparent',
              color: 'white',
              border: '2px solid white',
              borderRadius: '8px',
              padding: '12px 24px',
              fontFamily: 'Inter, sans-serif',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              width: '100%',
              maxWidth: '100%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }} className="w-full sm:w-auto">
              Schedule Demo
            </button>
          </div>
          <div className="mt-8 text-blue-100 text-sm">
            No credit card required • 30-day money-back guarantee • Cancel anytime
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img 
                  src="/logos/mobius-logo-dark.png" 
                  alt="Mobius Logo" 
                  className="h-8 w-8 object-contain"
                />
                <span className="text-xl font-semibold">Mobius One</span>
              </div>
              <p className="text-gray-400 mb-4">
                Autonomous revenue optimization for SaaS companies.
              </p>
              <div className="flex gap-4">
                <Globe className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer" />
                <Users className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer" />
                <Shield className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer" />
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <div className="space-y-2 text-gray-400">
                <div>Collections Engine</div>
                <div>DSO Analytics</div>
                <div>System Integrations</div>
                <div>AI Recommendations</div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <div className="space-y-2 text-gray-400">
                <div>Documentation</div>
                <div>API Reference</div>
                <div>Case Studies</div>
                <div>Support</div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <div className="space-y-2 text-gray-400">
                <div>About</div>
                <div>Privacy Policy</div>
                <div>Terms of Service</div>
                <div>Security</div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Mobius One. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}