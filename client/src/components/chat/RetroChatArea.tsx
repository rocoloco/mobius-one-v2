import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Button, 
  Card, 
  CardBody, 
  CardHeader,
  ScrollShadow,
  Chip,
  Divider,
  Progress,
  Tooltip
} from "@heroui/react";
import { 
  Bot, 
  Trash2, 
  Download, 
  Terminal, 
  Cpu, 
  Activity,
  Zap,
  Command
} from "lucide-react";
import RetroMessage from "@/components/chat/RetroMessage";
import RetroMessageInput from "@/components/chat/RetroMessageInput";
import type { Message as MessageType } from "@shared/schema";

interface RetroChatAreaProps {
  conversationId: number | null;
  onConversationUpdate: () => void;
}

export default function RetroChatArea({ conversationId, onConversationUpdate }: RetroChatAreaProps) {
  const [isTyping, setIsTyping] = useState(false);
  const [cpuUsage, setCpuUsage] = useState(Math.floor(Math.random() * 30) + 20);
  const [memoryUsage, setMemoryUsage] = useState(Math.floor(Math.random() * 40) + 30);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Simulate system metrics updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCpuUsage(prev => Math.max(10, Math.min(90, prev + (Math.random() - 0.5) * 10)));
      setMemoryUsage(prev => Math.max(20, Math.min(80, prev + (Math.random() - 0.5) * 8)));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

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
    console.log("Clear chat");
  };

  const handleExportChat = () => {
    console.log("Export chat");
  };

  if (!conversationId) {
    return (
      <div className="flex-1 chat-area-retro flex items-center justify-center relative z-10">
        <Card className="terminal-window max-w-md">
          <div className="terminal-header">
            <div className="terminal-dot red"></div>
            <div className="terminal-dot yellow"></div>
            <div className="terminal-dot green"></div>
            <span className="font-mono text-xs text-foreground-600 ml-2">
              AI_TERMINAL_STANDBY
            </span>
          </div>
          <CardBody className="text-center py-12">
            <div className="retro-gradient p-4 rounded-lg inline-block mb-4">
              <Terminal className="w-16 h-16 text-white" />
            </div>
            <h2 className="text-lg font-mono font-bold text-foreground-700 mb-2 uppercase tracking-wider">
              SELECT SESSION TO BEGIN
            </h2>
            <p className="text-sm text-foreground-500 font-mono">
              INITIALIZE_NEW_SESSION_OR_LOAD_EXISTING
            </p>
            <div className="mt-6 space-y-2">
              <div className="flex items-center justify-center space-x-2 text-xs font-mono text-foreground-500">
                <Activity className="w-4 h-4 animate-pulse text-success-500" />
                <span>SYSTEM_READY</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-xs font-mono text-foreground-500">
                <Zap className="w-4 h-4 text-warning-500" />
                <span>AI_MODULES_LOADED</span>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col chat-area-retro relative z-10">
      {/* Terminal-style Header */}
      <Card className="terminal-window rounded-none border-b-2 border-primary-300">
        <div className="terminal-header">
          <div className="terminal-dot red"></div>
          <div className="terminal-dot yellow"></div>
          <div className="terminal-dot green"></div>
          <span className="font-mono text-xs text-foreground-600 ml-2">
            AI_BUSINESS_ASSISTANT_v2.1
          </span>
        </div>
        
        <CardBody className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="retro-gradient p-3 rounded-lg">
                <Cpu className="text-white animate-pulse" size={20} />
              </div>
              <div>
                <h2 className="text-lg font-mono font-bold uppercase tracking-wider glow-text text-primary">
                  AI PROCESSING UNIT
                </h2>
                <div className="flex items-center space-x-4 mt-1">
                  <Chip 
                    size="sm"
                    color={isTyping ? "warning" : "success"}
                    variant="flat"
                    className="font-mono text-xs animate-pulse"
                    startContent={<Activity className="w-3 h-3" />}
                  >
                    {isTyping ? "COMPUTING..." : "READY"}
                  </Chip>
                  <span className="text-xs font-mono text-foreground-500">
                    STATUS: ONLINE • READY_FOR_INPUT
                  </span>
                </div>
              </div>
            </div>
            
            {/* System Metrics */}
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="text-xs font-mono text-foreground-600 mb-1">CPU</div>
                <Progress 
                  size="sm" 
                  value={cpuUsage} 
                  color={cpuUsage > 70 ? "danger" : cpuUsage > 50 ? "warning" : "success"}
                  className="w-20"
                />
                <div className="text-xs font-mono text-foreground-500 mt-1">{cpuUsage}%</div>
              </div>
              <div className="text-center">
                <div className="text-xs font-mono text-foreground-600 mb-1">MEM</div>
                <Progress 
                  size="sm" 
                  value={memoryUsage} 
                  color={memoryUsage > 70 ? "danger" : memoryUsage > 50 ? "warning" : "success"}
                  className="w-20"
                />
                <div className="text-xs font-mono text-foreground-500 mt-1">{memoryUsage}%</div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                <Tooltip content="Clear Session">
                  <Button
                    variant="ghost"
                    size="sm"
                    isIconOnly
                    onPress={handleClearChat}
                    className="retro-button"
                  >
                    <Trash2 className="text-danger-500" size={16} />
                  </Button>
                </Tooltip>
                <Tooltip content="Export Data">
                  <Button
                    variant="ghost"
                    size="sm"
                    isIconOnly
                    onPress={handleExportChat}
                    className="retro-button"
                  >
                    <Download className="text-primary" size={16} />
                  </Button>
                </Tooltip>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Messages Container */}
      <div className="flex-1 relative">
        <ScrollShadow className="h-full p-6 retro-scrollbar">
          <div className="space-y-6">
            {/* Boot-up Message */}
            {messages.length === 0 && !isLoading && (
              <div className="fade-in-up">
                <Card className="retro-card max-w-2xl">
                  <CardHeader className="pb-2">
                    <div className="flex items-center space-x-3">
                      <div className="retro-gradient p-2 rounded-lg">
                        <Bot className="text-white" size={16} />
                      </div>
                      <div>
                        <h4 className="font-mono font-bold text-sm uppercase tracking-wider">
                          SYSTEM_INITIALIZATION
                        </h4>
                        <p className="text-xs text-foreground-500 font-mono">
                          AI_ASSISTANT_READY
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardBody>
                    <div className="space-y-4">
                      <div className="font-mono text-sm">
                        <div className="text-success-500 mb-2">
                          &gt; BUSINESS_AI_ASSISTANT_v2.1_LOADED
                        </div>
                        <div className="text-primary mb-2">
                          &gt; SALESFORCE_CRM_MODULE_CONNECTED
                        </div>
                        <div className="text-secondary mb-2">
                          &gt; NETSUITE_ERP_MODULE_CONNECTED
                        </div>
                        <div className="text-warning-500 mb-4">
                          &gt; READY_FOR_BUSINESS_QUERIES
                        </div>
                      </div>
                      
                      <Divider />
                      
                      <div>
                        <p className="text-sm text-foreground-700 mb-3 font-mono">
                          AVAILABLE_COMMANDS:
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono">
                          <div className="flex items-center space-x-2">
                            <Command className="w-3 h-3 text-primary" />
                            <span>"Show opportunities this quarter"</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Command className="w-3 h-3 text-secondary" />
                            <span>"Revenue trend analysis"</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Command className="w-3 h-3 text-success" />
                            <span>"Create customer record"</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Command className="w-3 h-3 text-warning" />
                            <span>"Export system data"</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
                
                <div className="flex items-center space-x-2 mt-3 ml-4">
                  <Chip size="sm" variant="flat" className="font-mono text-xs">
                    SYSTEM_READY
                  </Chip>
                  <span className="text-xs text-foreground-500 font-mono">
                    INITIALIZED_AT: {new Date().toLocaleTimeString()}
                  </span>
                </div>
              </div>
            )}

            {/* Messages */}
            {messages.map((message) => (
              <RetroMessage key={message.id} message={message} />
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="fade-in-up">
                <Card className="retro-card max-w-xs">
                  <CardBody className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="retro-gradient p-2 rounded-lg animate-pulse">
                        <Bot className="text-white" size={16} />
                      </div>
                      <div className="flex-1">
                        <div className="typing-animation mb-2">
                          <div className="typing-dot bg-primary"></div>
                          <div className="typing-dot bg-secondary"></div>
                          <div className="typing-dot bg-success"></div>
                        </div>
                        <span className="text-xs font-mono text-foreground-500">
                          AI_PROCESSING_REQUEST...
                        </span>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollShadow>
      </div>

      {/* Input Area */}
      <RetroMessageInput
        onSendMessage={handleSendMessage}
        disabled={sendMessageMutation.isPending || isTyping}
      />
    </div>
  );
}