import { Link } from "react-router-dom";
import { Button } from "@heroui/react";
import { 
  ArrowRight, Database, MessageSquare, BarChart3, 
  Shield, Clock, CheckCircle, Users, Globe, Zap
} from "lucide-react";

export default function LandingPage() {
  const features = [
    {
      icon: MessageSquare,
      title: "Natural Language Queries",
      description: "Ask complex business questions in plain English and get instant, accurate answers from your data."
    },
    {
      icon: Database,
      title: "Cross-System Integration",
      description: "Connect Salesforce, NetSuite, and other business systems for unified data insights."
    },
    {
      icon: BarChart3,
      title: "Real-Time Analytics",
      description: "Get up-to-date business intelligence with confidence scoring and source attribution."
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-level security with role-based access controls and audit trails."
    },
    {
      icon: Clock,
      title: "Instant Results",
      description: "Sub-second response times with intelligent caching and query optimization."
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Share insights, schedule reports, and collaborate on business intelligence."
    }
  ];

  const testimonials = [
    {
      quote: "Mobius One has transformed how our executive team accesses business data. What used to take hours now takes seconds.",
      author: "Sarah Chen",
      role: "CFO, TechCorp"
    },
    {
      quote: "The natural language interface is incredibly intuitive. Our sales team can now get pipeline insights without waiting for IT.",
      author: "Michael Rodriguez",
      role: "VP Sales, GlobalSoft"
    },
    {
      quote: "Finally, a business intelligence tool that speaks our language. The cross-system queries are game-changing.",
      author: "David Park",
      role: "CEO, InnovateLabs"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-gray-900 rounded-lg flex items-center justify-center">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-gray-900">Mobius One</span>
            </div>
            <Link to="/login">
              <button className="btn-primary">
                Sign In
                <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Business Intelligence Made Simple
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Ask questions about your business data in natural language. Get instant insights from Salesforce, NetSuite, and other systems—no technical expertise required.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link to="/login">
              <button className="btn-primary text-lg px-8 py-3">
                Get Started
                <ArrowRight className="h-5 w-5" />
              </button>
            </Link>
            <button className="btn-secondary text-lg px-8 py-3">
              Watch Demo
            </button>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              See It In Action
            </h2>
            <p className="text-gray-600">
              Watch how executives get instant answers to complex business questions
            </p>
          </div>
          
          <div className="card p-8">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-700">CEO</span>
                </div>
                <span className="text-sm text-gray-600">Sarah Chen asks:</span>
              </div>
              <div className="bg-blue-600 text-white p-4 rounded-lg mb-4 ml-8">
                "Show me this quarter's revenue vs target by region"
              </div>
            </div>
            
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-8 w-8 bg-gray-900 rounded-full flex items-center justify-center">
                  <Zap className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm text-gray-600">Mobius One responds:</span>
              </div>
              <div className="card p-4 ml-8">
                <p className="text-gray-900 mb-4">
                  Based on data from Salesforce and NetSuite, here's your Q4 revenue performance:
                </p>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">$2.8M</div>
                    <div className="text-sm text-gray-600">North America</div>
                    <div className="text-xs text-green-600">+12% vs target</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">$1.9M</div>
                    <div className="text-sm text-gray-600">Europe</div>
                    <div className="text-xs text-green-600">+8% vs target</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">$1.2M</div>
                    <div className="text-sm text-gray-600">Asia Pacific</div>
                    <div className="text-xs text-red-600">-3% vs target</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="confidence-high">94% confidence</span>
                  <span>Sources: Salesforce, NetSuite</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need for Business Intelligence
            </h2>
            <p className="text-gray-600">
              Powerful features designed for modern business leaders
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card p-6">
                <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-gray-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
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

      {/* Integration Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Connects With Your Existing Systems
          </h2>
          <p className="text-gray-600 mb-12">
            Seamlessly integrate with the business tools you already use
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center">
            <div className="card p-6">
              <div className="text-center">
                <Database className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                <span className="text-sm font-medium text-gray-700">Salesforce</span>
              </div>
            </div>
            <div className="card p-6">
              <div className="text-center">
                <BarChart3 className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                <span className="text-sm font-medium text-gray-700">NetSuite</span>
              </div>
            </div>
            <div className="card p-6">
              <div className="text-center">
                <Globe className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                <span className="text-sm font-medium text-gray-700">HubSpot</span>
              </div>
            </div>
            <div className="card p-6">
              <div className="text-center">
                <Users className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                <span className="text-sm font-medium text-gray-700">Workday</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Trusted by Business Leaders
            </h2>
            <p className="text-gray-600">
              See what executives are saying about Mobius One
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="card p-6">
                <p className="text-gray-700 mb-4 italic">
                  "{testimonial.quote}"
                </p>
                <div className="border-t border-gray-100 pt-4">
                  <div className="font-medium text-gray-900">{testimonial.author}</div>
                  <div className="text-sm text-gray-600">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Transform Your Business Intelligence?
          </h2>
          <p className="text-gray-600 mb-8">
            Join hundreds of companies using Mobius One to make faster, data-driven decisions.
          </p>
          <Link to="/login">
            <button className="btn-primary text-lg px-8 py-3">
              Start Free Trial
              <ArrowRight className="h-5 w-5" />
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-6 w-6 bg-gray-900 rounded flex items-center justify-center">
                  <Zap className="h-4 w-4 text-white" />
                </div>
                <span className="font-semibold text-gray-900">Mobius One</span>
              </div>
              <p className="text-sm text-gray-600">
                Business intelligence made simple for modern executives.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-gray-900">Features</a></li>
                <li><a href="#" className="hover:text-gray-900">Integrations</a></li>
                <li><a href="#" className="hover:text-gray-900">Security</a></li>
                <li><a href="#" className="hover:text-gray-900">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-gray-900">Documentation</a></li>
                <li><a href="#" className="hover:text-gray-900">Help Center</a></li>
                <li><a href="#" className="hover:text-gray-900">API Reference</a></li>
                <li><a href="#" className="hover:text-gray-900">Status</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-gray-900">About</a></li>
                <li><a href="#" className="hover:text-gray-900">Blog</a></li>
                <li><a href="#" className="hover:text-gray-900">Careers</a></li>
                <li><a href="#" className="hover:text-gray-900">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 mt-8 pt-8 text-center text-sm text-gray-600">
            <p>&copy; 2025 Mobius One. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}