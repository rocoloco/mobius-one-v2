import { Bot, Plus, History, Settings, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import type { User, Conversation, SystemConnection } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

interface SidebarProps {
  user: User | undefined;
  conversations: Conversation[];
  systemConnections: SystemConnection[];
  currentConversationId: number | null;
  onNewConversation: () => void;
  onSelectConversation: (id: number) => void;
}

export default function Sidebar({
  user,
  conversations,
  systemConnections,
  currentConversationId,
  onNewConversation,
  onSelectConversation,
}: SidebarProps) {
  const getSalesforceConnection = () => 
    systemConnections.find(conn => conn.systemType === 'salesforce');
  
  const getNetSuiteConnection = () => 
    systemConnections.find(conn => conn.systemType === 'netsuite');

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-sf-blue rounded-lg flex items-center justify-center">
            <Bot className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-sf-text">Business AI Assistant</h1>
            <p className="text-sm text-gray-500">Enterprise Chat Platform</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h3>
        <div className="space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start space-x-3 hover:bg-gray-50"
            onClick={onNewConversation}
          >
            <Plus className="text-sf-blue" size={16} />
            <span className="text-sm font-medium">New Conversation</span>
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start space-x-3 hover:bg-gray-50"
          >
            <History className="text-gray-600" size={16} />
            <span className="text-sm">Chat History</span>
          </Button>
        </div>
      </div>

      <Separator />

      {/* System Integrations */}
      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">System Integrations</h3>
        <div className="space-y-2">
          {/* Salesforce Integration */}
          <div className="p-3 rounded-lg border border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Database className="text-sf-blue" size={16} />
                <span className="text-sm font-medium">Salesforce CRM</span>
              </div>
              <div className={`w-2 h-2 rounded-full ${
                getSalesforceConnection()?.isConnected ? 'bg-sf-success' : 'bg-red-500'
              }`} />
            </div>
            <p className="text-xs text-gray-600">
              {getSalesforceConnection()?.isConnected ? 'Connected' : 'Disconnected'} • 
              Last sync: {getSalesforceConnection()?.lastSync ? 
                formatDistanceToNow(new Date(getSalesforceConnection()!.lastSync), { addSuffix: true }) : 
                'Never'
              }
            </p>
          </div>

          {/* NetSuite Integration */}
          <div className="p-3 rounded-lg border border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Database className="text-blue-600" size={16} />
                <span className="text-sm font-medium">NetSuite ERP</span>
              </div>
              <div className={`w-2 h-2 rounded-full ${
                getNetSuiteConnection()?.isConnected ? 'bg-sf-success' : 'bg-red-500'
              }`} />
            </div>
            <p className="text-xs text-gray-600">
              {getNetSuiteConnection()?.isConnected ? 'Connected' : 'Disconnected'} • 
              Last sync: {getNetSuiteConnection()?.lastSync ? 
                formatDistanceToNow(new Date(getNetSuiteConnection()!.lastSync), { addSuffix: true }) : 
                'Never'
              }
            </p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Recent Conversations */}
      <div className="flex-1 p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Recent Conversations</h3>
        <ScrollArea className="h-full">
          <div className="space-y-1">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  currentConversationId === conversation.id 
                    ? 'bg-sf-light bg-opacity-20 border border-sf-light' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => onSelectConversation(conversation.id)}
              >
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-sf-light rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="text-white" size={12} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-sf-text truncate">
                      {conversation.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDistanceToNow(new Date(conversation.updatedAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      <Separator />

      {/* User Profile */}
      <div className="p-4">
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarFallback className="bg-sf-blue text-white">
              {user?.initials || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-sm font-medium">{user?.name || "User"}</p>
            <p className="text-xs text-gray-500">{user?.role || "Role"}</p>
          </div>
          <Button variant="ghost" size="sm">
            <Settings className="text-gray-400" size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}
