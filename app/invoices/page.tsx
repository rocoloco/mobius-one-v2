import { Card, CardBody, CardHeader } from '@heroui/react'
import { FileText, Clock, AlertTriangle } from 'lucide-react'

export default function InvoicesPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Invoice Management</h1>
        <p className="text-gray-600 dark:text-gray-400">Track invoice aging, payments, and collection activities</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Aging Report</h3>
            </div>
          </CardHeader>
          <CardBody>
            <p className="text-gray-600 dark:text-gray-400">
              Invoice aging analysis with priority sorting and collection status.
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-amber-500" />
              <h3 className="font-semibold">Overdue Invoices</h3>
            </div>
          </CardHeader>
          <CardBody>
            <p className="text-gray-600 dark:text-gray-400">
              Past due invoices requiring immediate attention and follow-up.
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <h3 className="font-semibold">Critical Accounts</h3>
            </div>
          </CardHeader>
          <CardBody>
            <p className="text-gray-600 dark:text-gray-400">
              High-risk accounts with significant overdue amounts.
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}