import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { DollarSign, Clock, CheckCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface Invoice {
  id: number;
  invoiceNumber: string;
  customer: string;
  contactName: string;
  amount: number;
  daysPastDue: number;
  relationshipScore: number;
  riskLevel: 'low' | 'medium' | 'high';
}

const TopHeader = () => (
  <div className="bg-white border-b border-gray-200">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-16">
        <div className="flex items-center gap-3">
          <img 
            src="/logos/mobius-logo-light.png" 
            alt="Mobius One" 
            className="w-8 h-8 object-contain"
          />
          <span className="text-xl font-bold text-gray-900">Mobius One</span>
        </div>
      </div>
    </div>
  </div>
);

export default function CollectionsPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [processed, setProcessed] = useState<number[]>([]);

  // Fetch overdue invoices
  const { data: overdueInvoicesData, isLoading } = useQuery({
    queryKey: ['/api/collections/overdue-invoices'],
    staleTime: 5 * 60 * 1000,
  });

  const invoices: Invoice[] = overdueInvoicesData || [];
  const currentInvoice = invoices[currentIndex];

  const handleApprove = () => {
    if (currentInvoice) {
      setProcessed([...processed, currentInvoice.id]);
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleSend = () => {
    if (currentInvoice) {
      setProcessed([...processed, currentInvoice.id]);
      setCurrentIndex(prev => prev + 1);
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

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopHeader />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading collections queue...</p>
          </div>
        </div>
      </div>
    );
  }

  if (currentIndex >= invoices.length) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopHeader />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              All Collections Complete!
            </h1>
            <p className="text-gray-600 mb-6">
              Great work! You've processed all overdue invoices.
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentInvoice) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopHeader />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              No Overdue Invoices
            </h1>
            <p className="text-gray-600 mb-6">
              Great news! All your invoices are up to date.
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopHeader />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Collections Queue</h1>
            <div className="text-sm text-gray-600">
              {processed.length} of {invoices.length} processed
            </div>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(processed.length / invoices.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {currentInvoice.customer}
              </h2>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>Invoice #{currentInvoice.invoiceNumber}</span>
                <span className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  {formatCurrency(currentInvoice.amount)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {currentInvoice.daysPastDue} days overdue
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${getRiskColor(currentInvoice.riskLevel)}`} />
              <span className="text-sm font-medium capitalize text-gray-700">
                {currentInvoice.riskLevel} Risk
              </span>
            </div>
          </div>

          <div className="border rounded-lg p-4 mb-6 bg-gray-50">
            <div className="flex items-center gap-2 mb-3">
              <span className="font-medium text-gray-900">Customer Analysis</span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Relationship Score</span>
                <span className="font-medium text-gray-900">
                  {currentInvoice.relationshipScore}/100
                </span>
              </div>
              <div className="pt-2 border-t">
                <p className="text-sm text-gray-700 leading-relaxed">
                  Ready to process collection for {currentInvoice.customer}
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleApprove}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Approve for Batch
            </button>
            
            <button
              onClick={handleSend}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              <ArrowRight className="w-4 h-4" />
              Send Now
            </button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <span className="text-sm text-gray-600">
            {invoices.length - currentIndex} invoices remaining
          </span>
        </div>
      </div>
    </div>
  );
}