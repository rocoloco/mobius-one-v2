import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Card, CardBody, Button, Chip, Progress, Avatar, Input } from "@heroui/react";
import { 
  MessageSquare, Plus, TrendingUp, Users, DollarSign, Clock, 
  Search, ArrowRight, Zap, CheckCircle, AlertTriangle, Database,
  BarChart3, Target, Calendar
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

  // Quick query suggestions for business users
  const quickQueries = [
    { text: "Show me this quarter's revenue vs target", category: "Revenue", icon: TrendingUp },
    { text: "Which customers have overdue payments?", category: "Collections", icon: AlertTriangle },
    { text: "What deals are closing this month?", category: "Sales", icon: Target },
    { text: "Compare our performance vs last quarter", category: "Analytics", icon: BarChart3 },
    { text: "Show me top performing sales reps", category: "Team", icon: Users },
    { text: "What's our cash flow projection?", category: "Finance", icon: DollarSign }
  ];

  const recentInsights = [
    { 
      title: "Q4 Revenue Up 18.3%", 
      description: "Current quarter tracking $2.85M vs $2.41M last quarter",
      status: "positive",
      time: "Updated 5 min ago"
    },
    { 
      title: "3 Urgent Collections", 
      description: "Overdue amounts totaling $450K require immediate attention",
      status: "warning",
      time: "Updated 12 min ago"
    },
    { 
      title: "8 Deals Closing Soon", 
      description: "Pipeline value of $1.25M expected to close this quarter",
      status: "info",
      time: "Updated 23 min ago"
    }
  ];

  const handleQuickQuery = (query: string) => {
    // Navigate to query page with pre-filled query
    window.location.href = `/query?q=${encodeURIComponent(query)}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "positive": return "status-online";
      case "warning": return "status-warning";
      case "info": return "status-info";
      default: return "status-info";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-surface">
      <div className="p-8 max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-display text-neutral-900 mb-2">
                Good {currentTime.getHours() < 12 ? 'morning' : currentTime.getHours() < 18 ? 'afternoon' : 'evening'}, {(user as any)?.username || 'there'}
              </h1>
              <p className="text-lg text-muted">
                What would you like to know about your business today?
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Chip className="status-online font-sans">
                {connectedSystems.length}/2 Systems Online
              </Chip>
              <Avatar 
                name={(user as any)?.username?.charAt(0).toUpperCase() || 'U'} 
                className="bg-gradient-primary text-white"
                size="lg"
              />
            </div>
          </div>

          {/* Primary Action - Search/Query */}
          <Card className="card-hover mb-8">
            <CardBody className="p-6">
              <div className="flex items-center gap-4">
                <Input
                  placeholder="Ask anything about your business data..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  size="lg"
                  startContent={<Search className="text-neutral-400" size={20} />}
                  classNames={{
                    input: "text-lg font-sans",
                    inputWrapper: "bg-white border-2 border-neutral-200 hover:border-primary focus-within:border-primary"
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && searchQuery.trim()) {
                      handleQuickQuery(searchQuery);
                    }
                  }}
                />
                <Link to={searchQuery.trim() ? `/query?q=${encodeURIComponent(searchQuery)}` : "/query"}>
                  <Button 
                    className="btn-hover font-sans px-8"
                    size="lg"
                    endContent={<ArrowRight size={18} />}
                  >
                    Ask AI
                  </Button>
                </Link>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Quick Stats - Simplified */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="card-hover">
            <CardBody className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <MessageSquare className="text-white" size={18} />
                </div>
                <div>
                  <p className="text-2xl font-display text-neutral-900">{todaysQueries}</p>
                  <p className="text-sm text-muted">Queries Today</p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="card-hover">
            <CardBody className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-secondary rounded-lg flex items-center justify-center">
                  <Database className="text-white" size={18} />
                </div>
                <div>
                  <p className="text-2xl font-display text-neutral-900">{connectedSystems.length}</p>
                  <p className="text-sm text-muted">Systems Connected</p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="card-hover">
            <CardBody className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-accent rounded-lg flex items-center justify-center">
                  <TrendingUp className="text-white" size={18} />
                </div>
                <div>
                  <p className="text-2xl font-display text-neutral-900">98.7%</p>
                  <p className="text-sm text-muted">Data Fresh</p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="card-hover">
            <CardBody className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                  <Zap className="text-white" size={18} />
                </div>
                <div>
                  <p className="text-2xl font-display text-neutral-900">24ms</p>
                  <p className="text-sm text-muted">Response Time</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Query Suggestions */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-display text-neutral-900 mb-4">Popular Questions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickQueries.map((query, index) => (
                <Card 
                  key={index} 
                  className="card-hover cursor-pointer"
                  onClick={() => handleQuickQuery(query.text)}
                >
                  <CardBody className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center flex-shrink-0">
                        <query.icon className="text-white" size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-sans font-medium text-neutral-900 text-sm leading-relaxed">
                          {query.text}
                        </p>
                        <p className="text-xs text-muted mt-1">{query.category}</p>
                      </div>
                      <ArrowRight className="text-neutral-400 flex-shrink-0" size={16} />
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>

            {/* Recent Insights */}
            <div className="mt-8">
              <h2 className="text-xl font-display text-neutral-900 mb-4">Recent Insights</h2>
              <div className="space-y-3">
                {recentInsights.map((insight, index) => (
                  <Card key={index} className="card-hover">
                    <CardBody className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <h3 className="font-sans font-medium text-neutral-900 mb-1">
                            {insight.title}
                          </h3>
                          <p className="text-sm text-muted mb-2">{insight.description}</p>
                          <p className="text-xs text-neutral-400">{insight.time}</p>
                        </div>
                        <Chip size="sm" className={`${getStatusColor(insight.status)} font-sans`}>
                          {insight.status.toUpperCase()}
                        </Chip>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar - Quick Actions & Status */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="card-hover">
              <CardBody className="p-4">
                <h3 className="font-display text-neutral-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link to="/query">
                    <Button 
                      className="w-full btn-hover font-sans justify-start" 
                      variant="flat"
                      startContent={<Plus size={16} />}
                    >
                      New Query
                    </Button>
                  </Link>
                  <Button 
                    className="w-full btn-hover font-sans justify-start" 
                    variant="flat"
                    startContent={<BarChart3 size={16} />}
                  >
                    View Reports
                  </Button>
                  <Button 
                    className="w-full btn-hover font-sans justify-start" 
                    variant="flat"
                    startContent={<Calendar size={16} />}
                  >
                    Schedule Report
                  </Button>
                </div>
              </CardBody>
            </Card>

            {/* System Status */}
            <Card className="card-hover">
              <CardBody className="p-4">
                <h3 className="font-display text-neutral-900 mb-4">System Health</h3>
                <div className="space-y-3">
                  {Array.isArray(systemConnections) && systemConnections.map((system: any) => (
                    <div key={system.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          system.isConnected ? 'bg-success' : 'bg-error'
                        }`}></div>
                        <span className="font-sans text-sm font-medium">
                          {system.systemType.charAt(0).toUpperCase() + system.systemType.slice(1)}
                        </span>
                      </div>
                      <Chip 
                        size="sm" 
                        className={`font-sans ${
                          system.isConnected ? 'status-online' : 'status-offline'
                        }`}
                      >
                        {system.isConnected ? 'Online' : 'Offline'}
                      </Chip>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 pt-4 border-t border-neutral-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted">Overall Health</span>
                    <span className="text-sm font-medium text-success">99.8%</span>
                  </div>
                  <Progress value={99.8} className="h-2" color="success" />
                </div>
              </CardBody>
            </Card>

            {/* Recent Activity - Simplified */}
            <Card className="card-hover">
              <CardBody className="p-4">
                <h3 className="font-display text-neutral-900 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {(conversations as any[]).slice(0, 3).map((conv) => (
                    <div key={conv.id} className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <div className="flex-1 min-w-0">
                        <p className="font-sans text-sm font-medium text-neutral-900 truncate">
                          {conv.title}
                        </p>
                        <p className="text-xs text-muted">
                          {new Date(conv.updatedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Footer - Simplified */}
        <div className="mt-8 flex items-center justify-between p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-white/20">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="text-success" size={16} />
              <span className="text-sm text-muted">All systems operational</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="text-neutral-400" size={16} />
              <span className="text-sm text-muted">Last sync: {currentTime.toLocaleTimeString()}</span>
            </div>
          </div>
          <Link to="/help">
            <Button size="sm" variant="flat" className="btn-hover font-sans">
              Need Help?
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}