import { Card, CardBody, CardHeader } from '@heroui/react'
import { BarChart3, TrendingUp, PieChart } from 'lucide-react'

export default function AnalyticsPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics & Reports</h1>
        <p className="text-gray-600 dark:text-gray-400">Performance insights and collection effectiveness analysis</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-gray-900 dark:text-white">DSO Trends</h3>
            </div>
          </CardHeader>
          <CardBody>
            <p className="text-gray-600 dark:text-gray-400">
              Days Sales Outstanding trending and benchmarking against industry standards.
            </p>
          </CardBody>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Collection Performance</h3>
            </div>
          </CardHeader>
          <CardBody>
            <p className="text-gray-600 dark:text-gray-400">
              Collection effectiveness metrics and improvement opportunities.
            </p>
          </CardBody>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <PieChart className="h-5 w-5 text-purple-500" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Customer Segments</h3>
            </div>
          </CardHeader>
          <CardBody>
            <p className="text-gray-600 dark:text-gray-400">
              Customer segment performance analysis and risk distribution.
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}