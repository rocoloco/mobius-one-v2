import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bot, Trash2, Download, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import Message from "./message";
import InputArea from "./input-area";
import type { Message as MessageType } from "@shared/schema";

interface ChatAreaProps {
  conversationId: number | null;
  onConversationUpdate: () => void;
}

export default function ChatArea({ conversationId, onConversationUpdate }: ChatAreaProps) {
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Fetch messages for current conversation
  const { data: messages = [], isLoading } = useQuery<MessageType[]>({
    queryKey: ["/api/conversations", conversationId, "messages"],
    enabled: !!conversationId,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      return response.json();
    },
    onMutate: () => {
      setIsTyping(true);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/conversations", conversationId, "messages"] 
      });
      onConversationUpdate();
      setIsTyping(false);
    },
    onError: () => {
      setIsTyping(false);
    },
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMessage = (content: string) => {
    if (!conversationId || !content.trim()) return;
    sendMessageMutation.mutate(content);
  };

  const handleClearChat = () => {
    // TODO: Implement clear chat functionality
    console.log("Clear chat");
  };

  const handleExportChat = () => {
    // TODO: Implement export chat functionality
    console.log("Export chat");
  };

  if (!conversationId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white">
        <div className="text-center">
          <Bot className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-600 mb-2">
            Select a conversation to start chatting
          </h2>
          <p className="text-sm text-gray-500">
            Or create a new conversation to begin
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Chat Header */}
      <div className="p-6 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-sf-blue to-sf-light rounded-lg flex items-center justify-center">
              <Brain className="text-white" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-sf-text">Mobius Business Intelligence</h2>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-sf-success rounded-full animate-pulse" />
                <span className="text-sm text-gray-500">
                  {isTyping ? "Mobius is thinking..." : "Online • Ready to assist"}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearChat}
              className="hover:bg-gray-100"
            >
              <Trash2 className="text-gray-400" size={16} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExportChat}
              className="hover:bg-gray-100"
            >
              <Download className="text-gray-400" size={16} />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <ScrollArea className="flex-1 p-6">
        <div className="space-y-4">
          {/* Welcome Message */}
          {messages.length === 0 && !isLoading && (
            <div className="flex items-start space-x-3 message-ai">
              <div className="w-8 h-8 bg-gradient-to-br from-sf-blue to-sf-light rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="text-white" size={16} />
              </div>
              <div className="flex-1">
                <div className="bg-gray-50 rounded-lg p-4 max-w-2xl">
                  <p className="text-sf-text mb-2">
                    👋 Welcome to Mobius! I'm here to help you get insights from your 
                    Salesforce CRM and NetSuite ERP systems through natural conversation.
                  </p>
                  <p className="text-sm text-gray-600">Try asking me things like:</p>
                  <ul className="text-sm text-gray-600 mt-2 space-y-1">
                    <li>• "Show me my top opportunities this quarter"</li>
                    <li>• "Create a new customer record for Acme Corp"</li>
                    <li>• "What's our revenue trend for the last 6 months?"</li>
                    <li>• "Export customer data to spreadsheet"</li>
                  </ul>
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="text-xs text-gray-400">Mobius</span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-400">Just now</span>
                </div>
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((message) => (
            <Message key={message.id} message={message} />
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-start space-x-3 message-ai">
              <div className="w-8 h-8 bg-gradient-to-br from-sf-blue to-sf-light rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="text-white" size={16} />
              </div>
              <div className="flex-1">
                <div className="bg-gray-50 rounded-lg p-4 max-w-xs">
                  <div className="flex items-center space-x-1">
                    <div className="typing-indicator">
                      <div className="typing-dot" />
                      <div className="typing-dot" />
                      <div className="typing-dot" />
                    </div>
                    <span className="text-sm text-gray-500 ml-2">AI is thinking...</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <InputArea
        onSendMessage={handleSendMessage}
        disabled={sendMessageMutation.isPending || isTyping}
      />
    </div>
  );
}
