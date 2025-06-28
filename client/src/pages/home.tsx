import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Send, Sparkles, TrendingUp, AlertCircle, MessageSquare, Users, Clock } from "lucide-react";
import { queryClient } from "@/lib/queryClient";

export default function HomePage() {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const { data: user } = useQuery({
    queryKey: ["/api/user"],
    enabled: true
  });

  const { data: conversations = [] } = useQuery({
    queryKey: ["/api/conversations"],
    enabled: true
  });

  const { data: systemConnections = [] } = useQuery({
    queryKey: ["/api/systems"],
    enabled: true
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      // Create new conversation and send message
      const conversation = await queryClient.fetchQuery({
        queryKey: ["/api/conversations"],
        queryFn: async () => {
          const res = await fetch("/api/conversations", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: content.slice(0, 50) + "..." })
          });
          return res.json();
        }
      });

      const res = await fetch(`/api/conversations/${conversation.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content })
      });
      return res.json();
    },
    onSuccess: () => {
      setMessage("");
      setIsTyping(false);
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    }
  });

  const handleSendMessage = () => {
    if (message.trim()) {
      setIsTyping(true);
      sendMessageMutation.mutate(message.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const connectedSystems = Array.isArray(systemConnections) 
    ? systemConnections.filter((s: any) => s.isConnected).length 
    : 0;
  const recentConversations = Array.isArray(conversations) 
    ? conversations.slice(0, 2) 
    : [];

  const suggestedQuestions = [
    "Which customers haven't paid but are using our services?",
    "Show me revenue vs target this quarter",
    "What deals closed but aren't invoiced yet?",
    "Which opportunities are at risk this month?",
    "Show me our cash flow forecast"
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        {/* Welcome Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-light text-foreground mb-3">
            {getGreeting()}, {(user as any)?.username || "there"}
          </h1>
          <p className="text-xl text-muted-foreground font-light">
            What insights do you need from your business?
          </p>
        </div>

        {/* Main Conversation Input */}
        <div className="card p-8 mb-12 relative overflow-hidden">
          {/* Subtle background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-4 right-4">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
          </div>
          
          <div className="relative">
            <textarea
              placeholder="Ask anything about your business..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full resize-none border-0 bg-transparent text-lg leading-relaxed placeholder:text-muted-foreground focus:outline-none min-h-[80px]"
              disabled={sendMessageMutation.isPending}
            />
            
            <div className="flex justify-end mt-4">
              <button
                onClick={handleSendMessage}
                disabled={!message.trim() || sendMessageMutation.isPending}
                className="btn-primary text-lg px-8 py-3 rounded-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:scale-100"
              >
                {sendMessageMutation.isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Thinking...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    Ask AI
                    <Send className="h-5 w-5" />
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Suggested Questions */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-medium text-foreground">Try asking:</h2>
          </div>
          
          <div className="space-y-3">
            {suggestedQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => setMessage(question)}
                className="w-full text-left p-4 rounded-lg border border-border hover:border-primary hover:bg-accent transition-all duration-200 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary opacity-60 group-hover:opacity-100 transition-opacity" />
                  <span className="text-foreground group-hover:text-primary transition-colors">
                    {question}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border mb-12" />

        {/* Recent Insights */}
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Clock className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-medium text-foreground">Recent Insights</h2>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-accent/50 border border-border">
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-foreground mb-1">Revenue Analysis Complete</h3>
                    <p className="text-sm text-muted-foreground mb-2">5 minutes ago</p>
                    <p className="text-sm font-medium text-green-600">18.3% growth identified</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-accent/50 border border-border">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-foreground mb-1">Collections Alert Generated</h3>
                    <p className="text-sm text-muted-foreground mb-2">12 minutes ago</p>
                    <p className="text-sm font-medium text-orange-600">3 high-priority overdue accounts ($450K)</p>
                  </div>
                </div>
              </div>

              {recentConversations.length > 0 && recentConversations.map((conv: any) => (
                <div key={conv.id} className="p-4 rounded-lg bg-accent/50 border border-border">
                  <div className="flex items-start gap-3">
                    <MessageSquare className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h3 className="font-medium text-foreground mb-1">{conv.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-6">
              <Users className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-medium text-foreground">System Status</h2>
            </div>
            
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-foreground font-medium">Connected Systems</span>
                <span className="text-2xl font-semibold text-primary">{connectedSystems}</span>
              </div>
              
              <div className="space-y-3">
                {Array.isArray(systemConnections) && (systemConnections as any[]).map((system: any) => (
                  <div key={system.id} className="flex items-center justify-between">
                    <span className="text-sm text-foreground capitalize">{system.systemType}</span>
                    <div className={`flex items-center gap-2 ${system.isConnected ? 'text-green-600' : 'text-red-600'}`}>
                      <div className={`w-2 h-2 rounded-full ${system.isConnected ? 'bg-green-600' : 'bg-red-600'}`} />
                      <span className="text-xs font-medium">
                        {system.isConnected ? 'Connected' : 'Disconnected'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground text-center">
                  💬 All systems ready for your questions
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}