import { useState } from "react";
import { 
  Button, 
  Card, 
  CardBody, 
  CardHeader,
  Chip,
  ScrollShadow,
  Avatar,
  Divider,
  Badge,
  Tooltip
} from "@heroui/react";
import { 
  Bot, 
  Plus, 
  History, 
  Settings, 
  Database, 
  Zap,
  Monitor,
  Activity,
  Terminal,
  Wifi,
  WifiOff
} from "lucide-react";
import type { User, Conversation, SystemConnection } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

interface RetroSidebarProps {
  user: User | undefined;
  conversations: Conversation[];
  systemConnections: SystemConnection[];
  currentConversationId: number | null;
  onNewConversation: () => void;
  onSelectConversation: (id: number) => void;
}

export default function RetroSidebar({
  user,
  conversations,
  systemConnections,
  currentConversationId,
  onNewConversation,
  onSelectConversation,
}: RetroSidebarProps) {
  const [testingConnections, setTestingConnections] = useState<Set<string>>(new Set());

  const getSalesforceConnection = () => 
    systemConnections.find(conn => conn.systemType === 'salesforce');
  
  const getNetSuiteConnection = () => 
    systemConnections.find(conn => conn.systemType === 'netsuite');

  const testConnection = async (systemType: string) => {
    setTestingConnections(prev => new Set(prev).add(systemType));
    
    try {
      const endpoint = systemType === 'salesforce' ? '/api/salesforce/test' : '/api/netsuite/test';
      const response = await fetch(endpoint, {
        credentials: 'include'
      });
      
      const result = await response.json();
      console.log(`${systemType} test result:`, result);
    } catch (error) {
      console.error(`Error testing ${systemType} connection:`, error);
    } finally {
      setTestingConnections(prev => {
        const newSet = new Set(prev);
        newSet.delete(systemType);
        return newSet;
      });
    }
  };

  const renderSystemCard = (
    connection: SystemConnection | undefined,
    systemType: 'salesforce' | 'netsuite',
    icon: React.ReactNode,
    displayName: string,
    description: string,
    accentColor: string
  ) => {
    const isConnected = connection?.isConnected ?? false;
    const isTesting = testingConnections.has(systemType);
    const lastSync = connection?.lastSync;

    return (
      <Card className="retro-card bg-content2 border-2" key={systemType}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-2">
              <div className={`p-2 rounded-lg ${accentColor}`}>
                {icon}
              </div>
              <div>
                <h4 className="font-mono text-sm font-bold uppercase tracking-wider">
                  {displayName}
                </h4>
                <p className="text-xs text-foreground-500 font-mono">
                  {description}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {isConnected ? (
                <Wifi className="w-4 h-4 text-success-500" />
              ) : (
                <WifiOff className="w-4 h-4 text-danger-500" />
              )}
            </div>
          </div>
        </CardHeader>
        <CardBody className="pt-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Chip 
                size="sm"
                color={isConnected ? "success" : "danger"}
                variant="flat"
                className="font-mono text-xs uppercase"
              >
                {isConnected ? 'ONLINE' : 'OFFLINE'}
              </Chip>
              {isTesting && (
                <Chip 
                  size="sm"
                  color="warning"
                  variant="flat"
                  className="font-mono text-xs animate-pulse"
                >
                  TESTING...
                </Chip>
              )}
            </div>
            <Tooltip content="Test Connection">
              <Button
                size="sm"
                variant="ghost"
                isIconOnly
                onPress={() => testConnection(systemType)}
                isLoading={isTesting}
                className="retro-button"
              >
                <Activity className={`w-3 h-3 ${isTesting ? 'animate-pulse' : ''}`} />
              </Button>
            </Tooltip>
          </div>
          <div className="mt-2">
            <p className="text-xs text-foreground-500 font-mono">
              LAST SYNC: {lastSync ? 
                formatDistanceToNow(new Date(lastSync), { addSuffix: true }).toUpperCase() : 
                'NEVER'
              }
            </p>
          </div>
        </CardBody>
      </Card>
    );
  };

  return (
    <div className="w-80 sidebar-retro flex flex-col h-screen relative z-10">
      {/* Terminal Header */}
      <div className="terminal-header">
        <div className="terminal-dot red"></div>
        <div className="terminal-dot yellow"></div>
        <div className="terminal-dot green"></div>
        <span className="font-mono text-xs text-foreground-600 ml-2">
          BUSINESS_AI_TERMINAL_v2.0
        </span>
      </div>

      {/* Main Header */}
      <div className="p-6 border-b-2 border-primary-300">
        <div className="flex items-center space-x-3">
          <div className="retro-gradient p-3 rounded-lg">
            <Terminal className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-lg font-mono font-bold uppercase tracking-wider glow-text text-primary">
              AI TERMINAL
            </h1>
            <p className="text-sm text-foreground-600 font-mono">
              BUSINESS_SYSTEMS_INTERFACE
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-4">
        <h3 className="text-sm font-mono font-bold text-foreground-700 mb-3 uppercase tracking-wider">
          &gt; QUICK_ACTIONS
        </h3>
        <div className="space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start retro-button font-mono uppercase tracking-wider"
            onPress={onNewConversation}
            startContent={<Plus className="text-primary" size={16} />}
          >
            NEW_SESSION
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start retro-button font-mono uppercase tracking-wider"
            startContent={<History className="text-secondary" size={16} />}
          >
            HISTORY_LOG
          </Button>
        </div>
      </div>

      <Divider className="border-primary-300" />

      {/* System Status */}
      <div className="p-4">
        <h3 className="text-sm font-mono font-bold text-foreground-700 mb-3 uppercase tracking-wider">
          &gt; SYSTEM_STATUS
        </h3>
        <div className="space-y-3">
          {renderSystemCard(
            getSalesforceConnection(),
            'salesforce',
            <Database className="text-white" size={16} />,
            'SALESFORCE',
            'CRM_MODULE',
            'bg-primary-500'
          )}
          
          {renderSystemCard(
            getNetSuiteConnection(),
            'netsuite',
            <Monitor className="text-white" size={16} />,
            'NETSUITE',
            'ERP_MODULE',
            'bg-secondary-500'
          )}
        </div>

        {/* System Summary */}
        <Card className="mt-4 bg-content3 border border-default-300">
          <CardBody className="p-3">
            <div className="flex items-center space-x-2">
              <Zap className="text-warning-500" size={14} />
              <span className="text-xs font-mono font-bold uppercase text-foreground-700">
                SYSTEM_HEALTH
              </span>
            </div>
            <p className="text-xs text-foreground-600 mt-1 font-mono">
              {systemConnections.filter(conn => conn.isConnected).length}/{systemConnections.length} MODULES_ONLINE
            </p>
          </CardBody>
        </Card>
      </div>

      <Divider className="border-primary-300" />

      {/* Session History */}
      <div className="flex-1 p-4">
        <h3 className="text-sm font-mono font-bold text-foreground-700 mb-3 uppercase tracking-wider">
          &gt; SESSION_HISTORY
        </h3>
        <ScrollShadow className="h-full retro-scrollbar">
          <div className="space-y-2">
            {conversations.length === 0 ? (
              <Card className="bg-content2 border border-default-300">
                <CardBody className="text-center py-8">
                  <Terminal className="w-12 h-12 text-default-400 mx-auto mb-2" />
                  <p className="text-sm text-foreground-500 font-mono">NO_SESSIONS_FOUND</p>
                  <p className="text-xs text-foreground-400 font-mono">INITIALIZE_NEW_SESSION</p>
                </CardBody>
              </Card>
            ) : (
              conversations.map((conversation) => (
                <Card
                  key={conversation.id}
                  isPressable
                  onPress={() => onSelectConversation(conversation.id)}
                  className={`transition-all duration-200 cursor-pointer ${
                    currentConversationId === conversation.id 
                      ? 'retro-card bg-primary-100 border-primary-500' 
                      : 'bg-content2 border-default-300 hover:border-primary-400'
                  }`}
                >
                  <CardBody className="p-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-primary-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Bot className="text-white" size={12} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-mono font-medium truncate uppercase tracking-wide">
                          {conversation.title}
                        </p>
                        <p className="text-xs text-foreground-500 mt-1 font-mono">
                          {formatDistanceToNow(new Date(conversation.updatedAt), { addSuffix: true }).toUpperCase()}
                        </p>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))
            )}
          </div>
        </ScrollShadow>
      </div>

      <Divider className="border-primary-300" />

      {/* User Profile */}
      <div className="p-4">
        <Card className="bg-content2 border border-default-300">
          <CardBody className="p-3">
            <div className="flex items-center space-x-3">
              <Badge 
                content="●" 
                color="success" 
                placement="bottom-right"
                className="text-xs"
              >
                <Avatar
                  size="sm"
                  name={user?.initials || "U"}
                  className="bg-primary text-primary-foreground font-mono font-bold"
                />
              </Badge>
              <div className="flex-1">
                <p className="text-sm font-mono font-bold uppercase tracking-wide">
                  {user?.name || "USER"}
                </p>
                <p className="text-xs text-foreground-500 font-mono">
                  {user?.role || "ROLE"}
                </p>
              </div>
              <Tooltip content="Settings">
                <Button
                  variant="ghost"
                  isIconOnly
                  size="sm"
                  className="retro-button"
                >
                  <Settings className="text-foreground-600" size={16} />
                </Button>
              </Tooltip>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}