// pages/onboarding.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight, Loader, AlertCircle } from 'lucide-react';

interface OnboardingState {
  step: 1 | 2 | 3 | 'complete';
  salesforceConnected: boolean;
  netsuiteConnected: boolean;
  overdueInvoices: any[];
  firstApprovalComplete: boolean;
}

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [state, setState] = useState<OnboardingState>({
    step: 1,
    salesforceConnected: false,
    netsuiteConnected: false,
    overdueInvoices: [],
    firstApprovalComplete: false
  });

  const [isConnecting, setIsConnecting] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);

  // Jobs Principle: Show clear progress
  const getProgressPercentage = () => {
    switch (state.step) {
      case 1: return 33;
      case 2: return 66;
      case 3: return 100;
      default: return 0;
    }
  };

  // Step 1: Connect Systems (Jobs: Remove all friction)
  const handleConnectSalesforce = async () => {
    setIsConnecting(true);
    try {
      // Demo mode: Simulate connection
      await new Promise(resolve => setTimeout(resolve, 1500));
      setState(prev => ({ ...prev, salesforceConnected: true }));

      // Jobs: Immediate gratification with real data
      await analyzeInvoices();
    } catch (error) {
      console.error('Salesforce connection failed:', error);
    }
    setIsConnecting(false);
  };

  const handleConnectNetsuite = async () => {
    setIsConnecting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1200));
      setState(prev => ({ ...prev, netsuiteConnected: true }));

      // Jobs: Show immediate value
      if (state.salesforceConnected) {
        await analyzeInvoices();
      }
    } catch (error) {
      console.error('NetSuite connection failed:', error);
    }
    setIsConnecting(false);
  };

  // Jobs: Show real data immediately, not empty states
  const analyzeInvoices = async () => {
    if (!state.salesforceConnected || !state.netsuiteConnected) return;

    // Simulate finding real invoices
    await new Promise(resolve => setTimeout(resolve, 2000));

    const mockInvoices = [
      {
        id: 1,
        customer: "TechStart Solutions",
        contactName: "Sarah Chen",
        amount: 8500,
        daysPastDue: 8,
        relationshipScore: 85,
        confidence: "High",
        recommendation: "Gentle reminder recommended - strong relationship, likely oversight"
      },
      // Add more mock invoices...
    ];

    setState(prev => ({ 
      ...prev, 
      overdueInvoices: mockInvoices,
      step: 2 
    }));
    setAnalysisComplete(true);
  };

  // Step 2: First Approval (Jobs: Single perfect action)
  const handleFirstApproval = () => {
    setState(prev => ({ 
      ...prev, 
      firstApprovalComplete: true,
      step: 3 
    }));
  };

  // Step 3: Complete Setup
  const handleCompleteOnboarding = () => {
    setState(prev => ({ ...prev, step: 'complete' }));
    // Navigate to collections dashboard
    setTimeout(() => {
      navigate('/collections');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header with Progress */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src="/logos/mobius-logo-light.png" 
                alt="Mobius One" 
                className="h-7 w-7 object-contain"
              />
              <span className="text-lg font-medium text-gray-900">Mobius One</span>
            </div>

            {/* Jobs: Clear progress indicator */}
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                {state.step === 'complete' ? 'Complete!' : `Step ${state.step} of 3`}
              </div>
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-cyan-600 to-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${getProgressPercentage()}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">

        {/* Step 1: Connect Systems */}
        {state.step === 1 && (
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold text-gray-900">
                You're 3 steps away from your first collection
              </h1>
              <p className="text-xl text-gray-600">
                Connect your systems to start recovering money without drama
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              {/* Salesforce Connection */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto">
                    <img src="/icons/salesforce.svg" alt="Salesforce" className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-semibold">Connect Salesforce</h3>
                  <p className="text-gray-600 text-sm">
                    We'll analyze your customer relationships and payment history
                  </p>

                  {state.salesforceConnected ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="w-5 h-5" />
                      <span>Connected</span>
                    </div>
                  ) : (
                    <button
                      onClick={handleConnectSalesforce}
                      disabled={isConnecting}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isConnecting ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        'Connect Salesforce'
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* NetSuite Connection */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-orange-100 rounded-xl flex items-center justify-center mx-auto">
                    <img src="/icons/netsuite.svg" alt="NetSuite" className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-semibold">Connect NetSuite</h3>
                  <p className="text-gray-600 text-sm">
                    We'll access your invoices and payment data
                  </p>

                  {state.netsuiteConnected ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="w-5 h-5" />
                      <span>Connected</span>
                    </div>
                  ) : (
                    <button
                      onClick={handleConnectNetsuite}
                      disabled={isConnecting}
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isConnecting ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        'Connect NetSuite'
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Jobs: Show immediate value after connection */}
            {state.salesforceConnected && state.netsuiteConnected && !analysisComplete && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 max-w-md mx-auto">
                <div className="flex items-center gap-3">
                  <Loader className="w-6 h-6 text-blue-600 animate-spin" />
                  <div>
                    <p className="font-medium text-blue-900">Analyzing your invoices...</p>
                    <p className="text-blue-700 text-sm">Finding collections opportunities</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: First Approval */}
        {state.step === 2 && (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full font-medium">
                <CheckCircle className="w-4 h-4" />
                Found {state.overdueInvoices.length} overdue invoices
              </div>
              <h1 className="text-4xl font-bold text-gray-900">
                Approve your first collection
              </h1>
              <p className="text-xl text-gray-600">
                We've identified the safest invoice to start with
              </p>
            </div>

            {/* Jobs: Show single perfect recommendation */}
            {state.overdueInvoices[0] && (
              <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 border-b border-gray-200">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">M1</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {state.overdueInvoices[0].customer}
                        </h3>
                        <p className="text-gray-600">
                          ${state.overdueInvoices[0].amount.toLocaleString()} • {state.overdueInvoices[0].daysPastDue} days overdue
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-gray-800 italic mb-3">
                        "{state.overdueInvoices[0].recommendation}"
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded-full">
                          {state.overdueInvoices[0].confidence} confidence
                        </span>
                        <span className="text-sm text-gray-600">
                          Relationship score: {state.overdueInvoices[0].relationshipScore}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <button
                        onClick={handleFirstApproval}
                        className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white py-4 px-6 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105"
                      >
                        Approve Collection
                        <ArrowRight className="inline-block ml-2 h-5 w-5" />
                      </button>
                      <p className="text-center text-gray-500 text-sm">
                        This will schedule the collection for 6 PM today
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Setup Complete */}
        {state.step === 3 && (
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900">
                Your collections engine is running
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Your first collection is scheduled for 6 PM today. 
                Check back tomorrow to see your results and approve more collections.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 max-w-md mx-auto">
              <h3 className="font-semibold text-gray-900 mb-4">What happens next?</h3>
              <div className="space-y-3 text-left">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-700">Collection sent at 6 PM today</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-700">New recommendations ready tomorrow</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-700">Track results in your dashboard</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleCompleteOnboarding}
              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white py-4 px-8 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105"
            >
              Go to Dashboard
              <ArrowRight className="inline-block ml-2 h-5 w-5" />
            </button>
          </div>
        )}

        {/* Complete state */}
        {state.step === 'complete' && (
          <div className="text-center space-y-6">
            <div className="animate-pulse">
              <Loader className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
              <p className="text-gray-600 mt-2">Taking you to your collections dashboard...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}