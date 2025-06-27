import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Card, CardBody, Button, Input, Avatar } from "@heroui/react";
import { 
  MessageSquare, Plus, TrendingUp, Users, DollarSign, Clock, 
  Search, ArrowRight, Zap, CheckCircle, AlertTriangle, Database,
  BarChart3, Target, Calendar, ChevronRight, Activity, Globe
} from "lucide-react";

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const { data: user } = useQuery({
    queryKey: ['/api/user'],
    enabled: true
  });

  const { data: conversations = [] } = useQuery({
    queryKey: ['/api/conversations'],
    enabled: true
  });

  const { data: systemConnections = [] } = useQuery({
    queryKey: ['/api/systems'],
    enabled: true
  });

  const connectedSystems = Array.isArray(systemConnections) 
    ? systemConnections.filter((conn: any) => conn.isConnected)
    : [];

  const todaysQueries = Array.isArray(conversations) 
    ? conversations.filter((conv: any) => {
        const today = new Date();
        const convDate = new Date(conv.createdAt);
        return convDate.toDateString() === today.toDateString();
      }).length 
    : 0;

  const quickQueries = [
    { text: "Show me this quarter's revenue vs target", category: "Revenue Analysis", icon: TrendingUp },
    { text: "Which customers have overdue payments?", category: "Collections", icon: AlertTriangle },
    { text: "What deals are closing this month?", category: "Sales Pipeline", icon: Target },
    { text: "Compare our performance vs last quarter", category: "Performance", icon: BarChart3 },
    { text: "Show me top performing sales reps", category: "Team Performance", icon: Users },
    { text: "What's our cash flow projection?", category: "Financial Planning", icon: DollarSign }
  ];

  const recentActivity = [
    { 
      title: "Q4 Revenue Analysis Complete", 
      description: "Generated comprehensive revenue breakdown showing 18.3% growth",
      time: "5 minutes ago",
      type: "success"
    },
    { 
      title: "Collections Alert Generated", 
      description: "Identified 3 high-priority overdue accounts totaling $450K",
      time: "12 minutes ago",
      type: "warning"
    },
    { 
      title: "Sales Pipeline Updated", 
      description: "8 new opportunities added to Q1 forecast",
      time: "1 hour ago",
      type: "info"
    }
  ];

  const handleQuickQuery = (query: string) => {
    window.location.href = `/query?q=${encodeURIComponent(query)}`;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "success": return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "warning": return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case "info": return <Activity className="h-4 w-4 text-blue-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Good {currentTime.getHours() < 12 ? 'morning' : currentTime.getHours() < 18 ? 'afternoon' : 'evening'}, {(user as any)?.username || 'there'}
            </h1>
            <p className="text-muted-foreground">
              What insights do you need from your business data today?
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="system-status-online">
              <Globe className="h-3 w-3" />
              {connectedSystems.length}/2 Systems Online
            </div>
            <Avatar 
              name={(user as any)?.username?.charAt(0).toUpperCase() || 'U'} 
              className="h-10 w-10"
            />
          </div>
        </div>

        {/* Primary Search Action */}
        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Ask anything about your business data..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-base input-modern"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    handleQuickQuery(searchQuery);
                  }
                }}
              />
            </div>
            <Link to={searchQuery.trim() ? `/query?q=${encodeURIComponent(searchQuery)}` : "/query"}>
              <Button className="btn-primary h-12 px-6">
                Ask AI
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card-hover p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{todaysQueries}</p>
                <p className="text-sm text-muted-foreground">Queries Today</p>
              </div>
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
            </div>
          </div>

          <div className="card-hover p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{connectedSystems.length}</p>
                <p className="text-sm text-muted-foreground">Connected Systems</p>
              </div>
              <div className="h-12 w-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Database className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="card-hover p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">98.7%</p>
                <p className="text-sm text-muted-foreground">Data Freshness</p>
              </div>
              <div className="h-12 w-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="card-hover p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">24ms</p>
                <p className="text-sm text-muted-foreground">Response Time</p>
              </div>
              <div className="h-12 w-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <Zap className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Popular Questions */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-semibold">Popular Business Questions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {quickQueries.map((query, index) => (
                <div 
                  key={index} 
                  className="card-hover p-4 cursor-pointer group"
                  onClick={() => handleQuickQuery(query.text)}
                >
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 bg-primary/10 rounded-md flex items-center justify-center flex-shrink-0">
                      <query.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm leading-relaxed group-hover:text-primary transition-colors">
                        {query.text}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{query.category}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Activity */}
            <div className="space-y-4 mt-8">
              <h2 className="text-xl font-semibold">Recent Activity</h2>
              <div className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="card-hover p-4">
                    <div className="flex items-start gap-3">
                      {getActivityIcon(activity.type)}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm">{activity.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
                        <p className="text-xs text-muted-foreground mt-2">{activity.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="card p-4">
              <h3 className="font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Link to="/query" className="block">
                  <Button className="w-full btn-ghost justify-start">
                    <Plus className="mr-2 h-4 w-4" />
                    New Query
                  </Button>
                </Link>
                <Button className="w-full btn-ghost justify-start">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  View Reports
                </Button>
                <Button className="w-full btn-ghost justify-start">
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule Report
                </Button>
              </div>
            </div>

            {/* System Health */}
            <div className="card p-4">
              <h3 className="font-semibold mb-4">System Health</h3>
              <div className="space-y-3">
                {Array.isArray(systemConnections) && systemConnections.map((system: any) => (
                  <div key={system.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${
                        system.isConnected ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                      <span className="text-sm font-medium">
                        {system.systemType.charAt(0).toUpperCase() + system.systemType.slice(1)}
                      </span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      system.isConnected 
                        ? 'system-status-online' 
                        : 'system-status-offline'
                    }`}>
                      {system.isConnected ? 'Online' : 'Offline'}
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Overall Health</span>
                  <span className="text-sm font-medium text-green-600">99.8%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '99.8%' }}></div>
                </div>
              </div>
            </div>

            {/* Recent Conversations */}
            <div className="card p-4">
              <h3 className="font-semibold mb-4">Recent Conversations</h3>
              <div className="space-y-3">
                {(conversations as any[]).slice(0, 3).map((conv) => (
                  <div key={conv.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer">
                    <div className="h-2 w-2 bg-primary rounded-full"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{conv.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(conv.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Status */}
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-muted-foreground">All systems operational</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Last sync: {currentTime.toLocaleTimeString()}
                </span>
              </div>
            </div>
            <Link to="/help">
              <Button className="btn-ghost">Need Help?</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}