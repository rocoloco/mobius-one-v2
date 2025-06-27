import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { chatApi } from "@/lib/chatApi";
import RetroChatArea from "@/components/chat/RetroChatArea";
import RetroSidebar from "@/components/chat/RetroSidebar";

export default function QueryPage() {
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);
  const [conversationUpdateTrigger, setConversationUpdateTrigger] = useState(0);
  const [searchParams] = useSearchParams();

  const { data: user } = useQuery({
    queryKey: ['/api/user'],
    enabled: true
  });

  const { data: conversations = [], refetch: refetchConversations } = useQuery({
    queryKey: ['/api/conversations', conversationUpdateTrigger],
    enabled: true
  });

  const { data: systemConnections = [] } = useQuery({
    queryKey: ['/api/systems'],
    enabled: true
  });

  // Handle URL parameters for conversation selection or pre-filled queries
  useEffect(() => {
    const conversationParam = searchParams.get('conversation');
    const queryParam = searchParams.get('q');
    
    if (conversationParam) {
      const convId = parseInt(conversationParam);
      if (!isNaN(convId)) {
        setCurrentConversationId(convId);
      }
    }
    
    // TODO: Handle pre-filled query parameter if needed
  }, [searchParams]);

  const handleNewConversation = async () => {
    try {
      const newConversation = await chatApi.createConversation("New Chat Session");
      setCurrentConversationId(newConversation.id);
      triggerConversationUpdate();
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };

  const handleSelectConversation = (id: number) => {
    setCurrentConversationId(id);
  };

  const triggerConversationUpdate = () => {
    setConversationUpdateTrigger(prev => prev + 1);
    refetchConversations();
  };

  return (
    <div className="h-full flex">
      {/* Chat Sidebar */}
      <div className="w-80 flex-shrink-0 border-r border-gray-200 bg-white">
        <RetroSidebar
          user={user as any}
          conversations={conversations as any}
          systemConnections={systemConnections as any}
          currentConversationId={currentConversationId}
          onNewConversation={handleNewConversation}
          onSelectConversation={handleSelectConversation}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-gradient-to-br from-orange-50 to-red-50">
        <RetroChatArea
          conversationId={currentConversationId}
          onConversationUpdate={triggerConversationUpdate}
        />
      </div>
    </div>
  );
}