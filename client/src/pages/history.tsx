import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { 
  Search, 
  MessageCircle,
  Clock,
  ArrowRight
} from "lucide-react";
import ProfileMenu from "@/components/layout/ProfileMenu";

export default function HistoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const { data: conversations = [] } = useQuery({
    queryKey: ["/api/conversations"],
    enabled: true
  });

  const { data: user } = useQuery({
    queryKey: ["/api/user"],
    enabled: true
  });

  const filteredConversations = conversations
    .filter((conv: any) => {
      return conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
             conv.preview?.toLowerCase().includes(searchQuery.toLowerCase());
    })
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const getConversationPreview = (conv: any) => {
    return conv.preview || "We discussed business insights and data analysis that can help inform your next decisions.";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${Math.floor(diffInHours)} hours ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleContinueConversation = (conversationId: number) => {
    navigate(`/query?conversation=${conversationId}`);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="min-h-screen" style={{background: 'linear-gradient(180deg, #FAFBFC 0%, rgba(193, 237, 204, 0.02) 100%)', position: 'relative'}}>
      {/* Profile Menu */}
      <div style={{
        position: 'absolute',
        top: '24px',
        right: '24px',
        zIndex: 1000
      }}>
        <ProfileMenu />
      </div>
      
      <div className="max-w-4xl mx-auto px-6 py-12" style={{paddingRight: '120px'}}>
        {/* Conversational Header */}
        <div className="space-y-6 mb-12">
          <h1 className="text-3xl font-brand" style={{color: '#061A40', lineHeight: '1.4'}}>
            {getGreeting()}, {(user as any)?.username || "there"}
          </h1>
          
          <p className="text-lg font-body" style={{color: '#4A5568', lineHeight: '1.6'}}>
            Let's revisit our previous conversations. Pick up where we left off or explore the insights we've discovered together.
          </p>
        </div>

        {/* Search */}
        {conversations.length > 3 && (
          <div className="mb-8">
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5" style={{color: '#718096'}} />
              <input
                type="text"
                placeholder="Search our conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="font-body w-full pl-12 pr-4 py-4 rounded-xl transition-all duration-200"
                style={{
                  background: 'white',
                  border: '2px solid #E2E8F0',
                  fontSize: '16px',
                  color: '#1a202c'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#048BA8';
                  e.target.style.boxShadow = '0 0 0 3px rgba(4, 139, 168, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#E2E8F0';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>
        )}

        {/* Conversation Memory */}
        <div className="space-y-6">
          {filteredConversations.length === 0 ? (
            <div className="text-center py-16">
              <MessageCircle className="w-16 h-16 mx-auto mb-6" style={{color: '#CBD5E0'}} />
              <h3 className="text-xl font-brand mb-3" style={{color: '#061A40'}}>
                Ready for our first conversation?
              </h3>
              <p className="font-body mb-8" style={{color: '#718096', maxWidth: '400px', margin: '0 auto'}}>
                Start a new conversation and we'll explore your business data together. 
                Our discussions will appear here for easy reference.
              </p>
              <button
                onClick={() => navigate('/query')}
                className="px-8 py-4 font-body font-semibold text-white rounded-xl transition-all duration-200"
                style={{
                  background: 'linear-gradient(135deg, #048BA8 0%, #037A96 100%)',
                  transform: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(4, 139, 168, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                Start Our First Conversation
              </button>
            </div>
          ) : (
            <>
              {searchQuery && (
                <p className="font-body text-sm mb-6" style={{color: '#718096'}}>
                  {filteredConversations.length} conversation{filteredConversations.length !== 1 ? 's' : ''} found
                </p>
              )}

              <div className="space-y-4">
                {filteredConversations.map((conversation: any) => (
                  <div
                    key={conversation.id}
                    className="group bg-white rounded-xl p-6 border cursor-pointer transition-all duration-200"
                    style={{
                      border: '1px solid #E2E8F0',
                      transform: 'none'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(4, 139, 168, 0.1)';
                      e.currentTarget.style.borderColor = '#048BA8';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.borderColor = '#E2E8F0';
                    }}
                    onClick={() => handleContinueConversation(conversation.id)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-brand mb-2 pr-4" style={{color: '#061A40', lineHeight: '1.4'}}>
                          {conversation.title}
                        </h3>
                        <div className="flex items-center gap-3 text-sm font-body" style={{color: '#718096'}}>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {formatDate(conversation.updatedAt)}
                          </div>
                        </div>
                      </div>
                      <ArrowRight 
                        className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity duration-200" 
                        style={{color: '#048BA8'}} 
                      />
                    </div>
                    
                    <p className="font-body leading-relaxed" style={{color: '#4A5568', lineHeight: '1.6'}}>
                      {getConversationPreview(conversation)}
                    </p>
                    
                    <div className="mt-4 pt-4" style={{borderTop: '1px solid #F7FAFC'}}>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-body font-medium" 
                            style={{background: 'rgba(4, 139, 168, 0.1)', color: '#048BA8'}}>
                        Continue conversation
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Encouraging Note */}
        {filteredConversations.length > 0 && (
          <div className="mt-12 p-6 rounded-xl" style={{background: 'rgba(193, 237, 204, 0.1)', borderLeft: '4px solid #048BA8'}}>
            <p className="font-body" style={{color: '#061A40', lineHeight: '1.6', margin: 0}}>
              💡 Each conversation builds on our shared understanding of your business. 
              The more we discuss, the more personalized and valuable our insights become.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}