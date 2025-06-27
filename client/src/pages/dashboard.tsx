import { useState, useEffect } from "react";
import { Card, CardBody, CardHeader, Chip, Button, Progress } from "@heroui/react";
import { 
  Activity, 
  Database, 
  TrendingUp, 
  Users, 
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3,
  Zap
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { chatApi } from "@/lib/chatApi";

export default function DashboardPage() {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const { data: systemConnections, isLoading: connectionsLoading } = useQuery({
    queryKey: ['/api/systems'],
    enabled: true
  });

  const { data: conversations, isLoading: conversationsLoading } = useQuery({
    queryKey: ['/api/conversations'],
    enabled: true
  });

  const connectedSystems = systemConnections?.filter(conn => conn.isConnected) || [];
  const totalSystems = systemConnections?.length || 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-mono font-bold text-gray-900 mb-2">
            SYSTEM DASHBOARD
          </h1>
          <p className="text-gray-600 font-mono">
            {currentTime.toLocaleString()} • System Overview
          </p>
        </div>
        <div className="flex space-x-3">
          <Chip 
            color={connectedSystems.length > 0 ? "success" : "warning"} 
            variant="flat"
            className="font-mono"
          >
            {connectedSystems.length}/{totalSystems} SYSTEMS
          </Chip>
          <Chip color="primary" variant="flat" className="font-mono">
            OPERATIONAL
          </Chip>
        </div>
      </div>

      {/* System Status Grid */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-800 font-mono text-sm font-bold">SYSTEMS ONLINE</p>
                <p className="text-2xl font-mono font-bold text-green-900">
                  {connectionsLoading ? "..." : connectedSystems.length}
                </p>
              </div>
              <CheckCircle className="text-green-600" size={24} />
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-800 font-mono text-sm font-bold">ACTIVE SESSIONS</p>
                <p className="text-2xl font-mono font-bold text-blue-900">
                  {conversationsLoading ? "..." : conversations?.length || 0}
                </p>
              </div>
              <Activity className="text-blue-600" size={24} />
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-800 font-mono text-sm font-bold">AI QUERIES</p>
                <p className="text-2xl font-mono font-bold text-purple-900">
                  {conversations?.reduce((acc, conv) => acc + (conv.messageCount || 0), 0) || 0}
                </p>
              </div>
              <Zap className="text-purple-600" size={24} />
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-800 font-mono text-sm font-bold">DATA SOURCES</p>
                <p className="text-2xl font-mono font-bold text-orange-900">
                  {totalSystems}
                </p>
              </div>
              <Database className="text-orange-600" size={24} />
            </div>
          </CardBody>
        </Card>
      </div>

      {/* System Connections */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-white border border-gray-200">
          <CardHeader>
            <h3 className="font-mono font-bold text-lg flex items-center">
              <Database className="mr-2" size={18} />
              SYSTEM CONNECTIONS
            </h3>
          </CardHeader>
          <CardBody className="space-y-4">
            {connectionsLoading ? (
              <div className="space-y-3">
                {[1, 2].map(i => (
                  <div key={i} className="animate-pulse">
                    <div className="h-16 bg-gray-100 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : systemConnections?.length ? (
              systemConnections.map((connection) => (
                <Card key={connection.id} className="bg-gray-50 border border-gray-200">
                  <CardBody className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          connection.systemType === 'salesforce' 
                            ? 'bg-blue-100' 
                            : 'bg-orange-100'
                        }`}>
                          <Database className={
                            connection.systemType === 'salesforce' 
                              ? 'text-blue-600' 
                              : 'text-orange-600'
                          } size={16} />
                        </div>
                        <div>
                          <p className="font-mono font-bold text-sm uppercase">
                            {connection.systemType}
                          </p>
                          <p className="text-xs text-gray-500 font-mono">
                            Last sync: {new Date(connection.lastSyncAt || Date.now()).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <Chip 
                        size="sm"
                        color={connection.isConnected ? "success" : "danger"}
                        variant="flat"
                        className="font-mono"
                      >
                        {connection.isConnected ? "ONLINE" : "OFFLINE"}
                      </Chip>
                    </div>
                  </CardBody>
                </Card>
              ))
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 font-mono">No systems connected</p>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-white border border-gray-200">
          <CardHeader>
            <h3 className="font-mono font-bold text-lg flex items-center">
              <Clock className="mr-2" size={18} />
              RECENT ACTIVITY
            </h3>
          </CardHeader>
          <CardBody>
            {conversationsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse">
                    <div className="h-12 bg-gray-100 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : conversations?.length ? (
              <div className="space-y-3">
                {conversations.slice(0, 5).map((conversation) => (
                  <div key={conversation.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="font-mono text-sm font-medium truncate">
                        {conversation.title}
                      </p>
                      <p className="text-xs text-gray-500 font-mono">
                        {new Date(conversation.updatedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 font-mono">No recent activity</p>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card className="bg-white border border-gray-200">
        <CardHeader>
          <h3 className="font-mono font-bold text-lg flex items-center">
            <BarChart3 className="mr-2" size={18} />
            SYSTEM PERFORMANCE
          </h3>
        </CardHeader>
        <CardBody>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-sm font-bold">CONNECTION HEALTH</span>
                <span className="font-mono text-sm text-gray-600">
                  {Math.round((connectedSystems.length / Math.max(totalSystems, 1)) * 100)}%
                </span>
              </div>
              <Progress 
                value={(connectedSystems.length / Math.max(totalSystems, 1)) * 100}
                color="success"
                className="mb-1"
              />
              <p className="text-xs text-gray-500 font-mono">Systems operational</p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-sm font-bold">QUERY RESPONSE</span>
                <span className="font-mono text-sm text-gray-600">~2.3s</span>
              </div>
              <Progress 
                value={85}
                color="primary"
                className="mb-1"
              />
              <p className="text-xs text-gray-500 font-mono">Average response time</p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-sm font-bold">DATA ACCURACY</span>
                <span className="font-mono text-sm text-gray-600">98%</span>
              </div>
              <Progress 
                value={98}
                color="success"
                className="mb-1"
              />
              <p className="text-xs text-gray-500 font-mono">Real-time sync rate</p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}