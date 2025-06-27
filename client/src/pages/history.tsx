import { useState } from "react";
import { Card, CardBody, CardHeader, Button, Input, Chip, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/react";
import { 
  History as HistoryIcon, 
  Search, 
  Filter, 
  Download, 
  Trash2,
  Bot,
  Calendar,
  Database,
  MoreVertical,
  Eye,
  Archive
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { chatApi } from "@/lib/chatApi";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export default function HistoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ['/api/conversations'],
    enabled: true
  });

  const deleteConversationMutation = useMutation({
    mutationFn: chatApi.deleteConversation,
    onSuccess: () => {
      toast({
        title: "Session Deleted",
        description: "Chat session has been deleted successfully"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete chat session",
        variant: "destructive"
      });
    }
  });

  const exportConversationMutation = useMutation({
    mutationFn: ({ id, format }: { id: number; format: 'json' | 'csv' | 'pdf' }) => 
      chatApi.exportConversation(id, format),
    onSuccess: (blob, { format }) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `conversation-export.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Export Complete",
        description: `Session exported as ${format.toUpperCase()}`
      });
    },
    onError: () => {
      toast({
        title: "Export Failed",
        description: "Failed to export chat session",
        variant: "destructive"
      });
    }
  });

  const filteredConversations = conversations.filter((conv: any) => {
    const matchesSearch = conv.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === "all" || 
      (selectedFilter === "recent" && new Date(conv.updatedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) ||
      (selectedFilter === "archived" && conv.archived);
    
    return matchesSearch && matchesFilter;
  });

  const handleViewConversation = (id: number) => {
    navigate(`/query?conversation=${id}`);
  };

  const handleDeleteConversation = (id: number) => {
    if (confirm("Are you sure you want to delete this chat session?")) {
      deleteConversationMutation.mutate(id);
    }
  };

  const handleExportConversation = (id: number, format: 'json' | 'csv' | 'pdf') => {
    exportConversationMutation.mutate({ id, format });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
            <HistoryIcon className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-3xl font-mono font-bold text-gray-900">
              SESSION HISTORY
            </h1>
            <p className="text-gray-600 font-mono">
              {filteredConversations.length} sessions found
            </p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="bordered"
            className="font-mono"
            startContent={<Download size={16} />}
            onClick={() => chatApi.exportAllConversations('json')}
          >
            EXPORT ALL
          </Button>
          <Button
            color="primary"
            className="font-mono"
            onClick={() => navigate('/query')}
          >
            NEW SESSION
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="bg-white border border-gray-200">
        <CardBody className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search sessions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                startContent={<Search size={16} />}
                className="font-mono"
              />
            </div>
            <div className="flex space-x-3">
              <Dropdown>
                <DropdownTrigger>
                  <Button
                    variant="bordered"
                    className="font-mono"
                    startContent={<Filter size={16} />}
                  >
                    {selectedFilter.toUpperCase()}
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  onAction={(key) => setSelectedFilter(key as string)}
                  className="font-mono"
                >
                  <DropdownItem key="all">ALL SESSIONS</DropdownItem>
                  <DropdownItem key="recent">RECENT (7 DAYS)</DropdownItem>
                  <DropdownItem key="archived">ARCHIVED</DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Sessions List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <Card key={i} className="bg-white border border-gray-200">
                <CardBody className="p-4">
                  <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        ) : filteredConversations.length === 0 ? (
          <Card className="bg-white border border-gray-200">
            <CardBody className="text-center py-12">
              <HistoryIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="font-mono font-bold text-lg text-gray-600 mb-2">
                NO SESSIONS FOUND
              </h3>
              <p className="text-gray-500 font-mono mb-4">
                {searchTerm ? "No sessions match your search criteria" : "Start a new conversation to see your history"}
              </p>
              <Button
                color="primary"
                className="font-mono"
                onClick={() => navigate('/query')}
              >
                START NEW SESSION
              </Button>
            </CardBody>
          </Card>
        ) : (
          filteredConversations.map((conversation: any) => (
            <Card key={conversation.id} className="bg-white border border-gray-200 hover:border-orange-300 transition-all duration-200">
              <CardBody className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Bot className="text-white" size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-mono font-bold text-lg text-gray-900 mb-1 truncate">
                        {conversation.title}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 font-mono mb-2">
                        <div className="flex items-center space-x-1">
                          <Calendar size={14} />
                          <span>{formatDistanceToNow(new Date(conversation.updatedAt), { addSuffix: true })}</span>
                        </div>
                        {conversation.systemSource && (
                          <div className="flex items-center space-x-1">
                            <Database size={14} />
                            <span>{conversation.systemSource.toUpperCase()}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Chip size="sm" variant="flat" className="font-mono">
                          {conversation.messageCount || 0} MESSAGES
                        </Chip>
                        {conversation.archived && (
                          <Chip size="sm" color="warning" variant="flat" className="font-mono">
                            ARCHIVED
                          </Chip>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="flat"
                      className="font-mono"
                      onClick={() => handleViewConversation(conversation.id)}
                      startContent={<Eye size={14} />}
                    >
                      VIEW
                    </Button>
                    <Dropdown>
                      <DropdownTrigger>
                        <Button
                          size="sm"
                          variant="flat"
                          isIconOnly
                        >
                          <MoreVertical size={16} />
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu className="font-mono">
                        <DropdownItem
                          key="export-json"
                          onClick={() => handleExportConversation(conversation.id, 'json')}
                        >
                          EXPORT JSON
                        </DropdownItem>
                        <DropdownItem
                          key="export-csv"
                          onClick={() => handleExportConversation(conversation.id, 'csv')}
                        >
                          EXPORT CSV
                        </DropdownItem>
                        <DropdownItem
                          key="archive"
                          startContent={<Archive size={14} />}
                        >
                          {conversation.archived ? "UNARCHIVE" : "ARCHIVE"}
                        </DropdownItem>
                        <DropdownItem
                          key="delete"
                          className="text-danger"
                          color="danger"
                          startContent={<Trash2 size={14} />}
                          onClick={() => handleDeleteConversation(conversation.id)}
                        >
                          DELETE
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}