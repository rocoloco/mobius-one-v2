import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Send, Sparkles } from "lucide-react";
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



  const suggestedQuestions = [
    "Show me those overdue accounts",
    "What's driving the revenue growth?",
    "Which deals need immediate attention?",
    "How can I improve cash flow this month?",
    "What opportunities am I missing?"
  ];

  return (
    <div className="min-h-screen warm-gradient">
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Conversational Welcome */}
        <div className="space-y-8 mb-16">
          <h1 className="text-2xl font-medium text-slate-800 leading-relaxed">
            {getGreeting()}, {(user as any)?.username || "there"}
          </h1>
          
          <div className="conversation-gradient backdrop-blur-sm border border-slate-200/60 rounded-2xl p-6 shadow-sm space-y-4 conversation-card">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 ai-pulse"></div>
              <div className="space-y-3 text-slate-700 leading-[1.6]">
                <p className="text-base">I've been analyzing your business data...</p>
                <p className="flex items-center gap-2 text-base">
                  <span>📈</span>
                  <span>I found <strong className="text-emerald-700">18.3% growth</strong> in your revenue this quarter</span>
                </p>
                <p className="flex items-center gap-2 text-base">
                  <span>⚠️</span>
                  <span><strong className="text-primary">3 high-priority overdue accounts</strong> need attention ($450K)</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Input Area */}
        <div className="space-y-8">
          <div className="bg-white/80 border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 relative input-glow">
            <div className="space-y-4">
              <div className="relative">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="What would you like to explore?"
                  className="w-full min-h-[100px] p-4 bg-slate-50/30 border border-slate-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-800 placeholder:text-slate-500 leading-[1.6] text-base transition-all duration-200"
                  disabled={sendMessageMutation.isPending}
                />
                {!message && (
                  <div className="absolute top-4 right-4 transition-opacity duration-300">
                    <div className="w-2 h-2 bg-primary/40 rounded-full ai-pulse"></div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-between items-center">
                {sendMessageMutation.isPending && (
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Sparkles className="w-4 h-4 animate-spin text-primary" />
                    <span>AI is thinking...</span>
                  </div>
                )}
                <div className="flex-1"></div>
                <button
                  onClick={handleSendMessage}
                  disabled={!message.trim() || sendMessageMutation.isPending}
                  className="btn-primary px-8 py-3 bg-primary hover:bg-primary/90 text-white font-medium rounded-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  {sendMessageMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Thinking...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      Ask AI
                      <Send className="h-4 w-4" />
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Dynamic Suggestions */}
          <div className="space-y-4 animate-in fade-in duration-500">
            <h3 className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <span>💡</span>
              <span>You might want to ask:</span>
            </h3>
            <div className="space-y-2">
              {suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => setMessage(question)}
                  className="w-full text-left p-4 bg-white/60 border border-slate-200 rounded-xl hover:bg-primary/5 hover:border-primary/20 transition-all duration-200 text-sm text-slate-700 hover:text-primary group hover:shadow-sm"
                >
                  <span className="group-hover:translate-x-1 transition-transform duration-200 inline-block leading-relaxed">
                    {question}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}