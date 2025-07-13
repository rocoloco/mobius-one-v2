import { Card, CardBody, CardHeader } from '@heroui/react'
import { Button } from '@heroui/react'
import { Chip } from '@heroui/react'
import { Progress } from '@heroui/react'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Clock, 
  AlertTriangle,
  CheckCircle
} from 'lucide-react'

export default function CollectionDashboard() {
  // Mock data - will be replaced with real data from API
  const dsoMetrics = {
    current: 42,
    previous: 47,
    improvement: 5,
    workingCapital: 125000,
    target: 35
  }

  const pendingRecommendations = [
    {
      id: 1,
      customer: 'TechCorp Inc.',
      invoice: 'INV-2024-001',
      amount: 15000,
      daysOverdue: 35,
      confidence: 92,
      strategy: 'gentle_reminder',
      riskLevel: 'low'
    },
    {
      id: 2,
      customer: 'StartupCo',
      invoice: 'INV-2024-002',
      amount: 7500,
      daysOverdue: 48,
      confidence: 76,
      strategy: 'urgent_notice',
      riskLevel: 'medium'
    }
  ]

  const recentOutcomes = [
    {
      customer: 'DataFlow Ltd.',
      amount: 25000,
      daysToPayment: 3,
      outcome: 'paid'
    },
    {
      customer: 'CloudTech',
      amount: 12000,
      daysToPayment: 7,
      outcome: 'paid'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="supabase-heading">Dashboard</h1>
          <p className="supabase-subheading">Collection performance overview and key metrics</p>
        </div>
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="supabase-metric-card">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="supabase-stat-label">Current DSO</p>
                <p className="supabase-stat-value">{dsoMetrics.current} days</p>
                <div className="flex items-center mt-2">
                  <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
                  <span className="supabase-stat-change text-green-600 dark:text-green-400">
                    -{dsoMetrics.improvement} days vs last month
                  </span>
                </div>
              </div>
              <div className="ml-4">
                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>
          </div>

          <div className="supabase-metric-card">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="supabase-stat-label">Working Capital Freed</p>
                <p className="supabase-stat-value">${dsoMetrics.workingCapital.toLocaleString()}</p>
                <div className="mt-2">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all" 
                      style={{width: `${(dsoMetrics.previous - dsoMetrics.current) / (dsoMetrics.previous - dsoMetrics.target) * 100}%`}}
                    ></div>
                  </div>
                  <p className="supabase-stat-change mt-1">Target: {dsoMetrics.target} days</p>
                </div>
              </div>
              <div className="ml-4">
                <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>
          </div>

          <div className="supabase-metric-card">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="supabase-stat-label">Pending Recommendations</p>
                <p className="supabase-stat-value">{pendingRecommendations.length}</p>
                <p className="supabase-stat-change mt-2">Awaiting approval</p>
              </div>
              <div className="ml-4">
                <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
            </div>
          </div>

          <div className="supabase-metric-card">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="supabase-stat-label">This Month Collected</p>
                <p className="supabase-stat-value">
                  ${(recentOutcomes.reduce((sum, outcome) => sum + outcome.amount, 0)).toLocaleString()}
                </p>
                <p className="supabase-stat-change mt-2">{recentOutcomes.length} payments received</p>
              </div>
              <div className="ml-4">
                <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="supabase-card">
            <div className="mb-6">
              <h3 className="supabase-section-title">AI Recommendations</h3>
            </div>
            <div className="space-y-4">
              {pendingRecommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                        {rec.customer}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {rec.invoice} • ${rec.amount.toLocaleString()} • {rec.daysOverdue} days overdue
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        Strategy: {rec.strategy.replace('_', ' ')} • Risk: {rec.riskLevel}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      rec.confidence >= 85 ? 'supabase-badge-success' : 
                      rec.confidence >= 70 ? 'supabase-badge-warning' : 'supabase-badge-error'
                    }`}>
                      {rec.confidence}% confident
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button className="px-3 py-1.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors">
                      Review & Approve
                    </button>
                    <button className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors">
                      Modify
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Outcomes */}
          <div className="supabase-card">
            <div className="mb-6">
              <h3 className="supabase-section-title">Recent Outcomes</h3>
            </div>
            <div className="space-y-4">
              {recentOutcomes.map((outcome, index) => (
                <div
                  key={index}
                  className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">
                        {outcome.customer}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        ${outcome.amount.toLocaleString()} • Paid in {outcome.daysToPayment} days
                      </p>
                    </div>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}