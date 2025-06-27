import { useState } from "react";
import { Card, CardBody, CardHeader, Button, Input, Switch, Chip, Divider } from "@heroui/react";
import { 
  Settings as SettingsIcon, 
  Database, 
  Shield, 
  Bell, 
  User,
  Key,
  Wifi,
  Save,
  TestTube,
  CheckCircle,
  XCircle
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { chatApi } from "@/lib/chatApi";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const [testingConnections, setTestingConnections] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['/api/user'],
    enabled: true
  });

  const { data: systemConnections = [] } = useQuery({
    queryKey: ['/api/systems'],
    enabled: true
  });

  const testConnectionMutation = useMutation({
    mutationFn: async (systemType: string) => {
      if (systemType === 'salesforce') {
        return await chatApi.testSalesforceConnection();
      } else if (systemType === 'netsuite') {
        return await chatApi.testNetSuiteConnection();
      }
      throw new Error('Unknown system type');
    },
    onSuccess: (data, systemType) => {
      toast({
        title: "Connection Test",
        description: `${systemType.toUpperCase()} connection ${data.status === 'connected' ? 'successful' : 'failed'}`,
        variant: data.status === 'connected' ? 'default' : 'destructive'
      });
      queryClient.invalidateQueries({ queryKey: ['/api/systems'] });
    },
    onError: (error, systemType) => {
      toast({
        title: "Connection Error",
        description: `Failed to test ${systemType.toUpperCase()} connection`,
        variant: 'destructive'
      });
    },
    onSettled: (_, __, systemType) => {
      setTestingConnections(prev => {
        const newSet = new Set(prev);
        newSet.delete(systemType);
        return newSet;
      });
    }
  });

  const handleTestConnection = (systemType: string) => {
    setTestingConnections(prev => new Set(prev).add(systemType));
    testConnectionMutation.mutate(systemType);
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-8">
        <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
          <SettingsIcon className="text-white" size={20} />
        </div>
        <div>
          <h1 className="text-3xl font-mono font-bold text-gray-900">
            SYSTEM SETTINGS
          </h1>
          <p className="text-gray-600 font-mono">Configure connections and preferences</p>
        </div>
      </div>

      {/* User Profile */}
      <Card className="bg-white border border-gray-200">
        <CardHeader>
          <h3 className="font-mono font-bold text-lg flex items-center">
            <User className="mr-2" size={18} />
            USER PROFILE
          </h3>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Username"
              value={user?.username || ""}
              readOnly
              className="font-mono"
              startContent={<User size={16} />}
            />
            <Input
              label="User ID"
              value={user?.id?.toString() || ""}
              readOnly
              className="font-mono"
              startContent={<Key size={16} />}
            />
          </div>
        </CardBody>
      </Card>

      {/* System Connections */}
      <Card className="bg-white border border-gray-200">
        <CardHeader>
          <h3 className="font-mono font-bold text-lg flex items-center">
            <Database className="mr-2" size={18} />
            SYSTEM CONNECTIONS
          </h3>
        </CardHeader>
        <CardBody className="space-y-6">
          {systemConnections.map((connection: any) => (
            <div key={connection.id}>
              <Card className="bg-gray-50 border border-gray-200">
                <CardBody className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        connection.systemType === 'salesforce' 
                          ? 'bg-blue-100' 
                          : 'bg-orange-100'
                      }`}>
                        <Database className={
                          connection.systemType === 'salesforce' 
                            ? 'text-blue-600' 
                            : 'text-orange-600'
                        } size={20} />
                      </div>
                      <div>
                        <h4 className="font-mono font-bold text-lg uppercase">
                          {connection.systemType}
                        </h4>
                        <p className="text-sm text-gray-600 font-mono">
                          {connection.systemType === 'salesforce' ? 'Customer Relationship Management' : 'Enterprise Resource Planning'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Chip 
                        size="sm"
                        color={connection.isConnected ? "success" : "danger"}
                        variant="flat"
                        className="font-mono"
                        startContent={connection.isConnected ? <CheckCircle size={12} /> : <XCircle size={12} />}
                      >
                        {connection.isConnected ? "CONNECTED" : "DISCONNECTED"}
                      </Chip>
                      <Button
                        size="sm"
                        variant="bordered"
                        className="font-mono"
                        isLoading={testingConnections.has(connection.systemType)}
                        onClick={() => handleTestConnection(connection.systemType)}
                        startContent={<TestTube size={14} />}
                      >
                        {testingConnections.has(connection.systemType) ? "TESTING..." : "TEST"}
                      </Button>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-mono font-bold text-gray-700 mb-1">CONNECTION STATUS</p>
                      <p className="text-sm font-mono text-gray-600">
                        {connection.isConnected ? "Active and operational" : "Not connected"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-mono font-bold text-gray-700 mb-1">LAST SYNC</p>
                      <p className="text-sm font-mono text-gray-600">
                        {connection.lastSyncAt 
                          ? new Date(connection.lastSyncAt).toLocaleString()
                          : "Never synced"
                        }
                      </p>
                    </div>
                  </div>
                </CardBody>
              </Card>
              <Divider className="my-4" />
            </div>
          ))}
        </CardBody>
      </Card>

      {/* Notification Settings */}
      <Card className="bg-white border border-gray-200">
        <CardHeader>
          <h3 className="font-mono font-bold text-lg flex items-center">
            <Bell className="mr-2" size={18} />
            NOTIFICATIONS
          </h3>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono font-bold text-sm">System Alerts</p>
              <p className="text-xs text-gray-600 font-mono">Receive notifications for system status changes</p>
            </div>
            <Switch defaultSelected size="sm" />
          </div>
          <Divider />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono font-bold text-sm">Query Responses</p>
              <p className="text-xs text-gray-600 font-mono">Get notified when AI responses are ready</p>
            </div>
            <Switch defaultSelected size="sm" />
          </div>
          <Divider />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono font-bold text-sm">Data Updates</p>
              <p className="text-xs text-gray-600 font-mono">Alerts for new data from connected systems</p>
            </div>
            <Switch size="sm" />
          </div>
        </CardBody>
      </Card>

      {/* Security Settings */}
      <Card className="bg-white border border-gray-200">
        <CardHeader>
          <h3 className="font-mono font-bold text-lg flex items-center">
            <Shield className="mr-2" size={18} />
            SECURITY
          </h3>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono font-bold text-sm">Auto-lock Sessions</p>
              <p className="text-xs text-gray-600 font-mono">Automatically lock after 30 minutes of inactivity</p>
            </div>
            <Switch defaultSelected size="sm" />
          </div>
          <Divider />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono font-bold text-sm">Secure Data Transmission</p>
              <p className="text-xs text-gray-600 font-mono">Encrypt all data transfers</p>
            </div>
            <Switch defaultSelected disabled size="sm" />
          </div>
          <Divider />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono font-bold text-sm">Audit Logging</p>
              <p className="text-xs text-gray-600 font-mono">Log all system access and queries</p>
            </div>
            <Switch defaultSelected size="sm" />
          </div>
        </CardBody>
      </Card>

      {/* Save Settings */}
      <div className="flex justify-end">
        <Button
          color="primary"
          className="font-mono"
          startContent={<Save size={16} />}
        >
          SAVE SETTINGS
        </Button>
      </div>
    </div>
  );
}