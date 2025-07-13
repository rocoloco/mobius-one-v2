import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Clock, DollarSign, Target, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react';

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

  // Mock data for demonstration - will be replaced with real API calls
  const mockMetrics: CollectionMetrics = {
    currentDso: 54,
    targetDso: 38,
    workingCapitalFreed: 127000,
    totalOverdue: 342000,
    pendingActions: 12,
    approvalRate: 94,
    relationshipScore: 87
  };

  const mockInvoices: Invoice[] = [
    {
      id: 1,
      invoiceNumber: 'INV-2024-001',
      customer: 'Acme Corp',
      amount: 15000,
      daysPastDue: 45,
      relationshipScore: 82,
      aiRecommendation: 'Send gentle reminder with payment plan options',
      recommendationConfidence: 94,
      approvalStatus: 'pending'
    },
    {
      id: 2,
      invoiceNumber: 'INV-2024-002', 
      customer: 'TechFlow Solutions',
      amount: 8500,
      daysPastDue: 32,
      relationshipScore: 91,
      aiRecommendation: 'Schedule follow-up call with account manager',
      recommendationConfidence: 87,
      approvalStatus: 'pending'
    },
    {
      id: 3,
      invoiceNumber: 'INV-2024-003',
      customer: 'StartupXYZ',
      amount: 22000,
      daysPastDue: 62,
      relationshipScore: 65,
      aiRecommendation: 'Escalate to finance team with payment deadline',
      recommendationConfidence: 78,
      approvalStatus: 'pending'
    }
  ];

  const handleApproveAction = (invoiceId: number) => {
    // Handle approval logic
    console.log('Approving action for invoice:', invoiceId);
  };

  const handleBulkApprove = () => {
    // Handle bulk approval
    console.log('Bulk approving invoices:', selectedInvoices);
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
    <Layout>
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
              {mockMetrics.currentDso} days
            </div>
            <div style={{ fontSize: '12px', color: '#6B7280' }}>
              Target: {mockMetrics.targetDso} days
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
              ${mockMetrics.workingCapitalFreed.toLocaleString()}
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
              {mockMetrics.approvalRate}%
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
              {mockMetrics.relationshipScore}/100
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
            {mockInvoices.map((invoice) => (
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <AlertTriangle size={16} style={{ color: '#048BA8' }} />
                        <span style={{ fontSize: '12px', color: '#6B7280' }}>AI Recommendation:</span>
                        <span style={{ fontSize: '12px', fontWeight: '600' }} className={getConfidenceColor(invoice.recommendationConfidence)}>
                          {invoice.recommendationConfidence}% confidence
                        </span>
                      </div>
                      <p style={{ 
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '14px',
                        color: '#374151',
                        lineHeight: '1.5',
                        margin: 0
                      }}>
                        {invoice.aiRecommendation}
                      </p>
                    </div>
                  </div>

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
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}