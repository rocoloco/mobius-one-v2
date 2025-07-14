import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DollarSign, Clock, Shield, BarChart3, ArrowRight, CheckCircle, Menu, X } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface Invoice {
  id: number;
  invoiceNumber: string;
  customer: string;
  contactName: string;
  amount: number;
  daysPastDue: number;
  relationshipScore: number;
  aiRecommendation: string;
  recommendationConfidence: number;
  approvalStatus: string;
  riskLevel: 'low' | 'medium' | 'high';
  relationship: string;
  situation: string;
  aiMessage: string;
}

interface CollectionMetrics {
  revenueAccelerated: number;
  timeSaved: number;
  relationshipsProtected: number;
  aiLearningProgress: number;
  remainingQueue: number;
}

export default function CollectionsPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [metrics, setMetrics] = useState<CollectionMetrics>({
    revenueAccelerated: 127500,
    timeSaved: 12.5,
    relationshipsProtected: 100,
    aiLearningProgress: 73,
    remainingQueue: 8
  });
  const [isAnimating, setIsAnimating] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Mock data for demonstration - in real app this would come from API
  const invoices: Invoice[] = [
    {
      id: 1,
      invoiceNumber: "INV-2024-001",
      customer: "Acme Corp",
      contactName: "Sarah Johnson",
      amount: 15750,
      daysPastDue: 45,
      relationshipScore: 85,
      aiRecommendation: "Send gentle reminder with payment plan options",
      recommendationConfidence: 94,
      approvalStatus: "pending",
      riskLevel: "medium",
      relationship: "valued partner",
      situation: "going through a tough quarter",
      aiMessage: "Based on their payment history and current market conditions, I recommend a supportive approach with flexible payment terms. They've been reliable for 3 years."
    },
    {
      id: 2,
      invoiceNumber: "INV-2024-002",
      customer: "TechFlow Solutions",
      contactName: "Michael Chen",
      amount: 8500,
      daysPastDue: 30,
      relationshipScore: 92,
      aiRecommendation: "Friendly check-in call",
      recommendationConfidence: 87,
      approvalStatus: "pending",
      riskLevel: "low",
      relationship: "long-term client",
      situation: "likely oversight",
      aiMessage: "Their payment pattern suggests this is simply an oversight. A friendly reminder should resolve this quickly without any relationship damage."
    },
    {
      id: 3,
      invoiceNumber: "INV-2024-003",
      customer: "StartupXYZ",
      contactName: "David Park",
      amount: 22000,
      daysPastDue: 65,
      relationshipScore: 62,
      aiRecommendation: "Escalate to collections agency",
      recommendationConfidence: 78,
      approvalStatus: "pending",
      riskLevel: "high",
      relationship: "new client",
      situation: "showing concerning payment patterns",
      aiMessage: "Multiple missed payments and declining communication. Time to escalate while preserving professional relationship for potential future recovery."
    }
  ];

  const currentInvoice = invoices[currentIndex];

  const updateMetrics = (action: 'send' | 'write' | 'skip') => {
    setIsAnimating(true);
    
    if (action === 'send') {
      setMetrics(prev => ({
        ...prev,
        revenueAccelerated: prev.revenueAccelerated + currentInvoice.amount,
        timeSaved: prev.timeSaved + 2.5,
        remainingQueue: prev.remainingQueue - 1
      }));
    } else if (action === 'write') {
      setMetrics(prev => ({
        ...prev,
        revenueAccelerated: prev.revenueAccelerated + currentInvoice.amount,
        timeSaved: prev.timeSaved + 1.5,
        remainingQueue: prev.remainingQueue - 1
      }));
    } else {
      setMetrics(prev => ({
        ...prev,
        remainingQueue: prev.remainingQueue - 1
      }));
    }

    setTimeout(() => setIsAnimating(false), 500);
  };

  const handleAction = (action: 'send' | 'write' | 'skip') => {
    updateMetrics(action);
    setIsMobileMenuOpen(false); // Close mobile menu if open
    
    setTimeout(() => {
      setCurrentIndex(prev => (prev + 1) % invoices.length);
    }, 300);

    const actionMessages = {
      send: 'AI message sent successfully!',
      write: 'Custom message template opened',
      skip: 'Invoice skipped for later review'
    };

    toast({
      title: actionMessages[action],
      description: `${currentInvoice.customer} - $${currentInvoice.amount.toLocaleString()}`,
    });
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Sidebar Content Component
  const SidebarContent = () => (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <img 
            src="/logos/mobius-logo-light.png" 
            alt="Mobius Logo" 
            className="w-8 h-8 object-contain"
          />
          <h1 className="text-xl font-bold text-gray-900">Collections</h1>
        </div>
      </div>

      {/* Today's Impact */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Today's Impact</h2>
        
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Revenue Accelerated</p>
              <p className={`text-lg font-semibold text-gray-900 transition-transform duration-500 ${isAnimating ? 'scale-110' : ''}`}>
                {formatCurrency(metrics.revenueAccelerated)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Time Saved</p>
              <p className={`text-lg font-semibold text-gray-900 transition-transform duration-500 ${isAnimating ? 'scale-110' : ''}`}>
                {metrics.timeSaved} hours
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <Shield className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Relationships Protected</p>
              <p className="text-lg font-semibold text-gray-900">
                {metrics.relationshipsProtected}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Learning */}
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Learning</h3>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Progress</span>
            <span className="text-sm font-semibold text-gray-900">{metrics.aiLearningProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-cyan-600 to-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${metrics.aiLearningProgress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Learning from your approval patterns
          </p>
        </div>
      </div>

      {/* Queue Status */}
      <div className="flex-1 flex flex-col justify-end p-6">
        <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2">
          <BarChart3 className="w-5 h-5" />
          See Full Queue ({metrics.remainingQueue} remaining)
        </button>
      </div>
    </div>
  );

  if (!currentInvoice) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">All Done!</h2>
          <p className="text-gray-600">You've processed all invoices in your queue.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Desktop Layout */}
      <div className="hidden md:flex min-h-screen">
        {/* Left Sidebar - Fixed 280px */}
        <div className="w-80 bg-white shadow-xl">
          <SidebarContent />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-3xl">
            {/* Main Card */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              {/* Color-coded header bar */}
              <div className={`h-2 ${getRiskColor(currentInvoice.riskLevel)}`} />
              
              {/* Card Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  <span className="font-semibold">{formatCurrency(currentInvoice.amount)}</span>
                  <span>•</span>
                  <span>{currentInvoice.daysPastDue} days overdue</span>
                  <span>•</span>
                  <span className="capitalize">{currentInvoice.riskLevel} risk</span>
                </div>
                
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {currentInvoice.contactName} at {currentInvoice.customer}
                </h1>
                
                <p className="text-gray-600">
                  {currentInvoice.relationship} {currentInvoice.situation}
                </p>
              </div>

              {/* AI Message */}
              <div className="p-6">
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-semibold text-sm">AI</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-800 italic">
                        "{currentInvoice.aiMessage}"
                      </p>
                      <div className="mt-3 flex items-center gap-2">
                        <div className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                          {currentInvoice.recommendationConfidence}% confidence
                        </div>
                        <div className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                          Relationship Score: {currentInvoice.relationshipScore}%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={() => handleAction('send')}
                    className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-3 transform hover:scale-105"
                  >
                    <ArrowRight className="w-5 h-5" />
                    Send This Message
                  </button>
                  
                  <button
                    onClick={() => handleAction('write')}
                    className="w-full bg-white hover:bg-gray-50 text-gray-700 font-semibold py-4 px-6 rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-all duration-200 flex items-center justify-center gap-3"
                  >
                    I'll Write My Own
                  </button>
                  
                  <div className="text-center pt-2">
                    <button
                      onClick={() => handleAction('skip')}
                      className="text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors duration-200"
                    >
                      Skip for now
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Indicator */}
            <div className="mt-6 flex items-center justify-center">
              <div className="flex gap-2">
                {invoices.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                      index === currentIndex ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden min-h-screen">
        {/* Mobile Header with Hamburger */}
        <div className="bg-white shadow-sm p-4 flex items-center justify-between">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
          >
            <Menu className="w-6 h-6 text-gray-600" />
          </button>
          
          <div className="flex items-center gap-3">
            <img 
              src="/logos/mobius-logo-light.png" 
              alt="Mobius Logo" 
              className="w-6 h-6 object-contain"
            />
            <h1 className="text-lg font-bold text-gray-900">Collections</h1>
          </div>
          
          <div className="w-10" /> {/* Spacer for centering */}
        </div>

        {/* Mobile Content */}
        <div className="p-4">
          {/* Main Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Color-coded header bar */}
            <div className={`h-2 ${getRiskColor(currentInvoice.riskLevel)}`} />
            
            {/* Card Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 mb-3">
                <span className="font-semibold">{formatCurrency(currentInvoice.amount)}</span>
                <span>•</span>
                <span>{currentInvoice.daysPastDue} days overdue</span>
                <span>•</span>
                <span className="capitalize">{currentInvoice.riskLevel} risk</span>
              </div>
              
              <h1 className="text-xl font-bold text-gray-900 mb-2">
                {currentInvoice.contactName} at {currentInvoice.customer}
              </h1>
              
              <p className="text-gray-600">
                {currentInvoice.relationship} {currentInvoice.situation}
              </p>
            </div>

            {/* AI Message */}
            <div className="p-4">
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-semibold text-sm">AI</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-800 italic text-sm">
                      "{currentInvoice.aiMessage}"
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <div className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                        {currentInvoice.recommendationConfidence}% confidence
                      </div>
                      <div className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                        Score: {currentInvoice.relationshipScore}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => handleAction('send')}
                  className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-3"
                >
                  <ArrowRight className="w-5 h-5" />
                  Send This Message
                </button>
                
                <button
                  onClick={() => handleAction('write')}
                  className="w-full bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 px-4 rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-all duration-200 flex items-center justify-center gap-3"
                >
                  I'll Write My Own
                </button>
                
                <div className="text-center pt-2">
                  <button
                    onClick={() => handleAction('skip')}
                    className="text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors duration-200"
                  >
                    Skip for now
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="mt-4 flex items-center justify-center">
            <div className="flex gap-2">
              {invoices.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                    index === currentIndex ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex">
            <div className="bg-white w-80 h-full shadow-xl">
              <div className="p-4 flex items-center justify-between border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900">Menu</h2>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>
              
              <div className="h-full overflow-y-auto">
                <SidebarContent />
              </div>
            </div>
            
            <div
              className="flex-1"
              onClick={() => setIsMobileMenuOpen(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
}