import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { Button, Card, CardBody, Input, Avatar, Chip, Progress, Accordion, AccordionItem } from "@heroui/react";
import { 
  Send, Mic, MicOff, Download, Save, Calendar, BarChart3, Database, 
  AlertCircle, CheckCircle, Clock, Settings, Zap, ArrowDown, ChevronRight, 
  ExternalLink, Plus, Search, History, Loader2, WifiOff, RefreshCw
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
  const [selectedSystems, setSelectedSystems] = useState<string>("all");
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

  // Auto-focus input and handle pre-filled queries
  useEffect(() => {
    const queryParam = searchParams.get('q');
    if (queryParam) {
      setInput(queryParam);
    }
    inputRef.current?.focus();
  }, [searchParams]);

  // Auto-scroll to bottom when new messages arrive
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
          confidence: response.aiMessage.metadata ? JSON.parse(response.aiMessage.metadata)?.confidence : 92,
          sources: response.aiMessage.systemSource ? [response.aiMessage.systemSource] : ['Salesforce', 'NetSuite']
        }
      ]);
      setIsTyping(false);
      setError({ show: false, message: "" });
    },
    onError: (error: any) => {
      setIsTyping(false);
      const errorMessage = error.message || "Failed to send message";
      
      // Check for specific error types
      if (errorMessage.includes("401") || errorMessage.includes("Unauthorized")) {
        setError({
          show: true,
          message: "Authentication required. Please log in again.",
          action: {
            label: "Login",
            onClick: () => window.location.href = "/api/login"
          }
        });
      } else if (errorMessage.includes("network") || errorMessage.includes("fetch")) {
        setError({
          show: true,
          message: "Network connection error. Please check your internet connection.",
          action: {
            label: "Retry",
            onClick: () => sendMessageMutation.mutate(input)
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

  const handleExportChat = () => {
    try {
      const chatData = {
        conversation: messages,
        timestamp: new Date().toISOString(),
        systems: selectedSystems
      };
      const blob = new Blob([JSON.stringify(chatData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chat-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      setError({
        show: true,
        message: "Failed to export chat. Please try again."
      });
    }
  };

  return (
    <div className="h-screen flex bg-gradient-surface">
      {/* Left Sidebar - Collapsible */}
      <div className={`${sidebarCollapsed ? 'w-16' : 'w-80'} bg-white/80 backdrop-blur-sm border-r border-neutral-200 flex flex-col transition-all duration-300`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
          {!sidebarCollapsed && (
            <Button
              className="btn-hover font-sans"
              startContent={<Plus size={16} />}
              onClick={handleNewConversation}
            >
              New Query
            </Button>
          )}
          <Button
            isIconOnly
            variant="flat"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            <ChevronRight className={`transition-transform ${sidebarCollapsed ? '' : 'rotate-180'}`} size={16} />
          </Button>
        </div>

        {!sidebarCollapsed && (
          <div className="flex-1 overflow-y-auto p-4">
            <Accordion variant="light" className="px-0">
              {/* Recent Conversations */}
              <AccordionItem
                key="conversations"
                aria-label="Recent Conversations"
                title={<span className="font-display text-sm">Recent Conversations</span>}
                startContent={<History size={16} />}
              >
                <div className="space-y-2">
                  {(conversations as any[]).slice(0, 8).map((conv) => (
                    <Card 
                      key={conv.id}
                      className={`cursor-pointer card-hover ${
                        currentConversationId === conv.id ? 'border-primary bg-primary/5' : ''
                      }`}
                      onClick={() => {
                        setCurrentConversationId(conv.id);
                        loadMessages(conv.id);
                      }}
                    >
                      <CardBody className="p-3">
                        <p className="font-sans text-sm font-medium text-neutral-900 truncate">
                          {conv.title}
                        </p>
                        <p className="text-xs text-muted">
                          {new Date(conv.updatedAt).toLocaleDateString()}
                        </p>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              </AccordionItem>

              {/* Quick Suggestions */}
              <AccordionItem
                key="suggestions"
                aria-label="Quick Suggestions"
                title={<span className="font-display text-sm">Quick Suggestions</span>}
                startContent={<Zap size={16} />}
              >
                <div className="space-y-2">
                  {quickSuggestions.map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="flat"
                      size="sm"
                      className="w-full justify-start text-left font-sans btn-hover"
                      onClick={() => setInput(suggestion)}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </AccordionItem>

              {/* System Status */}
              <AccordionItem
                key="systems"
                aria-label="System Status"
                title={<span className="font-display text-sm">System Status</span>}
                startContent={<Database size={16} />}
              >
                <div className="space-y-3">
                  {(systemConnections as any[]).map((system) => (
                    <div key={system.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          system.isConnected ? 'bg-success' : 'bg-error'
                        }`}></div>
                        <span className="font-sans text-sm">
                          {system.systemType.charAt(0).toUpperCase() + system.systemType.slice(1)}
                        </span>
                      </div>
                      <Chip 
                        size="sm" 
                        className={`font-sans ${
                          system.isConnected ? 'status-online' : 'status-offline'
                        }`}
                      >
                        {system.isConnected ? 'Online' : 'Offline'}
                      </Chip>
                    </div>
                  ))}
                </div>
              </AccordionItem>
            </Accordion>
          </div>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Error Banner */}
        {error.show && (
          <div className="bg-error/10 border-l-4 border-error p-4 m-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="text-error" size={20} />
                <p className="font-sans text-error font-medium">{error.message}</p>
              </div>
              <div className="flex items-center gap-2">
                {error.action && (
                  <Button
                    size="sm"
                    className="btn-hover font-sans"
                    onClick={error.action.onClick}
                  >
                    {error.action.label}
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="flat"
                  onClick={() => setError({ show: false, message: "" })}
                >
                  Dismiss
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <div className="terminal-glass p-8 mb-6 inline-block">
                  <Zap className="text-terminal-text mx-auto mb-4" size={32} />
                  <h2 className="text-xl font-display text-terminal-text mb-2">
                    MOBIUS ONE AI TERMINAL
                  </h2>
                  <p className="text-terminal-dim font-mono text-sm">
                    Ask questions across your business systems in natural language
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  {quickSuggestions.slice(0, 3).map((suggestion, index) => (
                    <Chip
                      key={index}
                      className="cursor-pointer hover:bg-primary/10 font-sans"
                      onClick={() => setInput(suggestion)}
                    >
                      {suggestion}
                    </Chip>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} fade-in`}
                >
                  <div className={`max-w-3xl ${message.role === 'user' ? 'ml-12' : 'mr-12'}`}>
                    {/* Message Header */}
                    <div className={`flex items-center gap-2 mb-2 ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}>
                      <Avatar
                        size="sm"
                        name={message.role === 'user' ? 'U' : 'M1'}
                        className={message.role === 'user' 
                          ? 'bg-gradient-primary text-white font-mono' 
                          : 'bg-gradient-secondary text-white font-mono'
                        }
                      />
                      <span className="font-display text-sm text-neutral-700">
                        {message.role === 'user' ? 'You' : 'Mobius One'}
                      </span>
                      {message.confidence && (
                        <Chip size="sm" className="status-online font-sans">
                          {message.confidence}% confidence
                        </Chip>
                      )}
                    </div>

                    {/* Message Content */}
                    <Card className={`${
                      message.role === 'user' 
                        ? 'bg-gradient-primary text-white slide-in-right' 
                        : 'card-hover slide-in-left'
                    }`}>
                      <CardBody className="p-4">
                        <p className={`${
                          message.role === 'user' ? 'text-white' : 'text-neutral-800'
                        } leading-relaxed font-sans`}>
                          {message.content}
                        </p>

                        {/* AI Response Enhancements */}
                        {message.role === 'assistant' && (
                          <div className="mt-4 space-y-3">
                            {/* Sources */}
                            {message.sources && (
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-sans font-medium text-neutral-500">Sources:</span>
                                {message.sources.map((source, index) => (
                                  <Chip key={index} size="sm" variant="flat" className="font-sans text-xs">
                                    {source}
                                  </Chip>
                                ))}
                              </div>
                            )}

                            {/* Quick Actions */}
                            <div className="flex items-center gap-2 pt-2 border-t border-neutral-100">
                              <Button size="sm" variant="flat" className="btn-hover font-sans" startContent={<Download size={14} />}>
                                Export
                              </Button>
                              <Button size="sm" variant="flat" className="btn-hover font-sans" startContent={<Save size={14} />}>
                                Save
                              </Button>
                              <Button size="sm" variant="flat" className="btn-hover font-sans" startContent={<Calendar size={14} />}>
                                Schedule
                              </Button>
                              <Button size="sm" variant="flat" className="btn-hover font-sans" startContent={<ExternalLink size={14} />}>
                                Share
                              </Button>
                            </div>
                          </div>
                        )}
                      </CardBody>
                    </Card>

                    {/* Timestamp */}
                    <p className={`text-xs text-neutral-400 font-sans mt-1 ${
                      message.role === 'user' ? 'text-right' : 'text-left'
                    }`}>
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            )}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start fade-in">
                <div className="max-w-3xl mr-12">
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar
                      size="sm"
                      name="M1"
                      className="bg-gradient-secondary text-white font-mono"
                    />
                    <span className="font-display text-sm text-neutral-700">Mobius One</span>
                  </div>
                  <Card className="card-hover">
                    <CardBody className="p-4">
                      <div className="flex items-center gap-3">
                        <Loader2 className="animate-spin text-primary" size={16} />
                        <span className="text-sm text-neutral-600 font-sans">Analyzing your query...</span>
                      </div>
                    </CardBody>
                  </Card>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Enhanced Input Area */}
        <div className="border-t border-neutral-200 bg-white/80 backdrop-blur-sm p-6">
          <div className="max-w-4xl mx-auto">
            {/* System Selector */}
            <div className="flex items-center gap-4 mb-4">
              <span className="font-display text-sm text-neutral-700">Query:</span>
              <div className="flex gap-2">
                <Chip
                  className={`cursor-pointer font-sans transition-all ${
                    selectedSystems === 'all' ? 'status-info' : 'hover:bg-neutral-100'
                  }`}
                  onClick={() => setSelectedSystems('all')}
                >
                  All Systems
                </Chip>
                <Chip
                  className={`cursor-pointer font-sans transition-all ${
                    selectedSystems === 'salesforce' ? 'status-info' : 'hover:bg-neutral-100'
                  }`}
                  onClick={() => setSelectedSystems('salesforce')}
                >
                  Salesforce
                </Chip>
                <Chip
                  className={`cursor-pointer font-sans transition-all ${
                    selectedSystems === 'netsuite' ? 'status-online' : 'hover:bg-neutral-100'
                  }`}
                  onClick={() => setSelectedSystems('netsuite')}
                >
                  NetSuite
                </Chip>
              </div>
            </div>

            {/* Input Field */}
            <div className="flex items-center gap-4">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything about your business data..."
                size="lg"
                classNames={{
                  input: "font-sans text-base",
                  inputWrapper: "bg-white border-2 border-neutral-200 hover:border-primary focus-within:border-primary shadow-lg"
                }}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                endContent={
                  <div className="flex items-center gap-2">
                    <Chip size="sm" className="font-sans text-xs">
                      {input.length}/500
                    </Chip>
                  </div>
                }
              />
              
              <Button
                isIconOnly
                color={isListening ? "warning" : "default"}
                variant="flat"
                onClick={handleVoiceInput}
                className={`min-w-12 btn-hover ${isListening ? 'status-warning' : ''}`}
              >
                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
              </Button>
              
              <Button
                className="btn-hover font-sans min-w-24"
                endContent={<Send size={18} />}
                onClick={handleSendMessage}
                isDisabled={!input.trim() || isTyping}
                isLoading={isTyping}
              >
                Send
              </Button>
            </div>

            {/* Input Help */}
            <div className="flex items-center justify-between mt-2 text-xs text-neutral-500 font-sans">
              <span>Press Enter to send • Voice input available</span>
              <span>
                Complexity: <span className={`font-medium ${
                  input.length > 100 ? 'text-warning' : 
                  input.length > 50 ? 'text-secondary' : 'text-success'
                }`}>
                  {input.length > 100 ? 'High' : input.length > 50 ? 'Medium' : 'Low'}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}