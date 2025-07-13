import { Card, CardBody, CardHeader } from '@heroui/react'
import { Brain, CheckCircle, Clock } from 'lucide-react'

export default function RecommendationsPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Recommendations</h1>
        <p className="text-gray-600 dark:text-gray-400">Review and approve AI-generated collection strategies</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Pending Approvals</h3>
            </div>
          </CardHeader>
          <CardBody>
            <p className="text-gray-600 dark:text-gray-400">
              AI-generated collection recommendations awaiting your review and approval.
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <h3 className="font-semibold">Success Rate</h3>
            </div>
          </CardHeader>
          <CardBody>
            <p className="text-gray-600 dark:text-gray-400">
              Track the effectiveness of AI recommendations and collection outcomes.
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-amber-500" />
              <h3 className="font-semibold">Strategy Templates</h3>
            </div>
          </CardHeader>
          <CardBody>
            <p className="text-gray-600 dark:text-gray-400">
              Customize and manage collection strategy templates for different scenarios.
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}