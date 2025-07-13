import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Clock, DollarSign, Target, CheckCircle, AlertTriangle, TrendingUp, Edit, Zap, Shield } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface Invoice {
  id: number;
  invoiceNumber: string;
  customer: string;
  amount: number;
  daysPastDue: number;
  relationshipScore: number;
  aiRecommendation: string;
  recommendationConfidence: number;
  approvalStatus: string;
}

interface CollectionMetrics {
  currentDso: number;
  targetDso: number;
  workingCapitalFreed: number;
  totalOverdue: number;
  pendingActions: number;
  approvalRate: number;
  relationshipScore: number;
}

export default function CollectionsPage() {
  const [selectedInvoices, setSelectedInvoices] = useState<number[]>([]);
  const [editingInvoice, setEditingInvoice] = useState<number | null>(null);
  const [editedRecommendation, setEditedRecommendation] = useState<string>('');
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch metrics from API
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['/api/collections/metrics'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch overdue invoices from API
  const { data: invoices, isLoading: invoicesLoading } = useQuery({
    queryKey: ['/api/collections/overdue-invoices'],
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Approve single invoice mutation
  const approveMutation = useMutation({
    mutationFn: async (invoiceId: number) => {
      return await apiRequest('POST', `/api/collections/approve/${invoiceId}`);
    },
    onSuccess: (data, invoiceId) => {
      toast({
        title: 'Collection Action Approved',
        description: `Invoice ${invoiceId} has been approved for collection.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/collections/overdue-invoices'] });
    },
    onError: (error) => {
      toast({
        title: 'Approval Failed',
        description: 'Failed to approve collection action. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Bulk approve mutation
  const bulkApproveMutation = useMutation({
    mutationFn: async (invoiceIds: number[]) => {
      return await apiRequest('POST', '/api/collections/bulk-approve', { invoiceIds });
    },
    onSuccess: (data, invoiceIds) => {
      toast({
        title: 'Bulk Approval Successful',
        description: `${invoiceIds.length} collection actions have been approved.`,
      });
      setSelectedInvoices([]);
      queryClient.invalidateQueries({ queryKey: ['/api/collections/overdue-invoices'] });
    },
    onError: (error) => {
      toast({
        title: 'Bulk Approval Failed',
        description: 'Failed to approve collection actions. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleApproveAction = (invoiceId: number, isHotApproval = false) => {
    if (isHotApproval) {
      toast({
        title: 'Hot Approval Initiated',
        description: 'High-priority collection action approved for immediate execution.',
        variant: 'default',
      });
    }
    approveMutation.mutate(invoiceId);
  };

  const handleEditRecommendation = (invoiceId: number, currentRecommendation: string) => {
    setEditingInvoice(invoiceId);
    setEditedRecommendation(currentRecommendation);
  };

  const handleSaveEdit = () => {
    if (editingInvoice && editedRecommendation.trim()) {
      // Here you would typically make an API call to update the recommendation
      toast({
        title: 'Recommendation Updated',
        description: 'AI recommendation has been modified successfully.',
      });
      setEditingInvoice(null);
      setEditedRecommendation('');
      // In a real implementation, you'd want to update the local state or refetch data
    }
  };

  const handleCancelEdit = () => {
    setEditingInvoice(null);
    setEditedRecommendation('');
  };

  const handleBulkApprove = () => {
    if (selectedInvoices.length === 0) {
      toast({
        title: 'No Items Selected',
        description: 'Please select at least one invoice to approve.',
        variant: 'destructive',
      });
      return;
    }
    bulkApproveMutation.mutate(selectedInvoices);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRelationshipScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-[#061A40] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Collections Acceleration
          </h1>
          <p className="text-sm md:text-base text-gray-600" style={{ fontFamily: 'Inter, sans-serif', lineHeight: '1.6' }}>
            Autonomous revenue optimization with relationship preservation
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5 mb-6 md:mb-8">
          <div className="bg-white rounded-xl p-4 md:p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <Clock size={18} className="text-[#048BA8]" />
              <span className="text-xs md:text-sm text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>
                Current DSO
              </span>
            </div>
            <div className="text-xl md:text-2xl font-bold text-[#061A40]">
              {metricsLoading ? 'Loading...' : `${metrics?.currentDso || 0} days`}
            </div>
            <div className="text-xs text-gray-500">
              Target: {metrics?.targetDso || 0} days
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 md:p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign size={18} className="text-[#048BA8]" />
              <span className="text-xs md:text-sm text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>
                Working Capital Freed
              </span>
            </div>
            <div className="text-xl md:text-2xl font-bold text-[#048BA8]">
              {metricsLoading ? 'Loading...' : `$${(metrics?.workingCapitalFreed || 0).toLocaleString()}`}
            </div>
            <div className="text-xs text-gray-500">
              This quarter
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 md:p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <Target size={18} className="text-[#048BA8]" />
              <span className="text-xs md:text-sm text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>
                Approval Rate
              </span>
            </div>
            <div className="text-xl md:text-2xl font-bold text-[#061A40]">
              {metricsLoading ? 'Loading...' : `${metrics?.approvalRate || 0}%`}
            </div>
            <div className="text-xs text-gray-500">
              AI recommendations
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 md:p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp size={18} className="text-[#048BA8]" />
              <span className="text-xs md:text-sm text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>
                Relationship Score
              </span>
            </div>
            <div className="text-xl md:text-2xl font-bold text-[#061A40]">
              {metricsLoading ? 'Loading...' : `${metrics?.relationshipScore || 0}/100`}
            </div>
            <div className="text-xs text-gray-500">
              Preservation rate
            </div>
          </div>
        </div>

        {/* One-Click Approval Section */}
        <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-200 shadow-sm mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
            <h2 className="text-lg md:text-xl font-semibold text-[#061A40]" style={{ fontFamily: 'Poppins, sans-serif' }}>
              AI Collection Recommendations
            </h2>
            <button
              onClick={handleBulkApprove}
              disabled={selectedInvoices.length === 0}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                selectedInvoices.length > 0
                  ? 'bg-[#048BA8] text-white hover:bg-[#037a94]'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Approve Selected ({selectedInvoices.length})
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {invoicesLoading ? (
              <div className="py-10 text-center text-gray-500">
                Loading invoices...
              </div>
            ) : (
              (invoices || []).map((invoice: any) => (
              <div key={invoice.id} className="border border-gray-200 rounded-lg p-4 transition-all duration-200 hover:shadow-md">
                <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <input
                        type="checkbox"
                        checked={selectedInvoices.includes(invoice.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedInvoices([...selectedInvoices, invoice.id]);
                          } else {
                            setSelectedInvoices(selectedInvoices.filter(id => id !== invoice.id));
                          }
                        }}
                        className="w-4 h-4 text-[#048BA8] border-gray-300 rounded focus:ring-[#048BA8]"
                      />
                      <span className="font-semibold text-[#061A40]" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {invoice.invoiceNumber}
                      </span>
                      <span className="text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {invoice.customer}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-3">
                      <div>
                        <span className="text-xs text-gray-500">Amount: </span>
                        <span className="text-sm font-semibold text-[#061A40]">
                          ${invoice.amount.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">Days Past Due: </span>
                        <span className="text-sm font-semibold text-red-600">
                          {invoice.daysPastDue}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">Relationship Score: </span>
                        <span className={`text-sm font-semibold ${getRelationshipScoreColor(invoice.relationshipScore)}`}>
                          {invoice.relationshipScore}/100
                        </span>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <AlertTriangle size={16} className="text-[#048BA8]" />
                          <span className="text-xs text-gray-500">AI Recommendation:</span>
                          <span className={`text-xs font-semibold ${getConfidenceColor(invoice.recommendationConfidence)}`}>
                            {invoice.recommendationConfidence}% confidence
                          </span>
                        </div>
                        {editingInvoice !== invoice.id && (
                          <button
                            onClick={() => handleEditRecommendation(invoice.id, invoice.aiRecommendation)}
                            className="flex items-center gap-1 text-xs text-[#048BA8] hover:text-[#037a94] transition-colors px-2 py-1 rounded"
                          >
                            <Edit size={12} />
                            Edit
                          </button>
                        )}
                      </div>
                      
                      {editingInvoice === invoice.id ? (
                        <div>
                          <textarea
                            value={editedRecommendation}
                            onChange={(e) => setEditedRecommendation(e.target.value)}
                            style={{
                              width: '100%',
                              minHeight: '80px',
                              padding: '8px',
                              border: '1px solid #E2E8F0',
                              borderRadius: '4px',
                              fontFamily: 'Inter, sans-serif',
                              fontSize: '14px',
                              resize: 'vertical',
                              marginBottom: '8px'
                            }}
                          />
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button
                              onClick={handleCancelEdit}
                              style={{
                                background: '#E2E8F0',
                                color: '#6B7280',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '6px 12px',
                                fontSize: '12px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                              }}
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleSaveEdit}
                              style={{
                                background: '#048BA8',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '6px 12px',
                                fontSize: '12px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                              }}
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p style={{ 
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '14px',
                          color: '#374151',
                          lineHeight: '1.5',
                          margin: 0
                        }}>
                          {invoice.aiRecommendation}
                        </p>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {/* Hot Approval for high-risk or urgent cases */}
                    {(invoice.daysPastDue > 60 || invoice.recommendationConfidence < 70) && (
                      <button
                        onClick={() => handleApproveAction(invoice.id, true)}
                        style={{
                          background: '#FF6B35',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '8px 16px',
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '14px',
                          fontWeight: '500',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <Zap size={16} />
                        Hot Approve
                      </button>
                    )}
                    
                    {/* Regular Approval */}
                    <button
                      onClick={() => handleApproveAction(invoice.id)}
                      style={{
                        background: invoice.recommendationConfidence >= 90 ? '#10B981' : 
                                   invoice.recommendationConfidence >= 70 ? '#F59E0B' : '#EF4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '8px 16px',
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <CheckCircle size={16} />
                      Approve
                    </button>
                  </div>
                </div>
              </div>
            ))
            )}
          </div>
        </div>
      </div>
  );
}