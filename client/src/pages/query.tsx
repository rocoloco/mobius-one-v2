import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { Button, Card, CardBody, Input, Avatar, Chip, Divider, Select, SelectItem, Progress, Tooltip } from "@heroui/react";
import { Send, Mic, MicOff, Download, Save, Calendar, BarChart3, Database, AlertCircle, CheckCircle, Clock, Filter, TrendingUp, Users, DollarSign, Plus, Search, Settings, Zap, ArrowDown, ChevronRight, ExternalLink } from "lucide-react";
import { chatApi } from "@/lib/chatApi";

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  confidence?: number;
  sources?: string[];
  metadata?: any;
}

export default function QueryPage() {
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [selectedSystems, setSelectedSystems] = useState<string>("all");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [searchParams] = useSearchParams();

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

  // Sample suggestions based on available data
  const quickSuggestions = [
    "Show me this month's sales pipeline",
    "Which customers have overdue payments?",
    "Compare Q4 revenue vs last year",
    "Top performing sales reps this quarter",
    "What deals are at risk of slipping?",
    "List all open opportunities above $50K"
  ];

  const queryTemplates = [
    { label: "Show me...", value: "Show me " },
    { label: "Which customers...", value: "Which customers " },
    { label: "What is...", value: "What is " },
    { label: "Compare...", value: "Compare " },
    { label: "List all...", value: "List all " }
  ];

  const connectedSystems = Array.isArray(systemConnections) 
    ? systemConnections.filter((conn: any) => conn.isConnected)
    : [];

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle URL parameters
  useEffect(() => {
    const conversationParam = searchParams.get('conversation');
    if (conversationParam) {
      const convId = parseInt(conversationParam);
      if (!isNaN(convId)) {
        setCurrentConversationId(convId);
        loadMessages(convId);
      }
    }
  }, [searchParams]);

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
    } catch (error) {
      console.error('Failed to load messages:', error);
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
          confidence: response.aiMessage.metadata ? JSON.parse(response.aiMessage.metadata)?.confidence : 85,
          sources: response.aiMessage.systemSource ? [response.aiMessage.systemSource] : ['Salesforce', 'NetSuite']
        }
      ]);
      setIsTyping(false);
    },
    onError: () => {
      setIsTyping(false);
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
      refetchConversations();
    } catch (error) {
      console.error('Failed to create conversation:', error);
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

      recognition.start();
    } else {
      alert('Voice recognition not supported in this browser');
    }
  };

  const handleExportChat = () => {
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
  };

  return (
    <div className="h-screen flex bg-gradient-to-br from-orange-50 to-red-50">
      {/* Left Sidebar - Recent Queries & Quick Actions */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <Button
            color="primary"
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-mono font-bold"
            startContent={<Plus size={16} />}
            onClick={handleNewConversation}
          >
            NEW QUERY SESSION
          </Button>
        </div>

        {/* Recent Conversations */}
        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="font-mono font-bold text-sm text-gray-700 mb-3">RECENT QUERIES</h3>
          <div className="space-y-2">
            {(conversations as any[]).slice(0, 10).map((conv) => (
              <Card 
                key={conv.id}
                className={`cursor-pointer transition-colors hover:bg-orange-50 ${
                  currentConversationId === conv.id ? 'bg-orange-100 border-orange-300' : ''
                }`}
                onClick={() => {
                  setCurrentConversationId(conv.id);
                  loadMessages(conv.id);
                }}
              >
                <CardBody className="p-3">
                  <p className="font-mono text-sm font-bold text-gray-900 truncate">
                    {conv.title}
                  </p>
                  <p className="text-xs text-gray-500 font-mono">
                    {new Date(conv.updatedAt).toLocaleDateString()}
                  </p>
                </CardBody>
              </Card>
            ))}
          </div>

          {/* Quick Suggestions */}
          <div className="mt-6">
            <h3 className="font-mono font-bold text-sm text-gray-700 mb-3">QUICK ACTIONS</h3>
            <div className="space-y-2">
              {quickSuggestions.slice(0, 6).map((suggestion, index) => (
                <Button
                  key={index}
                  variant="flat"
                  size="sm"
                  className="w-full justify-start text-left font-mono text-xs"
                  onClick={() => setInput(suggestion)}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <Zap className="text-white" size={24} />
                </div>
                <h2 className="text-2xl font-mono font-bold text-gray-900 mb-2">
                  MOBIUS ONE AI TERMINAL
                </h2>
                <p className="text-gray-600 font-mono">
                  Ask questions across your business systems in natural language
                </p>
                <div className="flex flex-wrap gap-2 mt-6 justify-center">
                  {quickSuggestions.slice(0, 3).map((suggestion, index) => (
                    <Chip
                      key={index}
                      className="cursor-pointer hover:bg-orange-100 font-mono"
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
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-3xl ${message.role === 'user' ? 'ml-12' : 'mr-12'}`}>
                    {/* Message Header */}
                    <div className={`flex items-center space-x-2 mb-2 ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}>
                      <Avatar
                        size="sm"
                        name={message.role === 'user' ? 'U' : 'M1'}
                        className={message.role === 'user' 
                          ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white font-mono' 
                          : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white font-mono'
                        }
                      />
                      <span className="font-mono font-bold text-sm text-gray-700">
                        {message.role === 'user' ? 'YOU' : 'MOBIUS ONE'}
                      </span>
                      {message.confidence && (
                        <Chip size="sm" color="success" variant="flat" className="font-mono">
                          {message.confidence}% CONFIDENCE
                        </Chip>
                      )}
                    </div>

                    {/* Message Content */}
                    <Card className={`${
                      message.role === 'user' 
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white' 
                        : 'bg-white border border-gray-200'
                    }`}>
                      <CardBody className="p-4">
                        <p className={`${
                          message.role === 'user' ? 'text-white' : 'text-gray-800'
                        } leading-relaxed`}>
                          {message.content}
                        </p>

                        {/* AI Response Enhancements */}
                        {message.role === 'assistant' && (
                          <div className="mt-4 space-y-3">
                            {/* Sources */}
                            {message.sources && (
                              <div className="flex items-center space-x-2">
                                <span className="text-xs font-mono font-bold text-gray-500">SOURCES:</span>
                                {message.sources.map((source, index) => (
                                  <Chip key={index} size="sm" variant="flat" className="font-mono text-xs">
                                    {source}
                                  </Chip>
                                ))}
                              </div>
                            )}

                            {/* Quick Actions */}
                            <div className="flex items-center space-x-2 pt-2 border-t border-gray-100">
                              <Button size="sm" variant="flat" startContent={<Download size={14} />}>
                                Export
                              </Button>
                              <Button size="sm" variant="flat" startContent={<Save size={14} />}>
                                Save
                              </Button>
                              <Button size="sm" variant="flat" startContent={<Calendar size={14} />}>
                                Schedule
                              </Button>
                              <Button size="sm" variant="flat" startContent={<ExternalLink size={14} />}>
                                Share
                              </Button>
                            </div>
                          </div>
                        )}
                      </CardBody>
                    </Card>

                    {/* Timestamp */}
                    <p className={`text-xs text-gray-500 font-mono mt-1 ${
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
              <div className="flex justify-start">
                <div className="max-w-3xl mr-12">
                  <div className="flex items-center space-x-2 mb-2">
                    <Avatar
                      size="sm"
                      name="M1"
                      className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-mono"
                    />
                    <span className="font-mono font-bold text-sm text-gray-700">MOBIUS ONE</span>
                  </div>
                  <Card className="bg-white border border-gray-200">
                    <CardBody className="p-4">
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-sm text-gray-500 font-mono">Analyzing your query...</span>
                      </div>
                    </CardBody>
                  </Card>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Smart Input Area */}
        <div className="border-t border-gray-200 bg-white p-6">
          <div className="max-w-4xl mx-auto">
            {/* System Selector */}
            <div className="flex items-center space-x-4 mb-4">
              <span className="font-mono font-bold text-sm text-gray-700">QUERY:</span>
              <div className="flex space-x-2">
                <Chip
                  className={`cursor-pointer font-mono ${
                    selectedSystems === 'all' ? 'bg-orange-100 text-orange-800' : ''
                  }`}
                  onClick={() => setSelectedSystems('all')}
                >
                  All Systems
                </Chip>
                <Chip
                  className={`cursor-pointer font-mono ${
                    selectedSystems === 'salesforce' ? 'bg-blue-100 text-blue-800' : ''
                  }`}
                  onClick={() => setSelectedSystems('salesforce')}
                >
                  Salesforce
                </Chip>
                <Chip
                  className={`cursor-pointer font-mono ${
                    selectedSystems === 'netsuite' ? 'bg-green-100 text-green-800' : ''
                  }`}
                  onClick={() => setSelectedSystems('netsuite')}
                >
                  NetSuite
                </Chip>
              </div>
            </div>

            {/* Query Templates */}
            <div className="flex items-center space-x-2 mb-4">
              <span className="font-mono font-bold text-xs text-gray-500">TEMPLATES:</span>
              {queryTemplates.map((template) => (
                <Chip
                  key={template.value}
                  size="sm"
                  className="cursor-pointer hover:bg-orange-100 font-mono"
                  onClick={() => setInput(template.value)}
                >
                  {template.label}
                </Chip>
              ))}
            </div>

            {/* Input Field */}
            <div className="flex items-center space-x-4">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything about your business data..."
                size="lg"
                classNames={{
                  input: "font-mono",
                  inputWrapper: "bg-gray-50 border-2 border-gray-200 hover:border-orange-300 focus-within:border-orange-500"
                }}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                endContent={
                  <div className="flex items-center space-x-2">
                    <Chip size="sm" className="font-mono text-xs">
                      {input.length}/500
                    </Chip>
                  </div>
                }
              />
              
              <Button
                isIconOnly
                color={isListening ? "danger" : "default"}
                variant="flat"
                onClick={handleVoiceInput}
                className="min-w-12"
              >
                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
              </Button>
              
              <Button
                color="primary"
                className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-mono font-bold min-w-24"
                endContent={<Send size={18} />}
                onClick={handleSendMessage}
                isDisabled={!input.trim() || isTyping}
              >
                SEND
              </Button>
            </div>

            {/* Input Help */}
            <div className="flex items-center justify-between mt-2 text-xs text-gray-500 font-mono">
              <span>Press Enter to send • Voice input available</span>
              <span>Complexity: {input.length > 100 ? 'High' : input.length > 50 ? 'Medium' : 'Low'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar - System Status & Metrics */}
      <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-mono font-bold text-gray-900">SYSTEM STATUS</h2>
        </div>

        {/* System Connections */}
        <div className="p-4 space-y-4">
          <div className="space-y-3">
            {connectedSystems.map((system: any) => (
              <Card key={system.id} className="border border-gray-200">
                <CardBody className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono font-bold text-sm">{system.systemType.toUpperCase()}</span>
                    <Chip size="sm" color="success" variant="flat" className="font-mono">
                      ONLINE
                    </Chip>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-600">
                    <Clock size={12} />
                    <span className="font-mono">Last sync: 2 mins ago</span>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="pt-4 border-t border-gray-200">
            <h3 className="font-mono font-bold text-sm text-gray-700 mb-3">QUICK ACTIONS</h3>
            <div className="space-y-2">
              <Button
                size="sm"
                variant="flat"
                className="w-full justify-start font-mono"
                startContent={<Download size={14} />}
                onClick={handleExportChat}
              >
                Export Chat
              </Button>
              <Button
                size="sm"
                variant="flat"
                className="w-full justify-start font-mono"
                startContent={<BarChart3 size={14} />}
              >
                View Analytics
              </Button>
              <Button
                size="sm"
                variant="flat"
                className="w-full justify-start font-mono"
                startContent={<Settings size={14} />}
              >
                System Settings
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}