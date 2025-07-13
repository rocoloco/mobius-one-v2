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
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">Collection performance overview and key metrics</p>
      </div>
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="collection-metric">
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Current DSO
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {dsoMetrics.current} days
                  </p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600 dark:text-green-400">
                  -{dsoMetrics.improvement} days vs last month
                </span>
              </div>
            </CardBody>
          </Card>

          <Card className="collection-metric">
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Working Capital Freed
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${dsoMetrics.workingCapital.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4">
                <Progress 
                  value={(dsoMetrics.previous - dsoMetrics.current) / (dsoMetrics.previous - dsoMetrics.target) * 100}
                  className="max-w-md"
                  color="success"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Target: {dsoMetrics.target} days
                </p>
              </div>
            </CardBody>
          </Card>

          <Card className="collection-metric">
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Pending Recommendations
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {pendingRecommendations.length}
                  </p>
                </div>
                <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-amber-600" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Awaiting approval
                </span>
              </div>
            </CardBody>
          </Card>

          <Card className="collection-metric">
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    This Month Collected
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${(recentOutcomes.reduce((sum, outcome) => sum + outcome.amount, 0)).toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {recentOutcomes.length} payments received
                </span>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* AI Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                AI Recommendations
              </h3>
            </CardHeader>
            <CardBody className="space-y-4">
              {pendingRecommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="approval-pending rounded-lg p-4 border"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {rec.customer}
                        </h4>
                        <Chip 
                          size="sm" 
                          color={rec.confidence >= 85 ? 'success' : rec.confidence >= 70 ? 'warning' : 'danger'}
                        >
                          {rec.confidence}% confident
                        </Chip>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {rec.invoice} • ${rec.amount.toLocaleString()} • {rec.daysOverdue} days overdue
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Strategy: {rec.strategy.replace('_', ' ')} • Risk: {rec.riskLevel}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2 mt-4">
                    <Button size="sm" color="primary">
                      Review & Approve
                    </Button>
                    <Button size="sm" variant="ghost">
                      Modify
                    </Button>
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>

          {/* Recent Outcomes */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Recent Outcomes
              </h3>
            </CardHeader>
            <CardBody className="space-y-4">
              {recentOutcomes.map((outcome, index) => (
                <div
                  key={index}
                  className="approval-approved rounded-lg p-4 border"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
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
            </CardBody>
          </Card>
        </div>
    </div>
  )
}