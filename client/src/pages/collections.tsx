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
      return await apiRequest(`/api/collections/approve/${invoiceId}`, {
        method: 'POST',
      });
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
      return await apiRequest('/api/collections/bulk-approve', {
        method: 'POST',
        body: JSON.stringify({ invoiceIds }),
      });
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
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ 
            fontFamily: 'Poppins, sans-serif', 
            fontSize: '28px', 
            fontWeight: '700',
            color: '#061A40',
            marginBottom: '8px'
          }}>
            Collections Acceleration
          </h1>
          <p style={{ 
            fontFamily: 'Inter, sans-serif',
            color: '#6B7280',
            fontSize: '16px',
            lineHeight: '1.6'
          }}>
            Autonomous revenue optimization with relationship preservation
          </p>
        </div>

        {/* Key Metrics */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '32px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <Clock size={20} style={{ color: '#048BA8' }} />
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#6B7280' }}>
                Current DSO
              </span>
            </div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#061A40' }}>
              {metricsLoading ? 'Loading...' : `${metrics?.currentDso || 0} days`}
            </div>
            <div style={{ fontSize: '12px', color: '#6B7280' }}>
              Target: {metrics?.targetDso || 0} days
            </div>
          </div>

          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <DollarSign size={20} style={{ color: '#048BA8' }} />
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#6B7280' }}>
                Working Capital Freed
              </span>
            </div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#048BA8' }}>
              {metricsLoading ? 'Loading...' : `$${(metrics?.workingCapitalFreed || 0).toLocaleString()}`}
            </div>
            <div style={{ fontSize: '12px', color: '#6B7280' }}>
              This quarter
            </div>
          </div>

          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <Target size={20} style={{ color: '#048BA8' }} />
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#6B7280' }}>
                Approval Rate
              </span>
            </div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#061A40' }}>
              {metricsLoading ? 'Loading...' : `${metrics?.approvalRate || 0}%`}
            </div>
            <div style={{ fontSize: '12px', color: '#6B7280' }}>
              AI recommendations
            </div>
          </div>

          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <TrendingUp size={20} style={{ color: '#048BA8' }} />
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#6B7280' }}>
                Relationship Score
              </span>
            </div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#061A40' }}>
              {metricsLoading ? 'Loading...' : `${metrics?.relationshipScore || 0}/100`}
            </div>
            <div style={{ fontSize: '12px', color: '#6B7280' }}>
              Preservation rate
            </div>
          </div>
        </div>

        {/* One-Click Approval Section */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          marginBottom: '32px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ 
              fontFamily: 'Poppins, sans-serif', 
              fontSize: '20px', 
              fontWeight: '600',
              color: '#061A40'
            }}>
              AI Collection Recommendations
            </h2>
            <button
              onClick={handleBulkApprove}
              disabled={selectedInvoices.length === 0}
              style={{
                background: selectedInvoices.length > 0 ? '#048BA8' : '#E2E8F0',
                color: selectedInvoices.length > 0 ? 'white' : '#9CA3AF',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 16px',
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                fontWeight: '500',
                cursor: selectedInvoices.length > 0 ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s ease'
              }}
            >
              Approve Selected ({selectedInvoices.length})
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {invoicesLoading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#6B7280' }}>
                Loading invoices...
              </div>
            ) : (
              (invoices || []).map((invoice: any) => (
              <div key={invoice.id} style={{
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                padding: '16px',
                transition: 'all 0.2s ease'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
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
                        style={{ width: '16px', height: '16px' }}
                      />
                      <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: '600', color: '#061A40' }}>
                        {invoice.invoiceNumber}
                      </span>
                      <span style={{ fontFamily: 'Inter, sans-serif', color: '#6B7280' }}>
                        {invoice.customer}
                      </span>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '24px', marginBottom: '12px' }}>
                      <div>
                        <span style={{ fontSize: '12px', color: '#6B7280' }}>Amount: </span>
                        <span style={{ fontSize: '14px', fontWeight: '600', color: '#061A40' }}>
                          ${invoice.amount.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span style={{ fontSize: '12px', color: '#6B7280' }}>Days Past Due: </span>
                        <span style={{ fontSize: '14px', fontWeight: '600', color: '#DC2626' }}>
                          {invoice.daysPastDue}
                        </span>
                      </div>
                      <div>
                        <span style={{ fontSize: '12px', color: '#6B7280' }}>Relationship Score: </span>
                        <span style={{ fontSize: '14px', fontWeight: '600' }} className={getRelationshipScoreColor(invoice.relationshipScore)}>
                          {invoice.relationshipScore}/100
                        </span>
                      </div>
                    </div>

                    <div style={{ 
                      background: '#F8FAFC',
                      borderRadius: '6px',
                      padding: '12px',
                      marginBottom: '12px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <AlertTriangle size={16} style={{ color: '#048BA8' }} />
                          <span style={{ fontSize: '12px', color: '#6B7280' }}>AI Recommendation:</span>
                          <span style={{ fontSize: '12px', fontWeight: '600' }} className={getConfidenceColor(invoice.recommendationConfidence)}>
                            {invoice.recommendationConfidence}% confidence
                          </span>
                        </div>
                        {editingInvoice !== invoice.id && (
                          <button
                            onClick={() => handleEditRecommendation(invoice.id, invoice.aiRecommendation)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#048BA8',
                              cursor: 'pointer',
                              padding: '4px',
                              borderRadius: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '12px',
                              transition: 'all 0.2s ease'
                            }}
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