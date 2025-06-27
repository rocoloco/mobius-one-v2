import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button, Input, Switch } from "@heroui/react";
import { 
  Database, Key, Bell, User, Shield, Globe, 
  Check, X, AlertCircle, ExternalLink, Trash2,
  Save, TestTube, Settings as SettingsIcon
} from "lucide-react";
import { chatApi } from "@/lib/chatApi";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("connections");
  const [testResults, setTestResults] = useState<Record<string, any>>({});
  const [isTestingConnection, setIsTestingConnection] = useState<string | null>(null);

  const { data: user } = useQuery({
    queryKey: ['/api/user'],
    enabled: true
  });

  const { data: systemConnections = [], refetch: refetchConnections } = useQuery({
    queryKey: ['/api/systems'],
    enabled: true
  });

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    realTimeUpdates: true,
    weeklyReports: false,
    systemStatus: true
  });

  const [profile, setProfile] = useState({
    displayName: '',
    email: '',
    role: '',
    timezone: 'UTC'
  });

  useEffect(() => {
    if (user) {
      setProfile({
        displayName: (user as any).username || '',
        email: (user as any).email || '',
        role: (user as any).role || 'User',
        timezone: 'UTC'
      });
    }
  }, [user]);

  const testConnection = async (systemType: string) => {
    setIsTestingConnection(systemType);
    try {
      let result;
      if (systemType === 'salesforce') {
        result = await chatApi.testSalesforceConnection();
      } else if (systemType === 'netsuite') {
        result = await chatApi.testNetSuiteConnection();
      }
      
      setTestResults(prev => ({
        ...prev,
        [systemType]: result
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [systemType]: { status: 'error', message: 'Connection test failed' }
      }));
    } finally {
      setIsTestingConnection(null);
    }
  };

  const getConnectionStatus = (system: any) => {
    const testResult = testResults[system.systemType];
    if (testResult) {
      return testResult.status === 'connected' ? 'Connected' : 'Error';
    }
    return system.isConnected ? 'Connected' : 'Disconnected';
  };

  const getStatusColor = (system: any) => {
    const status = getConnectionStatus(system);
    switch (status) {
      case 'Connected': return 'text-green-600';
      case 'Error': return 'text-red-600';
      default: return 'text-gray-500';
    }
  };

  const tabs = [
    { id: 'connections', label: 'System Connections', icon: Database },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield }
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">Manage your account preferences and system connections</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                <div className="flex items-center gap-2">
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </div>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="max-w-4xl">
          {activeTab === 'connections' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">System Connections</h2>
                <p className="text-gray-600 mb-6">
                  Connect your business systems to enable cross-platform data queries and insights.
                </p>
              </div>

              <div className="space-y-4">
                {(systemConnections as any[]).map((system) => (
                  <div key={system.id} className="card p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Database className="h-6 w-6 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 capitalize">
                            {system.systemType}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {system.systemType === 'salesforce' 
                              ? 'CRM and sales pipeline data'
                              : 'ERP and financial data'
                            }
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-sm font-medium ${getStatusColor(system)}`}>
                              {getConnectionStatus(system)}
                            </span>
                            {testResults[system.systemType] && (
                              <span className="text-xs text-gray-500">
                                Last tested: {new Date().toLocaleTimeString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <button
                          className="btn-secondary"
                          onClick={() => testConnection(system.systemType)}
                          disabled={isTestingConnection === system.systemType}
                        >
                          <TestTube className="h-4 w-4" />
                          {isTestingConnection === system.systemType ? 'Testing...' : 'Test'}
                        </button>
                        <button className="btn-secondary">
                          <SettingsIcon className="h-4 w-4" />
                          Configure
                        </button>
                      </div>
                    </div>
                    
                    {testResults[system.systemType] && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-start gap-3">
                          {testResults[system.systemType].status === 'connected' ? (
                            <Check className="h-5 w-5 text-green-600 mt-0.5" />
                          ) : (
                            <X className="h-5 w-5 text-red-600 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {testResults[system.systemType].status === 'connected' 
                                ? 'Connection successful' 
                                : 'Connection failed'
                              }
                            </p>
                            {testResults[system.systemType].message && (
                              <p className="text-sm text-gray-600 mt-1">
                                {testResults[system.systemType].message}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">Add New Connection</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Connect additional business systems and data sources
                    </p>
                  </div>
                  <button className="btn-primary">
                    <Database className="h-4 w-4" />
                    Add System
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h2>
                <p className="text-gray-600 mb-6">
                  Choose how and when you want to receive updates about your business data.
                </p>
              </div>

              <div className="space-y-4">
                <div className="card p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">Email Alerts</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Receive email notifications for important data changes and alerts
                      </p>
                    </div>
                    <Switch
                      isSelected={notifications.emailAlerts}
                      onValueChange={(checked) => 
                        setNotifications(prev => ({ ...prev, emailAlerts: checked }))
                      }
                    />
                  </div>
                </div>

                <div className="card p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">Real-time Updates</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Get instant notifications when your data is updated
                      </p>
                    </div>
                    <Switch
                      isSelected={notifications.realTimeUpdates}
                      onValueChange={(checked) => 
                        setNotifications(prev => ({ ...prev, realTimeUpdates: checked }))
                      }
                    />
                  </div>
                </div>

                <div className="card p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">Weekly Reports</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Receive weekly summaries of your business metrics
                      </p>
                    </div>
                    <Switch
                      isSelected={notifications.weeklyReports}
                      onValueChange={(checked) => 
                        setNotifications(prev => ({ ...prev, weeklyReports: checked }))
                      }
                    />
                  </div>
                </div>

                <div className="card p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">System Status</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Get notified about system maintenance and outages
                      </p>
                    </div>
                    <Switch
                      isSelected={notifications.systemStatus}
                      onValueChange={(checked) => 
                        setNotifications(prev => ({ ...prev, systemStatus: checked }))
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button className="btn-primary">
                  <Save className="h-4 w-4" />
                  Save Preferences
                </button>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h2>
                <p className="text-gray-600 mb-6">
                  Update your personal information and account preferences.
                </p>
              </div>

              <div className="card p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Display Name
                    </label>
                    <input
                      className="input-modern"
                      value={profile.displayName}
                      onChange={(e) => setProfile(prev => ({ ...prev, displayName: e.target.value }))}
                      placeholder="Enter your display name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      className="input-modern"
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Enter your email"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role
                    </label>
                    <select 
                      className="input-modern"
                      value={profile.role}
                      onChange={(e) => setProfile(prev => ({ ...prev, role: e.target.value }))}
                    >
                      <option value="User">User</option>
                      <option value="Admin">Admin</option>
                      <option value="Executive">Executive</option>
                      <option value="Analyst">Analyst</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Timezone
                    </label>
                    <select 
                      className="input-modern"
                      value={profile.timezone}
                      onChange={(e) => setProfile(prev => ({ ...prev, timezone: e.target.value }))}
                    >
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">Eastern Time</option>
                      <option value="America/Chicago">Central Time</option>
                      <option value="America/Denver">Mountain Time</option>
                      <option value="America/Los_Angeles">Pacific Time</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button className="btn-primary">
                  <Save className="h-4 w-4" />
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h2>
                <p className="text-gray-600 mb-6">
                  Manage your account security and access permissions.
                </p>
              </div>

              <div className="space-y-4">
                <div className="card p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">Password</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Last changed 30 days ago
                      </p>
                    </div>
                    <button className="btn-secondary">
                      <Key className="h-4 w-4" />
                      Change Password
                    </button>
                  </div>
                </div>

                <div className="card p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">Two-Factor Authentication</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <button className="btn-secondary">
                      <Shield className="h-4 w-4" />
                      Enable 2FA
                    </button>
                  </div>
                </div>

                <div className="card p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">API Keys</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Manage API access for integrations and automation
                      </p>
                    </div>
                    <button className="btn-secondary">
                      <Key className="h-4 w-4" />
                      Manage Keys
                    </button>
                  </div>
                </div>

                <div className="card p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">Active Sessions</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        View and manage your active login sessions
                      </p>
                    </div>
                    <button className="btn-secondary">
                      <Globe className="h-4 w-4" />
                      View Sessions
                    </button>
                  </div>
                </div>
              </div>

              <div className="card p-6 border-red-200 bg-red-50">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-medium text-red-900">Danger Zone</h3>
                    <p className="text-sm text-red-700 mt-1 mb-4">
                      These actions cannot be undone. Please proceed with caution.
                    </p>
                    <button className="btn-secondary text-red-700 border-red-200 hover:bg-red-100">
                      <Trash2 className="h-4 w-4" />
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}