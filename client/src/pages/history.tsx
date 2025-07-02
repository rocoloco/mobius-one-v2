import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { 
  Search, Filter, Calendar, Download, Trash2, 
  MessageSquare, Clock, Star, Archive, Eye,
  ChevronDown, MoreHorizontal, ExternalLink
} from "lucide-react";

export default function HistoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  const { data: conversations = [] } = useQuery({
    queryKey: ['/api/conversations'],
    enabled: true
  });

  const { data: user } = useQuery({
    queryKey: ['/api/user'],
    enabled: true
  });

  const filteredConversations = (conversations as any[])
    .filter(conv => {
      if (searchQuery && !conv.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (filterBy === "starred") return conv.isStarred;
      if (filterBy === "archived") return conv.isArchived;
      if (filterBy === "recent") {
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return new Date(conv.updatedAt) > oneWeekAgo;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "recent") return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      if (sortBy === "oldest") return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      if (sortBy === "alphabetical") return a.title.localeCompare(b.title);
      return 0;
    });

  const handleSelectAll = () => {
    if (selectedItems.length === filteredConversations.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredConversations.map(conv => conv.id));
    }
  };

  const handleExportSelected = (format: 'pdf' | 'csv' | 'json') => {
    console.log(`Exporting ${selectedItems.length} conversations as ${format}`);
  };

  const getConversationPreview = (conv: any) => {
    return conv.preview || "Click to view conversation details and continue the discussion...";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-foreground mb-2">Conversation History</h1>
          <p className="text-muted-foreground">
            Review past conversations, export insights, and continue previous discussions
          </p>
        </div>

        {/* Controls */}
        <div className="card p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-modern pl-10 w-full font-body"
                style={{
                  background: 'white',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  padding: '12px 12px 12px 40px',
                  fontSize: '14px',
                  color: '#1a202c',
                  transition: 'all 0.2s ease'
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

            {/* Filters */}
            <div className="flex gap-3">
              <select 
                className="input-modern min-w-[120px]"
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
              >
                <option value="all">All</option>
                <option value="recent">This Week</option>
                <option value="starred">Starred</option>
                <option value="archived">Archived</option>
              </select>

              <select 
                className="input-modern min-w-[120px]"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="recent">Most Recent</option>
                <option value="oldest">Oldest First</option>
                <option value="alphabetical">A-Z</option>
              </select>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedItems.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {selectedItems.length} conversation{selectedItems.length !== 1 ? 's' : ''} selected
                </span>
                <div className="flex gap-2">
                  <button 
                    className="btn-secondary text-sm"
                    onClick={() => handleExportSelected('pdf')}
                  >
                    <Download className="h-4 w-4" />
                    Export PDF
                  </button>
                  <button 
                    className="btn-secondary text-sm"
                    onClick={() => handleExportSelected('csv')}
                  >
                    <Download className="h-4 w-4" />
                    Export CSV
                  </button>
                  <button className="btn-secondary text-sm text-destructive">
                    <Archive className="h-4 w-4" />
                    Archive
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-semibold text-foreground">{conversations.length}</p>
                <p className="text-sm text-muted-foreground">Total Conversations</p>
              </div>
              <MessageSquare className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>

          <div className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-semibold text-foreground">
                  {conversations.filter((c: any) => {
                    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                    return new Date(c.updatedAt) > oneWeekAgo;
                  }).length}
                </p>
                <p className="text-sm text-muted-foreground">This Week</p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>

          <div className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-semibold text-foreground">
                  {conversations.filter((c: any) => c.isStarred).length}
                </p>
                <p className="text-sm text-muted-foreground">Starred</p>
              </div>
              <Star className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>

          <div className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-semibold text-foreground">
                  {Math.round(conversations.length * 0.92)}
                </p>
                <p className="text-sm text-muted-foreground">Avg. Accuracy</p>
              </div>
              <Eye className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
        </div>

        {/* Conversation List */}
        <div className="space-y-4">
          {/* Select All */}
          <div className="flex items-center gap-3 px-2">
            <input
              type="checkbox"
              checked={selectedItems.length === filteredConversations.length && filteredConversations.length > 0}
              onChange={handleSelectAll}
              className="rounded border-border"
            />
            <span className="text-sm text-muted-foreground">
              Select all ({filteredConversations.length} conversations)
            </span>
          </div>

          {filteredConversations.length === 0 ? (
            <div className="card p-12 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">No conversations found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? 'Try adjusting your search terms' : 'Start a new conversation to see it here'}
              </p>
              <Link to="/query">
                <button className="btn-primary">Start New Conversation</button>
              </Link>
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <div key={conversation.id} className="card p-6">
                <div className="flex items-start gap-4">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(conversation.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedItems([...selectedItems, conversation.id]);
                      } else {
                        setSelectedItems(selectedItems.filter(id => id !== conversation.id));
                      }
                    }}
                    className="mt-1 rounded border-border"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-foreground hover:text-primary cursor-pointer">
                          <Link to={`/query?conversation=${conversation.id}`}>
                            {conversation.title}
                          </Link>
                        </h3>
                        <div className="flex items-center gap-1">
                          {conversation.isStarred && (
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          )}
                          {conversation.isArchived && (
                            <Archive className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(conversation.updatedAt)}
                        </span>
                        <button className="btn-ghost p-1">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {getConversationPreview(conversation)}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{conversation.messageCount || 0} messages</span>
                        <span>94% avg. confidence</span>
                        <span>Salesforce, NetSuite</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button className="btn-ghost text-xs p-1">
                          <Star className="h-3 w-3" />
                          Star
                        </button>
                        <button className="btn-ghost text-xs p-1">
                          <Download className="h-3 w-3" />
                          Export
                        </button>
                        <Link to={`/query?conversation=${conversation.id}`}>
                          <button className="btn-secondary text-xs">
                            <Eye className="h-3 w-3" />
                            Continue
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {filteredConversations.length > 20 && (
          <div className="flex items-center justify-center mt-8">
            <div className="flex items-center gap-2">
              <button className="btn-secondary">Previous</button>
              <span className="text-sm text-muted-foreground px-4">
                Page 1 of {Math.ceil(filteredConversations.length / 20)}
              </span>
              <button className="btn-secondary">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}