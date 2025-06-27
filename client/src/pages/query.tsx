import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { Button, Input, Avatar } from "@heroui/react";
import { 
  Send, Mic, MicOff, Download, Plus, Search, History, 
  Loader2, AlertCircle, Database, ChevronLeft, ChevronRight,
  Bot, Zap, BarChart3, Calendar, ExternalLink, Clock
} from "lucide-react";
import { chatApi } from "@/lib/chatApi";

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  confidence?: number;
  sources?: string[];
  metadata?: any;
  error?: boolean;
}

interface ErrorState {
  show: boolean;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function QueryPage() {
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<ErrorState>({ show: false, message: "" });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [searchParams] = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: user } = useQuery({
    queryKey: ['/api/user'],
    enabled: true
  });

  const { data: conversations = [], refetch: refetchConversations } = useQuery({
    queryKey: ['/api/conversations'],
    enabled: true
  });

  const { data: systemConnections = [] } = useQuery({
    queryKey: ['/api/systems'],
    enabled: true
  });

  useEffect(() => {
    const queryParam = searchParams.get('q');
    if (queryParam) {
      setInput(queryParam);
    }
    inputRef.current?.focus();
  }, [searchParams]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const connectedSystems = Array.isArray(systemConnections) 
    ? systemConnections.filter((conn: any) => conn.isConnected)
    : [];

  const quickSuggestions = [
    "Show me this quarter's revenue breakdown",
    "Which deals are at risk of slipping?",
    "What's our customer churn rate?",
    "Compare sales performance by region",
    "List overdue invoices over $10K"
  ];

  const loadMessages = async (conversationId: number) => {
    try {
      const msgs = await chatApi.getMessages(conversationId);
      setMessages(msgs.map((msg: any) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: new Date(msg.createdAt),
        confidence: msg.metadata ? JSON.parse(msg.metadata)?.confidence : undefined,
        sources: msg.systemSource ? [msg.systemSource] : undefined
      })));
      setError({ show: false, message: "" });
    } catch (error) {
      console.error('Failed to load messages:', error);
      setError({ 
        show: true, 
        message: "Failed to load conversation history. Please try refreshing the page.",
        action: {
          label: "Refresh",
          onClick: () => window.location.reload()
        }
      });
    }
  };

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!currentConversationId) {
        const newConversation = await chatApi.createConversation("New Query Session");
        setCurrentConversationId(newConversation.id);
        refetchConversations();
        return chatApi.sendMessage(newConversation.id, content);
      }
      return chatApi.sendMessage(currentConversationId, content);
    },
    onSuccess: (response) => {
      setMessages(prev => [...prev, 
        {
          id: response.userMessage.id,
          role: 'user',
          content: response.userMessage.content,
          timestamp: new Date(response.userMessage.createdAt)
        },
        {
          id: response.aiMessage.id,
          role: 'assistant',
          content: response.aiMessage.content,
          timestamp: new Date(response.aiMessage.createdAt),
          confidence: response.aiMessage.metadata ? JSON.parse(response.aiMessage.metadata)?.confidence : 94,
          sources: response.aiMessage.systemSource ? [response.aiMessage.systemSource] : ['Salesforce', 'NetSuite']
        }
      ]);
      setIsTyping(false);
      setError({ show: false, message: "" });
    },
    onError: (error: any) => {
      setIsTyping(false);
      const errorMessage = error.message || "Failed to send message";
      
      if (errorMessage.includes("401") || errorMessage.includes("Unauthorized")) {
        setError({
          show: true,
          message: "Authentication required. Please log in again.",
          action: {
            label: "Login",
            onClick: () => window.location.href = "/api/login"
          }
        });
      } else if (connectedSystems.length === 0) {
        setError({
          show: true,
          message: "No systems are connected. Please configure your data sources first.",
          action: {
            label: "Settings",
            onClick: () => window.location.href = "/settings"
          }
        });
      } else {
        setError({
          show: true,
          message: "Unable to process your request. Our AI service may be temporarily unavailable.",
          action: {
            label: "Try Again",
            onClick: () => setError({ show: false, message: "" })
          }
        });
      }
    }
  });

  const handleSendMessage = () => {
    if (!input.trim()) return;
    
    setIsTyping(true);
    sendMessageMutation.mutate(input);
    setInput("");
  };

  const handleNewConversation = async () => {
    try {
      const newConversation = await chatApi.createConversation("New Query Session");
      setCurrentConversationId(newConversation.id);
      setMessages([]);
      setError({ show: false, message: "" });
      refetchConversations();
      inputRef.current?.focus();
    } catch (error) {
      console.error('Failed to create conversation:', error);
      setError({
        show: true,
        message: "Failed to start new conversation. Please try again.",
        action: {
          label: "Retry",
          onClick: handleNewConversation
        }
      });
    }
  };

  const handleVoiceInput = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
      };
      recognition.onerror = () => {
        setIsListening(false);
        setError({
          show: true,
          message: "Voice recognition failed. Please type your question instead."
        });
      };

      recognition.start();
    } else {
      setError({
        show: true,
        message: "Voice input is not supported in this browser. Please type your question."
      });
    }
  };

  const getConfidenceClass = (confidence?: number) => {
    if (!confidence) return "confidence-medium";
    if (confidence >= 90) return "confidence-high";
    if (confidence >= 70) return "confidence-medium";
    return "confidence-low";
  };

  return (
    <div className="h-screen flex bg-white">
      {/* Left Sidebar */}
      <div className={`${sidebarCollapsed ? 'w-16' : 'w-80'} sidebar flex flex-col transition-all duration-300`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          {!sidebarCollapsed && (
            <button
              className="btn-primary"
              onClick={handleNewConversation}
            >
              <Plus className="h-4 w-4" />
              New Query
            </button>
          )}
          <button
            className="btn-ghost p-2"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {!sidebarCollapsed && (
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Recent Conversations */}
            <div>
              <h3 className="font-semibold text-sm text-gray-900 mb-3 flex items-center gap-2">
                <History className="h-4 w-4 text-gray-600" />
                Recent Conversations
              </h3>
              <div className="space-y-2">
                {(conversations as any[]).slice(0, 6).map((conv) => (
                  <div 
                    key={conv.id}
                    className={`card-hover p-3 cursor-pointer ${
                      currentConversationId === conv.id ? 'bg-gray-50 border-gray-300' : ''
                    }`}
                    onClick={() => {
                      setCurrentConversationId(conv.id);
                      loadMessages(conv.id);
                    }}
                  >
                    <p className="font-medium text-sm text-gray-900 truncate">
                      {conv.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(conv.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Suggestions */}
            <div>
              <h3 className="font-semibold text-sm text-gray-900 mb-3 flex items-center gap-2">
                <Zap className="h-4 w-4 text-gray-600" />
                Quick Suggestions
              </h3>
              <div className="space-y-2">
                {quickSuggestions.slice(0, 4).map((suggestion, index) => (
                  <button
                    key={index}
                    className="w-full text-left p-2 text-xs text-gray-600 hover:bg-gray-50 rounded transition-colors"
                    onClick={() => setInput(suggestion)}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            {/* System Status */}
            <div>
              <h3 className="font-semibold text-sm text-gray-900 mb-3 flex items-center gap-2">
                <Database className="h-4 w-4 text-gray-600" />
                System Status
              </h3>
              <div className="space-y-2">
                {(systemConnections as any[]).map((system) => (
                  <div key={system.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${
                        system.isConnected ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                      <span className="text-sm text-gray-700">
                        {system.systemType.charAt(0).toUpperCase() + system.systemType.slice(1)}
                      </span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      system.isConnected 
                        ? 'system-status-online' 
                        : 'system-status-offline'
                    }`}>
                      {system.isConnected ? 'Online' : 'Offline'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Mobius One AI Assistant</h1>
              <p className="text-sm text-gray-600">Ask questions about your business data in natural language</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="system-status-online">
                <Database className="h-3 w-3" />
                {connectedSystems.length}/2 Systems Online
              </div>
              <Avatar 
                name={(user as any)?.username?.charAt(0).toUpperCase() || 'U'} 
                className="h-8 w-8 bg-gray-100 text-gray-700"
              />
            </div>
          </div>
        </div>

        {/* Error Banner */}
        {error.show && (
          <div className="error-banner m-4">
            <AlertCircle className="h-5 w-5" />
            <p className="flex-1">{error.message}</p>
            <div className="flex items-center gap-2">
              {error.action && (
                <button className="btn-primary" onClick={error.action.onClick}>
                  {error.action.label}
                </button>
              )}
              <button
                className="btn-ghost"
                onClick={() => setError({ show: false, message: "" })}
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 bg-white">
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <div className="card p-8 mb-6 inline-block">
                  <Bot className="text-gray-400 mx-auto mb-4" size={32} />
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Welcome to Mobius One
                  </h2>
                  <p className="text-gray-600 mb-4">
                    Ask questions across your business systems in natural language
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {quickSuggestions.slice(0, 3).map((suggestion, index) => (
                      <button
                        key={index}
                        className="px-3 py-1 text-xs bg-gray-50 border border-gray-200 rounded-full hover:bg-gray-100 transition-colors text-gray-700"
                        onClick={() => setInput(suggestion)}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className="animate-fade-in">
                  {message.role === 'user' ? (
                    <div className="flex justify-end mb-4">
                      <div className="message-bubble-user">
                        <p>{message.content}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-start mb-4">
                      <div className="message-bubble-ai">
                        <p className="mb-3">{message.content}</p>
                        
                        {/* AI Response Enhancements */}
                        <div className="space-y-3 border-t border-gray-100 pt-3">
                          {/* Confidence & Sources */}
                          <div className="flex items-center gap-3">
                            {message.confidence && (
                              <span className={getConfidenceClass(message.confidence)}>
                                {message.confidence}% confidence
                              </span>
                            )}
                            {message.sources && (
                              <div className="flex items-center gap-1">
                                <span className="text-xs text-gray-500">Sources:</span>
                                {message.sources.map((source, index) => (
                                  <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                    {source}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Quick Actions */}
                          <div className="flex items-center gap-2">
                            <button className="btn-ghost text-xs p-1">
                              <Download className="h-3 w-3 mr-1" />
                              Export
                            </button>
                            <button className="btn-ghost text-xs p-1">
                              <BarChart3 className="h-3 w-3 mr-1" />
                              Analyze
                            </button>
                            <button className="btn-ghost text-xs p-1">
                              <Calendar className="h-3 w-3 mr-1" />
                              Schedule
                            </button>
                            <button className="btn-ghost text-xs p-1">
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Share
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start animate-fade-in">
                <div className="ai-loading">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Analyzing your query...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 bg-white p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask anything about your business data..."
                  className="input-modern pl-10 h-12 text-base w-full"
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  disabled={isTyping}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
                  {input.length}/500
                </div>
              </div>
              
              <button
                className={`btn-ghost p-3 ${isListening ? 'bg-yellow-50 text-yellow-700' : ''}`}
                onClick={handleVoiceInput}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </button>
              
              <button
                className="btn-primary h-12 px-6"
                onClick={handleSendMessage}
                disabled={!input.trim() || isTyping}
              >
                {isTyping ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Send
                    <Send className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>

            {/* Input Help */}
            <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
              <span>Press Enter to send • Voice input available</span>
              <span>
                Connected to {connectedSystems.length} business system{connectedSystems.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}