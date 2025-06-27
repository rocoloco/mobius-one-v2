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
      {/* iOS-style Terminal Header with retro styling */}
      <div className="terminal-header">
        <div className="terminal-dot red"></div>
        <div className="terminal-dot yellow"></div>
        <div className="terminal-dot green"></div>
        <span className="font-mono text-xs text-foreground-600 ml-2">
          BUSINESS_AI_TERMINAL_v2.0
        </span>
      </div>

      {/* iOS-style Navigation Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="retro-gradient p-2 rounded-lg">
              <Terminal className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-lg font-mono font-bold uppercase tracking-wider glow-text text-primary">
                AI TERMINAL
              </h1>
              <p className="text-xs text-foreground-600 font-mono">
                BUSINESS_SYSTEMS_INTERFACE
              </p>
            </div>
          </div>
          {/* iOS-style user avatar */}
          {user && (
            <Avatar
              size="sm"
              name={user.initials || user.name}
              className="bg-gradient-to-r from-orange-400 to-red-500 text-white font-mono text-xs"
            />
          )}
        </div>
        
        {/* iOS-style primary action */}
        <button
          onClick={onNewConversation}
          className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-mono font-bold text-sm rounded-xl py-3 px-4 transition-all duration-150 active:scale-95 shadow-lg"
          style={{ minHeight: '44px' }}
        >
          <div className="flex items-center justify-center space-x-2">
            <Plus size={16} />
            <span>NEW SESSION</span>
          </div>
        </button>
      </div>

      {/* iOS-style System Status Cards */}
      <div className="p-4">
        <h3 className="text-sm font-mono font-bold text-foreground-700 mb-3 uppercase tracking-wider flex items-center">
          <Activity className="w-4 h-4 mr-2" />
          SYSTEM STATUS
        </h3>
        <div className="space-y-3">
          {/* iOS-style system cards with retro styling */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center">
                    <Database className="text-white" size={12} />
                  </div>
                  <span className="font-mono font-bold text-sm">SALESFORCE</span>
                </div>
                <div className={`system-indicator ${getSalesforceConnection()?.isConnected ? 'connected' : 'disconnected'}`}>
                  {getSalesforceConnection()?.isConnected ? 
                    <><Wifi className="w-3 h-3" /> ONLINE</> : 
                    <><WifiOff className="w-3 h-3" /> OFFLINE</>
                  }
                </div>
              </div>
              <p className="text-xs text-gray-600 font-mono mb-2">CRM MODULE</p>
              <button
                onClick={() => testConnection('salesforce')}
                disabled={testingConnections.has('salesforce')}
                className="w-full py-2 px-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-mono transition-all duration-150 active:scale-95"
                style={{ minHeight: '32px' }}
              >
                {testingConnections.has('salesforce') ? 'TESTING...' : 'TEST CONNECTION'}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-purple-500 rounded-lg flex items-center justify-center">
                    <Monitor className="text-white" size={12} />
                  </div>
                  <span className="font-mono font-bold text-sm">NETSUITE</span>
                </div>
                <div className={`system-indicator ${getNetSuiteConnection()?.isConnected ? 'connected' : 'disconnected'}`}>
                  {getNetSuiteConnection()?.isConnected ? 
                    <><Wifi className="w-3 h-3" /> ONLINE</> : 
                    <><WifiOff className="w-3 h-3" /> OFFLINE</>
                  }
                </div>
              </div>
              <p className="text-xs text-gray-600 font-mono mb-2">ERP MODULE</p>
              <button
                onClick={() => testConnection('netsuite')}
                disabled={testingConnections.has('netsuite')}
                className="w-full py-2 px-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-mono transition-all duration-150 active:scale-95"
                style={{ minHeight: '32px' }}
              >
                {testingConnections.has('netsuite') ? 'TESTING...' : 'TEST CONNECTION'}
              </button>
            </div>
          </div>
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

      {/* iOS-style Session History */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-4 pb-0">
          <h3 className="text-sm font-mono font-bold text-foreground-700 mb-3 uppercase tracking-wider flex items-center">
            <History className="w-4 h-4 mr-2" />
            SESSION HISTORY
          </h3>
        </div>
        
        <div className="flex-1 overflow-hidden px-4">
          {conversations.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center py-8">
                <Terminal className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600 font-mono mb-1">NO SESSIONS FOUND</p>
                <p className="text-xs text-gray-400 font-mono">Tap "NEW SESSION" to start</p>
              </div>
            </div>
          ) : (
            <div className="h-full overflow-y-auto space-y-1 pb-4">
              {conversations.map((conversation, index) => (
                <button
                  key={conversation.id}
                  onClick={() => onSelectConversation(conversation.id)}
                  className={`w-full p-3 rounded-xl text-left transition-all duration-150 active:scale-95 ${
                    currentConversationId === conversation.id 
                      ? 'bg-gradient-to-r from-orange-100 to-red-100 border border-orange-300' 
                      : 'bg-white hover:bg-gray-50 border border-gray-200'
                  }`}
                  style={{ minHeight: '60px' }}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      currentConversationId === conversation.id
                        ? 'bg-gradient-to-r from-orange-500 to-red-500'
                        : 'bg-gray-400'
                    }`}>
                      <Bot className="text-white" size={12} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-mono font-medium truncate">
                        {conversation.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 font-mono">
                        {formatDistanceToNow(new Date(conversation.updatedAt), { addSuffix: true })}
                      </p>
                    </div>
                    {/* iOS-style chevron indicator */}
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full ${
                        currentConversationId === conversation.id ? 'bg-orange-500' : 'bg-gray-300'
                      }`} />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
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