import { Card, CardBody, CardHeader } from '@heroui/react'
import { Users } from 'lucide-react'

export default function CustomersPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Customer Management</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage customer accounts, credit limits, and payment behavior</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Customer Overview</h3>
            </div>
          </CardHeader>
          <CardBody>
            <p className="text-gray-600 dark:text-gray-400">
              Customer list with risk scoring and payment behavior analysis will be displayed here.
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="font-semibold">Payment Behavior</h3>
          </CardHeader>
          <CardBody>
            <p className="text-gray-600 dark:text-gray-400">
              Customer payment patterns and risk assessment metrics.
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="font-semibold">Credit Management</h3>
          </CardHeader>
          <CardBody>
            <p className="text-gray-600 dark:text-gray-400">
              Credit limits, terms, and relationship management tools.
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}