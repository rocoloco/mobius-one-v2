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
          <h1 className="text-2xl font-brand leading-relaxed" style={{color: '#061A40'}}>
            {getGreeting()}, {(user as any)?.username || "there"}
          </h1>
          
          <div className="rounded-lg p-4 mb-6" style={{
            background: 'rgba(193, 237, 204, 0.1)',
            borderLeft: '4px solid #048BA8',
            borderRadius: '0 8px 8px 0'
          }}>
            <p className="font-body" style={{color: '#061A40', margin: 0, lineHeight: '1.6'}}>
              I've analyzed your latest business data and found 18.3% revenue growth this quarter. 
              I also noticed 3 high-priority accounts that need attention.
            </p>
          </div>
          
          <p className="font-body" style={{color: '#4A5568', fontSize: '16px', marginBottom: '32px'}}>
            What would you like to explore?
          </p>
        </div>

        {/* Main Input Area */}
        <div className="space-y-8">
          <div className="rounded-xl p-5 shadow-sm transition-all duration-300" style={{
            background: 'white',
            border: '2px solid #E2E8F0',
            borderRadius: '12px'
          }}>
            <div className="space-y-4">
              <div className="relative">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask anything about your business..."
                  className="w-full min-h-[100px] p-4 resize-none transition-all duration-200"
                  style={{
                    background: 'white',
                    border: '2px solid #E2E8F0',
                    borderRadius: '12px',
                    fontSize: '16px',
                    color: '#4A5568',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#048BA8';
                    e.target.style.boxShadow = '0 0 0 3px rgba(4, 139, 168, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#E2E8F0';
                    e.target.style.boxShadow = 'none';
                  }}
                  disabled={sendMessageMutation.isPending}
                />
              </div>
              
              <div className="flex justify-between items-center">
                {sendMessageMutation.isPending && (
                  <div className="flex items-center gap-2 text-sm" style={{color: '#718096'}}>
                    <Sparkles className="w-4 h-4 animate-spin" style={{color: '#048BA8'}} />
                    <span>AI is thinking...</span>
                  </div>
                )}
                <div className="flex-1"></div>
                <button
                  onClick={handleSendMessage}
                  disabled={!message.trim() || sendMessageMutation.isPending}
                  className="px-6 py-3 text-white font-body font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: 'linear-gradient(135deg, #048BA8 0%, #037A96 100%)',
                    border: 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (!e.currentTarget.disabled) {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(4, 139, 168, 0.3)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
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
            <h3 className="text-sm font-body font-semibold flex items-center gap-2" style={{color: '#048BA8'}}>
              <span>💡</span>
              <span>You might want to ask:</span>
            </h3>
            <div className="space-y-2">
              {suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => setMessage(question)}
                  className="w-full text-left p-3 rounded-lg transition-all duration-200 group"
                  style={{
                    color: '#4A5568',
                    borderLeft: '3px solid #048BA8',
                    background: 'rgba(4, 139, 168, 0.05)',
                    borderRadius: '0 8px 8px 0'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(4, 139, 168, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(4, 139, 168, 0.05)';
                  }}
                >
                  <span className="font-body group-hover:translate-x-1 transition-transform duration-200 inline-block leading-relaxed">
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