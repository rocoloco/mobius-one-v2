import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { DollarSign, Clock, Shield, BarChart3, ArrowRight, CheckCircle, Menu, X, User, Settings, CreditCard, LogOut, ChevronDown } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '../hooks/useAuth';

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
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(5);
  const [isComplete, setIsComplete] = useState(false);
  const { logout } = useAuth();
  const [metrics, setMetrics] = useState<CollectionMetrics>({
    revenueAccelerated: 127500,
    timeSaved: 12.5,
    relationshipsProtected: 100,
    aiLearningProgress: 73,
    remainingQueue: 8
  });
  const [isAnimating, setIsAnimating] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [showInlineEditor, setShowInlineEditor] = useState(false);
  const [editorContent, setEditorContent] = useState('');
  const [processed, setProcessed] = useState<Invoice[]>([]);
  const [approvedForBatch, setApprovedForBatch] = useState<Invoice[]>([]);
  const [needsReview, setNeedsReview] = useState<Invoice[]>([]);
  const [queue, setQueue] = useState<Invoice[]>([]);
  const [isQueueComplete, setIsQueueComplete] = useState(false);
  const [totalQueueSize, setTotalQueueSize] = useState(0);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };

    if (isProfileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileDropdownOpen]);

  // Save/Load progress from localStorage
  const saveProgressToStorage = (data: any) => {
    const progressData = {
      ...data,
      timestamp: Date.now(),
      expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    };
    localStorage.setItem('collectionsProgress', JSON.stringify(progressData));
  };

  const loadProgressFromStorage = () => {
    try {
      const stored = localStorage.getItem('collectionsProgress');
      if (stored) {
        const data = JSON.parse(stored);
        if (data.expiresAt > Date.now()) {
          return data;
        } else {
          localStorage.removeItem('collectionsProgress');
        }
      }
    } catch (e) {
      console.error('Error loading progress:', e);
    }
    return null;
  };

  // Initialize queue with mock data and restore progress
  useEffect(() => {
    const savedProgress = loadProgressFromStorage();
    
    if (savedProgress) {
      setCurrentIndex(savedProgress.currentIndex || 0);
      setProcessed(savedProgress.processed || []);
      setApprovedForBatch(savedProgress.approvedForBatch || []);
      setNeedsReview(savedProgress.needsReview || []);
      setTotalQueueSize(savedProgress.totalQueueSize || invoices.length);
      setMetrics(savedProgress.metrics || metrics);
    } else {
      setTotalQueueSize(invoices.length);
    }
    
    setQueue(invoices);
  }, []);

  // Auto-save progress on state changes
  useEffect(() => {
    if (queue.length > 0) {
      saveProgressToStorage({
        currentIndex,
        processed,
        approvedForBatch,
        needsReview,
        totalQueueSize,
        metrics
      });
    }
  }, [currentIndex, processed, approvedForBatch, needsReview, metrics, queue.length, totalQueueSize]);

  // Update metrics when queue changes
  useEffect(() => {
    // Calculate unique invoices handled to avoid double counting
    const uniqueHandledIds = new Set([
      ...processed.map(inv => inv.id),
      ...approvedForBatch.map(inv => inv.id),
      ...needsReview.map(inv => inv.id)
    ]);
    const totalHandled = uniqueHandledIds.size;
    const remaining = Math.max(0, queue.length - totalHandled);
    
    setMetrics(prev => ({
      ...prev,
      remainingQueue: remaining
    }));
  }, [queue.length, processed, approvedForBatch, needsReview]);

  // Check completion status
  useEffect(() => {
    if (queue.length > 0) {
      const uniqueHandledIds = new Set([
        ...processed.map(inv => inv.id),
        ...approvedForBatch.map(inv => inv.id),
        ...needsReview.map(inv => inv.id)
      ]);
      const totalHandled = uniqueHandledIds.size;
      const completionRate = (totalHandled / queue.length) * 100;
      setIsComplete(completionRate === 100);
    }
  }, [queue.length, processed, approvedForBatch, needsReview]);

  // Auto-redirect countdown for completed sessions
  useEffect(() => {
    if (isQueueComplete && isComplete) {
      console.log('Starting auto-redirect countdown');
      setRedirectCountdown(5);
      
      const timer = setInterval(() => {
        setRedirectCountdown(prev => {
          console.log('Countdown:', prev);
          if (prev <= 1) {
            console.log('Auto-redirecting to home');
            clearInterval(timer);
            // Use window.location instead of navigate for more reliable redirect
            window.location.href = '/';
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isQueueComplete, isComplete]);

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

  const currentInvoice = queue[currentIndex];

  const moveToNext = () => {
    if (currentIndex >= queue.length - 1) {
      // Navigate to celebration
      setIsQueueComplete(true);
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const updateMetrics = (action: 'send' | 'write' | 'skip') => {
    setIsAnimating(true);

    if (action === 'send' || action === 'write') {
      setMetrics(prev => ({
        ...prev,
        revenueAccelerated: prev.revenueAccelerated + currentInvoice.amount,
        timeSaved: prev.timeSaved + (action === 'send' ? 2.5 : 1.5),
        relationshipsProtected: prev.relationshipsProtected + 1,
        aiLearningProgress: Math.min(prev.aiLearningProgress + 2, 100)
      }));
    }

    setTimeout(() => setIsAnimating(false), 500);
  };

  const handleSend = () => {
    if (!currentInvoice) return;
    
    setProcessed([...processed, currentInvoice]);
    updateMetrics('send');
    setShowSuccessAnimation(true);
    setIsMobileMenuOpen(false);

    setTimeout(() => {
      setShowSuccessAnimation(false);
      moveToNext();
    }, 1000);

    toast({
      title: 'Message sent immediately!',
      description: `${currentInvoice.customer} - $${currentInvoice.amount.toLocaleString()}`,
    });
  };

  const handleApprove = () => {
    if (!currentInvoice) return;
    
    setApprovedForBatch([...approvedForBatch, currentInvoice]);
    updateMetrics('send');
    setShowSuccessAnimation(true);
    setIsMobileMenuOpen(false);

    setTimeout(() => {
      setShowSuccessAnimation(false);
      moveToNext();
    }, 1000);

    toast({
      title: 'Message approved for batch sending!',
      description: `${currentInvoice.customer} - $${currentInvoice.amount.toLocaleString()}`,
    });
  };

  const handleWrite = () => {
    if (!currentInvoice) return;
    
    // Provide a draft template for the user to start with
    const draftTemplate = `Hi ${currentInvoice.contactName},

I hope this message finds you well. I wanted to reach out regarding invoice ${currentInvoice.invoiceNumber} for $${currentInvoice.amount.toLocaleString()} which is currently ${currentInvoice.daysPastDue} days past due.

[Add your personalized message here]

Please let me know if you have any questions or if there's anything I can help with to resolve this.

Best regards,
[Your Name]`;
    
    setEditorContent(draftTemplate);
    setShowInlineEditor(true);
    setIsMobileMenuOpen(false);
  };

  const handleWriteSubmit = () => {
    if (!currentInvoice) return;
    
    setApprovedForBatch([...approvedForBatch, currentInvoice]);
    updateMetrics('write');
    setShowSuccessAnimation(true);
    setShowInlineEditor(false);

    setTimeout(() => {
      setShowSuccessAnimation(false);
      moveToNext();
    }, 1000);

    toast({
      title: 'Custom message approved for batch!',
      description: `${currentInvoice.customer} - $${currentInvoice.amount.toLocaleString()}`,
    });
  };

  const handleWriteCancel = () => {
    setShowInlineEditor(false);
    setEditorContent('');
  };

  const handleReviewLater = () => {
    if (!currentInvoice) return;
    
    setNeedsReview([...needsReview, currentInvoice]);
    setIsMobileMenuOpen(false);
    
    setTimeout(() => {
      moveToNext();
    }, 300);

    toast({
      title: 'Moved to review later',
      description: `${currentInvoice.customer} - $${currentInvoice.amount.toLocaleString()}`,
    });
  };

  const handleBatchSend = () => {
    if (approvedForBatch.length === 0) return;
    
    setProcessed([...processed, ...approvedForBatch]);
    setApprovedForBatch([]);
    
    toast({
      title: `Batch sent successfully!`,
      description: `${approvedForBatch.length} messages sent to customers`,
    });
  };

  const handleDoneForToday = () => {
    setIsQueueComplete(true);
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
        <div className="flex items-center gap-3 mb-4">
          <img 
            src="/logos/mobius-logo-light.png" 
            alt="Mobius Logo" 
            className="w-8 h-8 object-contain"
          />
          <h1 className="text-xl font-bold text-gray-900">Collections</h1>
        </div>
        
        {/* Persistent Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Queue Progress</span>
            <span className="font-semibold text-gray-900">
              {processed.length + approvedForBatch.length} of {totalQueueSize}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-cyan-600 to-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${totalQueueSize > 0 ? ((processed.length + approvedForBatch.length) / totalQueueSize) * 100 : 0}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Sent: {processed.length}</span>
            <span>Approved: {approvedForBatch.length}</span>
            {needsReview.length > 0 && (
              <span className="text-yellow-600 font-medium">Review: {needsReview.length}</span>
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

      {/* Batch Send & Queue Status */}
      <div className="flex-1 flex flex-col justify-end p-6 space-y-4">
        {/* Batch Send Button */}
        {approvedForBatch.length >= 3 && (
          <button 
            onClick={handleBatchSend}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            Send All Reviewed ({approvedForBatch.length})
          </button>
        )}
        
        {/* Needs Review Button */}
        {needsReview.length > 0 && (
          <button className="w-full bg-yellow-100 hover:bg-yellow-200 text-yellow-800 font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2">
            <Clock className="w-5 h-5" />
            Needs Review ({needsReview.length})
          </button>
        )}
        
        <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2">
          <BarChart3 className="w-5 h-5" />
          See Full Queue ({metrics.remainingQueue} remaining)
        </button>

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
  );

  const getCelebrationMessage = () => {
    const totalItems = queue.length;
    const processedCount = processed.length;
    const approvedCount = approvedForBatch.length;
    const reviewCount = needsReview.length;
    
    // Calculate unique invoices handled (avoid double counting)
    const uniqueHandledIds = new Set([
      ...processed.map(inv => inv.id),
      ...approvedForBatch.map(inv => inv.id),
      ...needsReview.map(inv => inv.id)
    ]);
    const totalHandled = uniqueHandledIds.size;
    const completionRate = totalItems > 0 ? (totalHandled / totalItems) * 100 : 0;

    if (isComplete) {
      return {
        title: "Perfect Day! 🎉",
        message: "You've processed every invoice in your queue.",
        subtitle: "Outstanding work maintaining those customer relationships!",
        isComplete: true
      };
    } else if (completionRate >= 80) {
      return {
        title: "Great Progress! 👏",
        message: `You've processed ${totalHandled} of ${totalItems} invoices.`,
        subtitle: `${reviewCount} items need review, ${approvedCount} ready for batch sending.`,
        isComplete: false
      };
    } else {
      return {
        title: "See You Later! 👋",
        message: `You've processed ${totalHandled} of ${totalItems} invoices.`,
        subtitle: "You can continue where you left off anytime.",
        isComplete: false
      };
    }
  };

  if (!currentInvoice || isQueueComplete) {
    const celebration = getCelebrationMessage();
    const totalValue = [...processed, ...approvedForBatch].reduce((sum, invoice) => sum + invoice.amount, 0);
    const totalHandled = processed.length + approvedForBatch.length;
    
    if (celebration.isComplete) {
      // Complete session - celebration with auto-redirect
      return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
          <div className="text-center max-w-lg mx-auto p-8">
            <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 mb-2">✨ Queue Clear! ✨</h1>
            <p className="text-xl text-gray-700 mb-6">
              You've handled {totalHandled} invoices worth {formatCurrency(totalValue)}
            </p>
            <p className="text-lg text-green-700 mb-8 font-medium">
              They'll be sent in the next batch run
            </p>
            
            <div className="bg-white rounded-lg p-6 shadow-lg mb-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-1">{metrics.timeSaved.toFixed(0)} min</div>
                  <div className="text-gray-600">Time saved today</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-1">7 days</div>
                  <div className="text-gray-600">Expected acceleration</div>
                </div>
              </div>
            </div>
            
            <div className="text-gray-600 mb-4">
              Redirecting in {redirectCountdown} seconds...
            </div>
            
            <button
              onClick={() => {
                console.log('Button clicked - clearing progress and navigating');
                localStorage.removeItem('collectionsProgress');
                window.location.href = '/';
              }}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200"
            >
              See you tomorrow!
            </button>
          </div>
        </div>
      );
    } else {
      // Partial session - offer to continue
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-8">
            <div className="w-20 h-20 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{celebration.title}</h2>
            <p className="text-lg text-gray-700 mb-2">{celebration.message}</p>
            <p className="text-gray-600 mb-8">{celebration.subtitle}</p>
            
            <div className="bg-white rounded-lg p-6 shadow-lg mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress So Far</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{processed.length}</div>
                  <div className="text-gray-600">Sent</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{approvedForBatch.length}</div>
                  <div className="text-gray-600">Approved</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{needsReview.length}</div>
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
                  setIsQueueComplete(false);
                  // Find next unprocessed invoice
                  const nextIndex = queue.findIndex(invoice => 
                    !processed.some(p => p.id === invoice.id) && 
                    !approvedForBatch.some(a => a.id === invoice.id) &&
                    !needsReview.some(n => n.id === invoice.id)
                  );
                  setCurrentIndex(nextIndex >= 0 ? nextIndex : currentIndex);
                }}
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200"
              >
                Continue Session
              </button>
              <button
                onClick={() => navigate('/')}
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
                {!showInlineEditor ? (
                  <div className="space-y-3">
                    <button
                      onClick={handleApprove}
                      className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-3 transform hover:scale-105"
                    >
                      {showSuccessAnimation ? (
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
                        onClick={handleReviewLater}
                        className="text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors duration-200 block"
                      >
                        Review Later
                      </button>
                      <button
                        onClick={handleDoneForToday}
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
                        onClick={handleWriteCancel}
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
                  {Math.max(0, queue.length - processed.length - approvedForBatch.length - needsReview.length)} of {queue.length} remaining
                </span>
              </div>
              <div className="flex items-center justify-center">
                <div className="flex gap-2">
                  {queue.map((_, index) => {
                    const isProcessed = processed.some(p => p.id === queue[index]?.id);
                    const isApproved = approvedForBatch.some(a => a.id === queue[index]?.id);
                    const isNeedsReview = needsReview.some(n => n.id === queue[index]?.id);
                    const isCurrent = index === currentIndex;
                    
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
              {!showInlineEditor ? (
                <div className="space-y-3">
                  <button
                    onClick={handleApprove}
                    className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-3"
                  >
                    {showSuccessAnimation ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <ArrowRight className="w-5 h-5" />
                    )}
                    Approve for Batch
                  </button>

                  <button
                    onClick={handleSend}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-3"
                  >
                    Send Immediately
                  </button>

                  <button
                    onClick={handleWrite}
                    className="w-full bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 px-4 rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-all duration-200 flex items-center justify-center gap-3"
                  >
                    I'll Write My Own
                  </button>

                  <div className="text-center pt-2 space-y-2">
                    <button
                      onClick={handleReviewLater}
                      className="text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors duration-200 block"
                    >
                      Review Later
                    </button>
                    <button
                      onClick={handleDoneForToday}
                      className="text-gray-400 hover:text-gray-600 text-xs font-medium transition-colors duration-200 block"
                    >
                      I'm done for now
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
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
                  <div className="flex gap-2">
                    <button
                      onClick={handleWriteSubmit}
                      className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <ArrowRight className="w-4 h-4" />
                      Send
                    </button>
                    <button
                      onClick={handleWriteCancel}
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
          <div className="mt-4 space-y-2">
            <div className="text-center">
              <span className="text-sm text-gray-600">
                {(() => {
                  const uniqueHandledIds = new Set([
                    ...processed.map(inv => inv.id),
                    ...approvedForBatch.map(inv => inv.id),
                    ...needsReview.map(inv => inv.id)
                  ]);
                  const totalHandled = uniqueHandledIds.size;
                  return Math.max(0, queue.length - totalHandled);
                })()} of {queue.length} remaining
              </span>
            </div>
            <div className="flex items-center justify-center">
              <div className="flex gap-2">
                {queue.map((_, index) => {
                  const isProcessed = processed.some(p => p.id === queue[index]?.id);
                  const isApproved = approvedForBatch.some(a => a.id === queue[index]?.id);
                  const isNeedsReview = needsReview.some(n => n.id === queue[index]?.id);
                  const isCurrent = index === currentIndex;
                  
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