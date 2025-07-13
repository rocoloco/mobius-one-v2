import { Card, CardBody, CardHeader } from '@heroui/react'
import { Settings, User, Bell, Database } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">Configure your preferences and system integrations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-gray-900 dark:text-white">User Preferences</h3>
            </div>
          </CardHeader>
          <CardBody>
            <p className="text-gray-600 dark:text-gray-400">
              Personal settings, notifications, and dashboard customization.
            </p>
          </CardBody>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-amber-500" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
            </div>
          </CardHeader>
          <CardBody>
            <p className="text-gray-600 dark:text-gray-400">
              Configure alerts for overdue invoices, AI recommendations, and system updates.
            </p>
          </CardBody>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-green-500" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Integrations</h3>
            </div>
          </CardHeader>
          <CardBody>
            <p className="text-gray-600 dark:text-gray-400">
              Manage connections to Salesforce, NetSuite, and other business systems.
            </p>
          </CardBody>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Settings className="h-5 w-5 text-purple-500" />
              <h3 className="font-semibold text-gray-900 dark:text-white">AI Configuration</h3>
            </div>
          </CardHeader>
          <CardBody>
            <p className="text-gray-600 dark:text-gray-400">
              Fine-tune AI model parameters and collection strategy preferences.
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}