import { useReducer, useEffect, useMemo, useCallback, useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  DollarSign, Clock, Shield, ArrowRight, CheckCircle, 
  User, ChevronDown, Settings, CreditCard, LogOut,
  Zap, TrendingUp
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '../hooks/useAuth';
import '../styles/collections-animations.css';

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
  analysisComplete?: boolean;
  customerId?: number;
  contactEmail?: string;
  aiModel?: string;
  estimatedCost?: number;
  estimatedReviewTime?: number;
  score?: number;
  draftEmail?: {
    subject: string;
    body: string;
  };
}

interface CollectionMetrics {
  revenueAccelerated: number;
  timeSaved: number;
  relationshipsProtected: number;
  aiLearningProgress: number;
  remainingQueue: number;
  totalQueue: number;
}

interface CollectionsState {
  queue: Invoice[];
  currentIndex: number;
  processed: Invoice[];
  approvedForBatch: Invoice[];
  needsReview: Invoice[];
  metrics: CollectionMetrics;
  ui: {
    isAnimating: boolean;
    showSuccessAnimation: boolean;
    showInlineEditor: boolean;
    isComplete: boolean;
    isQueueComplete: boolean;
    redirectCountdown: number;
  };
  persistence: {
    processedInvoices: number[];
    totalQueueSize: number;
  };
}

type CollectionsAction = 
  | { type: 'INITIALIZE_QUEUE'; payload: { invoices: Invoice[] } }
  | { type: 'UPDATE_INVOICE_ANALYSIS'; payload: { invoiceId: number; analysis: any } }
  | { type: 'APPROVE_INVOICE'; payload: { invoice: Invoice } }
  | { type: 'SEND_INVOICE'; payload: { invoice: Invoice } }
  | { type: 'REVIEW_LATER'; payload: { invoice: Invoice } }
  | { type: 'BATCH_SEND'; payload: {} }
  | { type: 'MOVE_TO_NEXT'; payload: {} }
  | { type: 'SET_UI_STATE'; payload: Partial<CollectionsState['ui']> }
  | { type: 'UPDATE_METRICS'; payload: Partial<CollectionMetrics> };

const initialState: CollectionsState = {
  queue: [],
  currentIndex: 0,
  processed: [],
  approvedForBatch: [],
  needsReview: [],
  metrics: {
    revenueAccelerated: 0,
    timeSaved: 0,
    relationshipsProtected: 95,
    aiLearningProgress: 73,
    remainingQueue: 0,
    totalQueue: 0
  },
  ui: {
    isAnimating: false,
    showSuccessAnimation: false,
    showInlineEditor: false,
    isComplete: false,
    isQueueComplete: false,
    redirectCountdown: 5
  },
  persistence: {
    processedInvoices: [],
    totalQueueSize: 0
  }
};

// Session tracking
const getSessionStartTime = () => {
  const stored = localStorage.getItem('sessionStartTime');
  return stored ? new Date(stored) : new Date();
};

const setSessionStartTime = () => {
  localStorage.setItem('sessionStartTime', new Date().toISOString());
};

// Completion Experience Component
const CompletionExperience: React.FC<{
  totalProcessed: number;
  totalValue: number;
  workingCapitalFreed: number;
  daysAccelerated: number;
  sessionDuration: number;
  onComplete: () => void;
}> = ({ totalProcessed, totalValue, workingCapitalFreed, daysAccelerated, sessionDuration, onComplete }) => {
  const [stage, setStage] = useState<'celebration' | 'impact' | 'next'>('celebration');
  const [confettiPieces, setConfettiPieces] = useState<JSX.Element[]>([]);

  useEffect(() => {
    // Generate confetti
    const colors = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444'];
    const pieces = Array.from({ length: 50 }, (_, i) => (
      <div
        key={i}
        className="absolute w-3 h-3 rounded-sm animate-fall"
        style={{
          left: `${Math.random() * 100}%`,
          top: '-20px',
          backgroundColor: colors[Math.floor(Math.random() * colors.length)],
          transform: `rotate(${Math.random() * 360}deg)`,
          animationDelay: `${Math.random() * 3}s`,
          animationDuration: `${3 + Math.random() * 2}s`
        }}
      />
    ));
    setConfettiPieces(pieces);

    // Progress through stages
    const timer1 = setTimeout(() => setStage('impact'), 3000);
    const timer2 = setTimeout(() => setStage('next'), 6000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-green-50 via-emerald-50 to-blue-50 flex items-center justify-center p-4">
      {/* Confetti Container */}
      {stage === 'celebration' && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {confettiPieces}
        </div>
      )}

      <div className="max-w-2xl w-full">
        {/* Stage 1: Celebration */}
        {stage === 'celebration' && (
          <div className="text-center animate-fade-in-simple">
            <div className="relative mb-8 inline-block">
              <div className="absolute inset-0 bg-green-400 rounded-full blur-3xl opacity-30 animate-pulse" />
              <div className="relative bg-white rounded-full p-8 shadow-2xl animate-bounce">
                <CheckCircle className="w-24 h-24 text-green-500" strokeWidth={2} />
              </div>
            </div>
            
            <h1 className="text-6xl font-bold mb-4 animate-scale-up">
              <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                {formatCurrency(workingCapitalFreed)}
              </span>
            </h1>
            <p className="text-2xl text-gray-700 animate-slide-up-immediate">
              freed up for your business
            </p>
          </div>
        )}

        {/* Stage 2: Business Impact */}
        {stage === 'impact' && (
          <div className="animate-fade-in-simple">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
              You just gave your business superpowers
            </h2>
            
            <div className="grid grid-cols-3 gap-6 mb-12">
              <div className="text-center bg-white rounded-2xl p-6 shadow-lg animate-slide-up-immediate delay-100">
                <Zap className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <div className="text-4xl font-bold text-green-600 mb-2">{daysAccelerated}</div>
                <div className="text-sm text-gray-600">Days faster cash</div>
              </div>
              
              <div className="text-center bg-white rounded-2xl p-6 shadow-lg animate-slide-up-immediate delay-200">
                <TrendingUp className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {formatCurrency(workingCapitalFreed)}
                </div>
                <div className="text-sm text-gray-600">Working capital</div>
              </div>
              
              <div className="text-center bg-white rounded-2xl p-6 shadow-lg animate-slide-up-immediate delay-300">
                <Shield className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <div className="text-4xl font-bold text-purple-600 mb-2">100%</div>
                <div className="text-sm text-gray-600">Relationships safe</div>
              </div>
            </div>

            <div className="bg-white/50 backdrop-blur rounded-xl p-4 text-center animate-fade-in-simple">
              <p className="text-gray-600">
                {totalProcessed} invoices • {sessionDuration} minutes • 
                <span className="font-semibold"> Zero stress</span>
              </p>
            </div>
          </div>
        )}

        {/* Stage 3: Next Actions */}
        {stage === 'next' && (
          <div className="text-center animate-fade-in-simple">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl p-6 mb-8 shadow-xl animate-slide-up-immediate">
              <div className="flex items-center justify-center gap-3 mb-2">
                <Clock className="w-5 h-5" />
                <span className="text-lg font-semibold">Batch Run Tonight</span>
              </div>
              <p className="text-blue-100">
                Your approved messages will be sent at 6:00 PM PST
              </p>
            </div>

            <button
              onClick={onComplete}
              className="group bg-gradient-to-r from-gray-900 to-gray-800 text-white text-xl font-semibold px-12 py-6 rounded-xl shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-200 mb-6"
            >
              Back to work
              <ArrowRight className="inline-block ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>

            <p className="text-gray-600 animate-fade-in-simple delay-300">
              <span className="font-semibold text-gray-900">8 new invoices</span> waiting for tomorrow
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

function collectionsReducer(state: CollectionsState, action: CollectionsAction): CollectionsState {
  switch (action.type) {
    case 'INITIALIZE_QUEUE':
      return {
        ...state,
        queue: action.payload.invoices,
        persistence: {
          ...state.persistence,
          totalQueueSize: action.payload.invoices.length
        },
        metrics: {
          ...state.metrics,
          remainingQueue: action.payload.invoices.length,
          totalQueue: action.payload.invoices.length
        },
        ui: {
          ...state.ui,
          isQueueComplete: action.payload.invoices.length === 0
        }
      };

    case 'UPDATE_INVOICE_ANALYSIS':
      return {
        ...state,
        queue: state.queue.map(inv => 
          inv.id === action.payload.invoiceId 
            ? { ...inv, ...action.payload.analysis, analysisComplete: true }
            : inv
        )
      };

    case 'APPROVE_INVOICE':
      const newApprovedBatch = [...state.approvedForBatch, action.payload.invoice];
      const totalProcessedAfterApproval = state.processed.length + newApprovedBatch.length + state.needsReview.length;
      
      return {
        ...state,
        approvedForBatch: newApprovedBatch,
        metrics: {
          ...state.metrics,
          revenueAccelerated: state.metrics.revenueAccelerated + action.payload.invoice.amount,
          timeSaved: state.metrics.timeSaved + 0.5,
          relationshipsProtected: Math.min(100, state.metrics.relationshipsProtected + 1),
          aiLearningProgress: Math.min(state.metrics.aiLearningProgress + 1, 100),
          remainingQueue: Math.max(0, state.metrics.totalQueue - totalProcessedAfterApproval)
        },
        ui: { ...state.ui, showSuccessAnimation: true }
      };

    case 'SEND_INVOICE':
      const newProcessed = [...state.processed, action.payload.invoice];
      const totalProcessedAfterSend = newProcessed.length + state.approvedForBatch.length + state.needsReview.length;
      
      return {
        ...state,
        processed: newProcessed,
        metrics: {
          ...state.metrics,
          revenueAccelerated: state.metrics.revenueAccelerated + action.payload.invoice.amount,
          timeSaved: state.metrics.timeSaved + 0.5,
          remainingQueue: Math.max(0, state.metrics.totalQueue - totalProcessedAfterSend)
        },
        ui: { ...state.ui, showSuccessAnimation: true }
      };

    case 'REVIEW_LATER':
      const newNeedsReview = [...state.needsReview, action.payload.invoice];
      const totalProcessedAfterReview = state.processed.length + state.approvedForBatch.length + newNeedsReview.length;
      
      return {
        ...state,
        needsReview: newNeedsReview,
        metrics: {
          ...state.metrics,
          remainingQueue: Math.max(0, state.metrics.totalQueue - totalProcessedAfterReview)
        }
      };

    case 'BATCH_SEND':
      return {
        ...state,
        processed: [...state.processed, ...state.approvedForBatch],
        approvedForBatch: []
      };

    case 'MOVE_TO_NEXT':
      const nextIndex = state.currentIndex + 1;
      return {
        ...state,
        currentIndex: nextIndex,
        ui: {
          ...state.ui,
          isQueueComplete: nextIndex >= state.queue.length,
          showSuccessAnimation: false
        }
      };

    case 'SET_UI_STATE':
      return {
        ...state,
        ui: { ...state.ui, ...action.payload }
      };

    case 'UPDATE_METRICS':
      return {
        ...state,
        metrics: { ...state.metrics, ...action.payload }
      };

    default:
      return state;
  }
}

// Simplified TopHeader component (inline)
const TopHeaderSimplified = () => (
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
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Main state using useReducer
  const [state, dispatch] = useReducer(collectionsReducer, initialState);

  // Local UI state that doesn't need to be in reducer
  const [editorContent, setEditorContent] = useState('');
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch overdue invoices
  const { data: overdueInvoicesData, isLoading } = useQuery({
    queryKey: ['/api/collections/overdue-invoices'],
    staleTime: 5 * 60 * 1000,
  });

  // Analysis mutation
  const analyzeMutation = useMutation({
    mutationFn: async (invoiceData: any) => {
      const response = await apiRequest('POST', `/api/collections/analyze`, {
        customer: invoiceData.customer,
        invoice: invoiceData.invoice
      });
      return await response.json();
    },
    onSuccess: (data, variables) => {
      console.log('Real AI Analysis complete:', data);

      dispatch({
        type: 'UPDATE_INVOICE_ANALYSIS',
        payload: {
          invoiceId: variables.invoice.id,
          analysis: {
            relationshipScore: data.analysis?.scoring?.score || 65,
            riskLevel: data.analysis?.scoring?.riskLevel || 'medium',
            aiMessage: data.analysis?.recommendation?.reasoning || 'Analysis complete',
            aiRecommendation: data.analysis?.recommendation?.reasoning || 'Analysis complete',
            recommendationConfidence: data.analysis?.recommendation?.confidence || 75,
            aiModel: data.analysis?.routing?.aiModel || 'gpt-4o-mini',
            estimatedCost: data.analysis?.routing?.estimatedCost || 0.001,
            estimatedReviewTime: data.analysis?.routing?.estimatedReviewTime || 0.5,
            draftEmail: data.analysis?.draftEmail || null,
            score: data.analysis?.scoring?.score || 65
          }
        }
      });
    },
    onError: (error) => {
      toast({
        title: "Analysis Failed",
        description: `Failed to analyze invoice: ${error.message || 'Unknown error'}`,
        variant: "destructive"
      });
    }
  });

  // Bulk approval mutation
  const bulkApproveMutation = useMutation({
    mutationFn: async (invoiceIds: number[]) => {
      const response = await apiRequest('POST', `/api/collections/bulk-approve`, { invoiceIds });
      return await response.json();
    }
  });

  // Memoized computed values
  const currentInvoice = useMemo(() => state.queue[state.currentIndex], [state.queue, state.currentIndex]);

  const uniqueHandledIds = useMemo(() => new Set([
    ...state.processed.map(inv => inv.id),
    ...state.approvedForBatch.map(inv => inv.id),
    ...state.needsReview.map(inv => inv.id)
  ]), [state.processed, state.approvedForBatch, state.needsReview]);

  const completionRate = useMemo(() => 
    state.queue.length > 0 ? (uniqueHandledIds.size / state.queue.length) * 100 : 0,
    [uniqueHandledIds.size, state.queue.length]
  );

  const isComplete = useMemo(() => 
    state.queue.length > 0 && uniqueHandledIds.size === state.queue.length,
    [state.queue.length, uniqueHandledIds.size]
  );

  // Initialize queue when data loads
  useEffect(() => {
    if (overdueInvoicesData && Array.isArray(overdueInvoicesData)) {
      // Set session start time on first load
      if (!localStorage.getItem('sessionStartTime')) {
        setSessionStartTime();
      }

      const transformedInvoices = overdueInvoicesData.map((invoice: any) => ({
        ...invoice,
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber || 'Unknown',
        customer: invoice.customer || 'Unknown Customer',
        contactName: invoice.contactName || 'Unknown Contact',
        amount: invoice.totalAmount || invoice.amount || 0,
        daysPastDue: invoice.daysPastDue || 0,
        relationshipScore: invoice.relationshipScore || 65,
        aiRecommendation: invoice.aiRecommendation || 'Analyzing...',
        recommendationConfidence: invoice.recommendationConfidence || 75,
        approvalStatus: invoice.approvalStatus || 'pending',
        riskLevel: invoice.riskLevel || 'medium',
        relationship: invoice.relationship || 'analyzing relationship',
        situation: invoice.situation || 'status pending',
        aiMessage: `Ready to analyze ${invoice.customer} with ${invoice.riskLevel} risk routing`,
        analysisComplete: false
      }));

      dispatch({ type: 'INITIALIZE_QUEUE', payload: { invoices: transformedInvoices } });
    }
  }, [overdueInvoicesData]);

  // Auto-analyze current invoice
  useEffect(() => {
    if (currentInvoice && !currentInvoice.analysisComplete) {
      analyzeMutation.mutate({
        customer: {
          id: currentInvoice.customerId,
          name: currentInvoice.customer,
          email: currentInvoice.contactEmail || 'unknown@example.com',
          relationshipScore: currentInvoice.relationshipScore,
          totalOverdueAmount: currentInvoice.amount,
          averagePaymentDays: currentInvoice.daysPastDue,
          createdAt: new Date()
        },
        invoice: {
          id: currentInvoice.id,
          invoiceNumber: currentInvoice.invoiceNumber,
          customerId: currentInvoice.customerId,
          totalAmount: currentInvoice.amount,
          dueDate: new Date(Date.now() - (currentInvoice.daysPastDue * 24 * 60 * 60 * 1000)),
          daysPastDue: currentInvoice.daysPastDue,
          approvalStatus: currentInvoice.approvalStatus
        }
      });
    }
  }, [state.currentIndex, state.queue]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-redirect countdown for completed sessions
  useEffect(() => {
    if (state.ui.isQueueComplete && isComplete) {
      // Save all processed invoice IDs to persistent storage
      const allProcessedIds = [
        ...state.processed.map(inv => inv.id),
        ...state.approvedForBatch.map(inv => inv.id),
        ...state.needsReview.map(inv => inv.id)
      ];

      localStorage.setItem('processedInvoices', JSON.stringify(allProcessedIds));

      // Start countdown - use local state instead of reducer for timer
      let countdown = 5;
      dispatch({ type: 'SET_UI_STATE', payload: { redirectCountdown: countdown } });

      const timer = setInterval(() => {
        countdown -= 1;

        if (countdown <= 0) {
          clearInterval(timer);
          localStorage.removeItem('collectionsProgress');
          // Force navigation using window.location for reliability
          window.location.href = '/';
          return;
        }

        // Update the display countdown
        dispatch({ type: 'SET_UI_STATE', payload: { redirectCountdown: countdown } });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [state.ui.isQueueComplete, isComplete]);

  // Event handlers with useCallback for performance
  const handleApprove = useCallback(() => {
    if (!currentInvoice) return;
    dispatch({ type: 'APPROVE_INVOICE', payload: { invoice: currentInvoice } });
    setTimeout(() => {
      dispatch({ type: 'SET_UI_STATE', payload: { showSuccessAnimation: false } });
      dispatch({ type: 'MOVE_TO_NEXT', payload: {} });
    }, 1000);
    toast({
      title: 'Message approved for batch sending!',
      description: `${currentInvoice.customer} - $${currentInvoice.amount.toLocaleString()}`,
    });
  }, [currentInvoice, toast]);

  const handleSend = useCallback(() => {
    if (!currentInvoice) return;
    dispatch({ type: 'SEND_INVOICE', payload: { invoice: currentInvoice } });
    setTimeout(() => {
      dispatch({ type: 'SET_UI_STATE', payload: { showSuccessAnimation: false } });
      dispatch({ type: 'MOVE_TO_NEXT', payload: {} });
    }, 1000);
    toast({
      title: 'Message sent immediately!',
      description: `${currentInvoice.customer} - $${currentInvoice.amount.toLocaleString()}`,
    });
  }, [currentInvoice, toast]);

  const handleWrite = useCallback(() => {
    if (!currentInvoice) return;
    const draftTemplate = `Hi ${currentInvoice.contactName},

I hope this message finds you well. I wanted to reach out regarding invoice ${currentInvoice.invoiceNumber} for $${currentInvoice.amount.toLocaleString()} which is currently ${currentInvoice.daysPastDue} days past due.

[Add your personalized message here]

Please let me know if you have any questions or if there's anything I can help with to resolve this.

Best regards,
[Your Name]`;

    setEditorContent(draftTemplate);
    dispatch({ type: 'SET_UI_STATE', payload: { showInlineEditor: true } });
  }, [currentInvoice]);

  const handleWriteSubmit = useCallback(() => {
    if (!currentInvoice) return;
    dispatch({ type: 'APPROVE_INVOICE', payload: { invoice: currentInvoice } });
    dispatch({ type: 'SET_UI_STATE', payload: { showInlineEditor: false } });
    setEditorContent('');
    setTimeout(() => {
      dispatch({ type: 'SET_UI_STATE', payload: { showSuccessAnimation: false } });
      dispatch({ type: 'MOVE_TO_NEXT', payload: {} });
    }, 1000);
    toast({
      title: 'Custom message approved for batch!',
      description: `${currentInvoice.customer} - $${currentInvoice.amount.toLocaleString()}`,
    });
  }, [currentInvoice, toast]);

  const handleBatchSend = useCallback(() => {
    dispatch({ type: 'BATCH_SEND', payload: {} });
    toast({
      title: `Batch sent successfully!`,
      description: `${state.approvedForBatch.length} messages sent to customers`,
    });
  }, [state.approvedForBatch.length, toast]);

  // Utility functions
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

  const getRelationshipDescription = (score: number, riskLevel: string) => {
    if (score >= 70) return "valued client likely oversight";
    if (score >= 40) return "established client payment delay";
    return "problematic client requires immediate attention";
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopHeaderSimplified />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading collections queue...</h2>
            <p className="text-gray-600">Fetching overdue invoices for analysis</p>
          </div>
        </div>
      </div>
    );
  }

  // Completion state
  if (!currentInvoice || state.ui.isQueueComplete) {
    if (isComplete) {
      // Calculate real business impact
      const totalApprovedValue = [...state.processed, ...state.approvedForBatch].reduce((sum, inv) => sum + inv.amount, 0);
      const workingCapitalFreed = Math.round(totalApprovedValue * 0.4); // ~40% becomes working capital
      const daysAccelerated = 15; // Average DSO reduction
      
      // Calculate session duration
      const sessionStart = getSessionStartTime();
      const sessionDuration = Math.round((Date.now() - sessionStart.getTime()) / (1000 * 60)); // minutes
      
      return (
        <CompletionExperience
          totalProcessed={state.processed.length + state.approvedForBatch.length}
          totalValue={totalApprovedValue}
          workingCapitalFreed={workingCapitalFreed}
          daysAccelerated={daysAccelerated}
          sessionDuration={sessionDuration}
          onComplete={() => {
            // Clear session data
            localStorage.removeItem('collectionsProgress');
            localStorage.removeItem('sessionStartTime');
            // Navigate to dashboard
            navigate('/dashboard');
          }}
        />
      );
    } else {
      // Partial session - offer to continue
      const totalValue = [...state.processed, ...state.approvedForBatch].reduce((sum, invoice) => sum + invoice.amount, 0);
      const totalHandled = state.processed.length + state.approvedForBatch.length;

      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-8">
            <div className="w-20 h-20 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Great Progress! 👏</h2>
            <p className="text-lg text-gray-700 mb-2">You've processed {totalHandled} of {state.queue.length} invoices.</p>
            <p className="text-gray-600 mb-8">You can continue where you left off anytime.</p>

            <div className="bg-white rounded-lg p-6 shadow-lg mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress So Far</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{state.processed.length}</div>
                  <div className="text-gray-600">Sent</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{state.approvedForBatch.length}</div>
                  <div className="text-gray-600">Approved</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{state.needsReview.length}</div>
                  <div className="text-gray-600">Needs Review</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(totalValue)}
                  </div>
                  <div className="text-gray-600">Total Value</div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => {
                  // Clear processed invoices to reload fresh data
                  localStorage.removeItem('processedInvoices');
                  localStorage.removeItem('collectionsProgress');
                  localStorage.removeItem('sessionStartTime');
                  // Reload the page to check for new invoices
                  window.location.reload();
                }}
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200"
              >
                Continue Session
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-all duration-200"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopHeaderSimplified />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full">
              <div className="h-full flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center gap-3 mb-4">
                    <img 
                      src="/logos/mobius-logo-light.png" 
                      alt="Mobius Logo" 
                      className="w-8 h-8 object-contain"
                    />
                    <h1 className="text-xl font-bold text-gray-900">Collections</h1>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Queue Progress</span>
                      <span className="font-semibold text-gray-900">
                        {uniqueHandledIds.size} of {state.queue.length}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-cyan-600 to-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${state.queue.length > 0 ? (uniqueHandledIds.size / state.queue.length) * 100 : 0}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Sent: {state.processed.length}</span>
                      <span>Approved: {state.approvedForBatch.length}</span>
                      {state.needsReview.length > 0 && (
                        <span className="text-yellow-600 font-medium">Review: {state.needsReview.length}</span>
                      )}
                    </div>
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
                        <p className={`text-lg font-semibold text-gray-900 transition-transform duration-500 ${state.ui.isAnimating ? 'scale-110' : ''}`}>
                          {formatCurrency(state.metrics.revenueAccelerated)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Clock className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Time Saved</p>
                        <p className={`text-lg font-semibold text-gray-900 transition-transform duration-500 ${state.ui.isAnimating ? 'scale-110' : ''}`}>
                          {state.metrics.timeSaved} hours
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
                          {state.metrics.relationshipsProtected}%
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
                      <span className="text-sm font-semibold text-gray-900">{state.metrics.aiLearningProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-cyan-600 to-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${state.metrics.aiLearningProgress}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Learning from your approval patterns
                    </p>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="flex-1 flex flex-col justify-end p-6 space-y-4">
                  {/* Batch Send Button */}
                  {state.approvedForBatch.length >= 3 && (
                    <button 
                      onClick={handleBatchSend}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Send All Reviewed ({state.approvedForBatch.length})
                    </button>
                  )}

                  {/* Needs Review Button */}
                  {state.needsReview.length > 0 && (
                    <button className="w-full bg-yellow-100 hover:bg-yellow-200 text-yellow-800 font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2">
                      <Clock className="w-5 h-5" />
                      Needs Review ({state.needsReview.length})
                    </button>
                  )}

                  <div className="w-full bg-gray-50 text-gray-600 py-3 px-4 rounded-lg flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {state.metrics.remainingQueue} of {state.metrics.totalQueue} invoices remaining
                    </span>
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${((state.metrics.totalQueue - state.metrics.remainingQueue) / state.metrics.totalQueue) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Profile Dropdown */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                    >
                      <div className="w-8 h-8 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium text-gray-900">Test User</p>
                        <p className="text-xs text-gray-500">test@example.com</p>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown Menu */}
                    {isProfileDropdownOpen && (
                      <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                        <button
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-200 flex items-center gap-3"
                        >
                          <Settings className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-700">Account Settings</span>
                        </button>

                        <button
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-200 flex items-center gap-3"
                        >
                          <CreditCard className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-700">Billing</span>
                        </button>

                        <div className="border-t border-gray-200">
                          <button
                            onClick={async () => {
                              await logout();
                              setIsProfileDropdownOpen(false);
                            }}
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-200 flex items-center gap-3"
                          >
                            <LogOut className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-700">Sign Out</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="w-full max-w-3xl mx-auto">
              {/* Invoice Card */}
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

                  {currentInvoice.analysisComplete && (
                    <p className="text-gray-600">
                      {getRelationshipDescription(currentInvoice.score || currentInvoice.relationshipScore, currentInvoice.riskLevel)}
                    </p>
                  )}
                </div>

                {/* AI Message */}
                <div className="p-6">
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 mb-6">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-semibold text-sm">AI</span>
                      </div>
                      <div className="flex-1">
                        {currentInvoice.analysisComplete ? (
                          <div>
                            <p className="text-gray-800 italic mb-4">
                              "{currentInvoice.aiMessage}"
                            </p>

                            {/* Draft Email Preview */}
                            {currentInvoice.draftEmail && (
                              <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
                                <div className="flex items-center gap-2 mb-3">
                                  <span className="text-sm font-medium text-gray-600">📧 Draft Email:</span>
                                </div>
                                <div className="space-y-3">
                                  <div>
                                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Subject:</span>
                                    <p className="text-sm font-medium text-gray-900 mt-1">{currentInvoice.draftEmail.subject}</p>
                                  </div>
                                  <div>
                                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Message:</span>
                                    <div className="text-sm text-gray-700 mt-1 whitespace-pre-line bg-gray-50 p-3 rounded border max-h-48 overflow-y-auto">
                                      {currentInvoice.draftEmail.body}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            <div className="flex flex-wrap items-center gap-2 mb-3">
                              <div className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                {currentInvoice.recommendationConfidence}% confidence
                              </div>
                              <div className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                                Score: {currentInvoice.score || currentInvoice.relationshipScore}
                              </div>
                              {currentInvoice.aiModel && (
                                <div className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                                  {currentInvoice.aiModel === 'gpt-4o-mini' ? 'GPT-4o Mini' : 
                                   currentInvoice.aiModel === 'claude-3.5-sonnet' ? 'Claude 3.5 Sonnet' :
                                   currentInvoice.aiModel === 'claude-opus-4' ? 'Claude Opus-4' : 
                                   currentInvoice.aiModel}
                                </div>
                              )}
                              <div className={`px-3 py-1 text-xs font-medium rounded-full ${
                                currentInvoice.riskLevel === 'low' ? 'bg-green-100 text-green-800' :
                                currentInvoice.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {currentInvoice.riskLevel.toUpperCase()} Risk
                              </div>
                            </div>
                            {currentInvoice.estimatedCost && (
                              <div className="text-xs text-gray-600">
                                Analysis cost: ${currentInvoice.estimatedCost.toFixed(3)} • 
                                Review time: {currentInvoice.estimatedReviewTime || 0.5} min
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            <span className="text-gray-600">Analyzing with AI routing system...</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {!state.ui.showInlineEditor ? (
                    <div className="space-y-3">
                      <button
                        onClick={handleApprove}
                        className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-3 transform hover:scale-105"
                      >
                        {state.ui.showSuccessAnimation ? (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : (
                          <ArrowRight className="w-5 h-5" />
                        )}
                        Approve for Batch
                      </button>

                      <button
                        onClick={handleSend}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-3"
                      >
                        Send Immediately
                      </button>

                      <button
                        onClick={handleWrite}
                        className="w-full bg-white hover:bg-gray-50 text-gray-700 font-semibold py-4 px-6 rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-all duration-200 flex items-center justify-center gap-3"
                      >
                        I'll Write My Own
                      </button>

                      <div className="text-center pt-2 space-y-2">
                        <button
                          onClick={() => {
                            if (!currentInvoice) return;
                            dispatch({ type: 'REVIEW_LATER', payload: { invoice: currentInvoice } });
                            setTimeout(() => {
                              dispatch({ type: 'MOVE_TO_NEXT', payload: {} });
                            }, 300);
                            toast({
                              title: 'Moved to review later',
                              description: `${currentInvoice.customer} - $${currentInvoice.amount.toLocaleString()}`,
                            });
                          }}
                          className="text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors duration-200 block"
                        >
                          Review Later
                        </button>
                        <button
                          onClick={() => dispatch({ type: 'SET_UI_STATE', payload: { isQueueComplete: true } })}
                          className="text-gray-400 hover:text-gray-600 text-xs font-medium transition-colors duration-200 block"
                        >
                          I'm done for now
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Edit your message:
                        </label>
                        <textarea
                          value={editorContent}
                          onChange={(e) => setEditorContent(e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          rows={4}
                          placeholder="Write your custom message..."
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={handleWriteSubmit}
                          className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                        >
                          <ArrowRight className="w-4 h-4" />
                          Send
                        </button>
                        <button
                          onClick={() => {
                            dispatch({ type: 'SET_UI_STATE', payload: { showInlineEditor: false } });
                            setEditorContent('');
                          }}
                          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-all duration-200"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Progress Indicator */}
              <div className="mt-6 space-y-3">
                <div className="text-center">
                  <span className="text-sm text-gray-600">
                    {Math.max(0, state.queue.length - state.processed.length - state.approvedForBatch.length - state.needsReview.length)} of {state.queue.length} remaining
                  </span>
                </div>
                <div className="flex items-center justify-center">
                  <div className="flex gap-2">
                    {state.queue.map((_, index) => {
                      const isProcessed = state.processed.some(p => p.id === state.queue[index]?.id);
                      const isApproved = state.approvedForBatch.some(a => a.id === state.queue[index]?.id);
                      const isNeedsReview = state.needsReview.some(n => n.id === state.queue[index]?.id);
                      const isCurrent = index === state.currentIndex;

                      return (
                        <div
                          key={index}
                          className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                            isProcessed 
                              ? 'bg-green-500' 
                              : isApproved 
                                ? 'bg-green-300' 
                                : isNeedsReview 
                                  ? 'bg-yellow-500' 
                                  : isCurrent 
                                    ? 'bg-blue-600' 
                                    : 'bg-gray-300'
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}