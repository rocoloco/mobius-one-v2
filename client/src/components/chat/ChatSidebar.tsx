import { Bot, Plus, History, Settings, Database, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import SystemIntegration from "./SystemIntegration";
import type { User, Conversation, SystemConnection } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

interface ChatSidebarProps {
  user: User | undefined;
  conversations: Conversation[];
  systemConnections: SystemConnection[];
  currentConversationId: number | null;
  onNewConversation: () => void;
  onSelectConversation: (id: number) => void;
}

export default function ChatSidebar({
  user,
  conversations,
  systemConnections,
  currentConversationId,
  onNewConversation,
  onSelectConversation,
}: ChatSidebarProps) {
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
            className="w-full justify-start space-x-3 hover:bg-gray-50 transition-colors"
            onClick={onNewConversation}
          >
            <Plus className="text-sf-blue" size={16} />
            <span className="text-sm font-medium">New Conversation</span>
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start space-x-3 hover:bg-gray-50 transition-colors"
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
        <SystemIntegration systemConnections={systemConnections} />
      </div>

      <Separator />

      {/* Recent Conversations */}
      <div className="flex-1 p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Recent Conversations</h3>
        <ScrollArea className="h-full scrollbar-thin">
          <div className="space-y-1">
            {conversations.length === 0 ? (
              <div className="text-center py-8">
                <Bot className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No conversations yet</p>
                <p className="text-xs text-gray-400">Start a new conversation to begin</p>
              </div>
            ) : (
              conversations.map((conversation) => (
                <Card
                  key={conversation.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-sm ${
                    currentConversationId === conversation.id 
                      ? 'ring-2 ring-sf-blue bg-sf-light bg-opacity-10' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => onSelectConversation(conversation.id)}
                >
                  <CardContent className="p-3">
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
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      <Separator />

      {/* User Profile */}
      <div className="p-4">
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarFallback className="bg-sf-blue text-white font-medium">
              {user?.initials || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-sm font-medium text-sf-text">{user?.name || "User"}</p>
            <p className="text-xs text-gray-500">{user?.role || "Role"}</p>
          </div>
          <Button variant="ghost" size="sm" className="hover:bg-gray-100">
            <Settings className="text-gray-400" size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}
