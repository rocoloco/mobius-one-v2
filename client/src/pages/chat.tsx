import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import RetroSidebar from "@/components/chat/RetroSidebar";
import RetroChatArea from "@/components/chat/RetroChatArea";
import type { Conversation, User, SystemConnection } from "@shared/schema";

export default function ChatPage() {
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const queryClient = useQueryClient();

  // Fetch user data
  const { data: user } = useQuery<User>({
    queryKey: ["/api/user"],
  });

  // Fetch conversations
  const { data: conversationsData } = useQuery<Conversation[]>({
    queryKey: ["/api/conversations"],
  });

  // Fetch system connections
  const { data: systemConnections } = useQuery<SystemConnection[]>({
    queryKey: ["/api/systems"],
  });

  useEffect(() => {
    if (conversationsData) {
      setConversations(conversationsData);
      if (!currentConversationId && conversationsData.length > 0) {
        setCurrentConversationId(conversationsData[0].id);
      }
    }
  }, [conversationsData, currentConversationId]);

  const handleNewConversation = async () => {
    try {
      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "New Session" }),
        credentials: "include",
      });

      if (response.ok) {
        const newConversation = await response.json();
        setConversations(prev => [newConversation, ...prev]);
        setCurrentConversationId(newConversation.id);
      }
    } catch (error) {
      console.error("Failed to create conversation:", error);
    }
  };

  const handleSelectConversation = (conversationId: number) => {
    setCurrentConversationId(conversationId);
  };

  const handleConversationUpdate = () => {
    // Refetch conversations to update titles/timestamps
    queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
  };

  return (
    <div className="flex h-screen overflow-hidden crt-effect">
      <RetroSidebar
        user={user}
        conversations={conversations}
        systemConnections={systemConnections || []}
        currentConversationId={currentConversationId}
        onNewConversation={handleNewConversation}
        onSelectConversation={handleSelectConversation}
      />
      <RetroChatArea
        conversationId={currentConversationId}
        onConversationUpdate={handleConversationUpdate}
      />
    </div>
  );
}
