import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/chat/sidebar";
import ChatArea from "@/components/chat/chat-area";
import type { Conversation, Message, User, SystemConnection } from "@shared/schema";

export default function ChatPage() {
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);

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
        body: JSON.stringify({ title: "New Conversation" }),
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

  return (
    <div className="flex h-screen overflow-hidden bg-sf-bg">
      <Sidebar
        user={user}
        conversations={conversations}
        systemConnections={systemConnections || []}
        currentConversationId={currentConversationId}
        onNewConversation={handleNewConversation}
        onSelectConversation={handleSelectConversation}
      />
      <ChatArea
        conversationId={currentConversationId}
        onConversationUpdate={() => {
          // Refetch conversations to update titles/timestamps
          queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
        }}
      />
    </div>
  );
}
