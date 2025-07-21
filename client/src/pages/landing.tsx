import { Link } from "react-router-dom";
import { ArrowRight, Play } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Minimal Header */}
      <header className="absolute top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src="/logos/mobius-logo-light.png" 
                alt="Mobius One" 
                className="h-7 w-7 object-contain"
              />
              <span className="text-lg font-medium text-gray-900">Mobius One</span>
            </div>
            <Link to="/login">
              <button className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                Sign In
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section - Visual Story First */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50"></div>

        {/* Floating Elements for Visual Interest */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-gradient-to-br from-emerald-100 to-green-100 rounded-full opacity-20 animate-pulse delay-1000"></div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Side - Emotional Hook */}
            <div className="space-y-8">
              <div className="space-y-6">
                <h1 className="text-5xl lg:text-7xl font-light text-gray-900 leading-tight">
                  Collections
                  <br />
                  <span className="font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                    Without Drama
                  </span>
                </h1>

                <p className="text-xl text-gray-600 font-light leading-relaxed max-w-lg">
                  Smart collections that get your money back while keeping your customers happy.
                  Because relationships matter more than aggressive follow-ups.
                </p>
              </div>

              {/* Social Proof - Real Customer */}
              <div className="bg-white/60 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 max-w-md">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white font-semibold">
                    S
                  </div>
                  <div>
                    <blockquote className="text-gray-900 font-medium mb-2">
                      "Recovered $180K in 6 weeks. Zero complaints."
                    </blockquote>
                    <div className="text-sm text-gray-600">
                      Sarah Chen, CFO at TechFlow
                    </div>
                  </div>
                </div>
              </div>

              {/* Primary CTA */}
              <div className="space-y-4">
                <button 
                  onClick={() => window.location.href = '/collections?demo=true'}
                  className="group bg-gray-900 hover:bg-gray-800 text-white px-8 py-4 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  See How It Works
                  <ArrowRight className="inline-block ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <p className="text-sm text-gray-500">
                  Interactive demo • No signup required
                </p>
              </div>
            </div>

            {/* Right Side - Product in Action */}
            <div className="relative">
              {/* Main Product Screenshot */}
              <div className="relative bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden transform rotate-1 hover:rotate-0 transition-transform duration-700">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    <div className="ml-4 text-sm text-gray-600 font-medium">
                      Mobius Collections
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  {/* Intelligent Recommendation Card */}
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-semibold">M1</span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">TechStart Solutions</div>
                        <div className="text-sm text-gray-600">$8,500 • 8 days overdue</div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-800 italic mb-3">
                      "Strong relationship, likely oversight. Gentle reminder recommended."
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                        High confidence
                      </span>
                      <button 
                        onClick={() => window.location.href = '/collections?demo=true'}
                        className="bg-cyan-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-cyan-700 transition-colors cursor-pointer"
                      >
                        Approve
                      </button>
                    </div>
                  </div>

                  {/* Results */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-green-700">38 days</div>
                      <div className="text-xs text-green-600">Current DSO</div>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                      <div className="text-lg font-bold text-blue-700">$127K</div>
                      <div className="text-xs text-blue-600">Freed Up</div>
                    </div>
                  </div>
                </div>
              </div>


            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Minimal */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-light text-gray-900 mb-16">
            Three steps. Zero drama.
          </h2>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto">
                <span className="text-white text-xl font-medium">1</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900">Connect</h3>
              <p className="text-gray-600">Salesforce + NetSuite</p>
            </div>

            <div className="space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto">
                <span className="text-white text-xl font-medium">2</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900">Approve</h3>
              <p className="text-gray-600">Smart recommendations</p>
            </div>

            <div className="space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto">
                <span className="text-white text-xl font-medium">3</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900">Collect</h3>
              <p className="text-gray-600">Relationships intact</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-light text-white mb-8">
            Ready to recover money without the drama?
          </h2>

          <button 
            onClick={() => window.location.href = '/collections?demo=true'}
            className="group bg-white text-gray-900 px-8 py-4 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl mb-6"
          >
            Try Demo Now
            <ArrowRight className="inline-block ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </button>

          <p className="text-gray-400">
            No signup • See results instantly
          </p>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="bg-white border-t border-gray-100 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-3">
              <img 
                src="/logos/mobius-logo-light.png" 
                alt="Mobius One" 
                className="h-5 w-5 object-contain"
              />
              <span className="text-gray-600 font-medium">Mobius One</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .delay-500 {
          animation-delay: 0.5s;
        }
      `}</style>
    </div>
  );
}