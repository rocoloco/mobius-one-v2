import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Card, CardBody, Button, Chip, Progress, Avatar, Divider } from "@heroui/react";
import { 
  Activity, Database, Users, TrendingUp, AlertCircle, CheckCircle, MessageSquare, 
  Settings, BarChart3, Plus, RefreshCw, DollarSign, Clock, Zap, Bell, 
  Search, FileText, HelpCircle, User, Shield, Wifi, WifiOff, Calendar,
  Target, CreditCard, Briefcase, PieChart, LineChart, Star
} from "lucide-react";
import { chatApi } from "@/lib/chatApi";

export default function DashboardPage() {
  const [lastSync, setLastSync] = useState(new Date());
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      // Simulate periodic sync updates
      if (Math.random() < 0.1) {
        setLastSync(new Date());
      }
    }, 60000);
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

  // Calculate today's queries
  const todaysQueries = Array.isArray(conversations) 
    ? conversations.filter((conv: any) => {
        const today = new Date();
        const convDate = new Date(conv.createdAt);
        return convDate.toDateString() === today.toDateString();
      }).length 
    : 0;

  // Business insights data (would come from real APIs in production)
  const insights = {
    revenue: { current: 2847500, growth: 18.3, pipeline: 4200000, forecast: 3100000 },
    collections: { overdue: 12, amount: 450000, urgent: 3, pastDue: 8 },
    deals: { active: 24, closing: 8, value: 1250000, won: 15, lost: 2 },
    performance: { uptime: 99.8, avgResponse: 24, errors: 0, dataFreshness: 98.7 },
    aiUsage: { queries: 156, accuracy: 94.5, timeSaved: "2.3h", efficiency: 87 }
  };

  const recentActivity = [
    { type: "query", title: "Q4 Revenue Analysis", time: "5 min ago", status: "completed", user: "John D." },
    { type: "alert", title: "Payment Overdue Alert - Acme Corp", time: "12 min ago", status: "active", priority: "high" },
    { type: "sync", title: "Salesforce Data Sync", time: "23 min ago", status: "completed", records: 1247 },
    { type: "query", title: "Customer Segmentation Report", time: "1 hour ago", status: "completed", user: "Sarah M." },
    { type: "deal", title: "New Deal: TechStart Integration", time: "2 hours ago", status: "created", value: "$125K" },
    { type: "system", title: "NetSuite Connection Health Check", time: "3 hours ago", status: "passed", uptime: "99.9%" }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "query": return <MessageSquare size={16} className="text-apple-primary" />;
      case "alert": return <AlertCircle size={16} className="text-apple-warning" />;
      case "sync": return <RefreshCw size={16} className="text-apple-secondary" />;
      case "deal": return <Briefcase size={16} className="text-apple-success" />;
      case "system": return <Database size={16} className="text-apple-success" />;
      default: return <Activity size={16} className="text-neutral-500" />;
    }
  };

  const getActivityBadgeColor = (status: string) => {
    switch (status) {
      case "completed": case "passed": return "status-online";
      case "active": case "created": return "status-warning";
      case "failed": case "error": return "status-offline";
      default: return "status-info";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="p-apple-4 max-w-7xl mx-auto">
        {/* TOP SECTION */}
        <div className="mb-apple-4">
          {/* Welcome Message */}
          <div className="mb-apple-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-mono font-bold text-neutral-900 mb-apple-1">
                  MOBIUS ONE DASHBOARD
                </h1>
                <p className="text-neutral-600 font-mono">
                  Good {currentTime.getHours() < 12 ? 'morning' : currentTime.getHours() < 18 ? 'afternoon' : 'evening'}, 
                  <span className="font-bold text-apple-primary ml-1">{user?.username || 'User'}</span> • 
                  <span className="ml-1">Business Intelligence Administrator</span>
                </p>
              </div>
              <div className="flex items-center gap-apple-2">
                <Chip className="status-online font-mono">ALL SYSTEMS OPERATIONAL</Chip>
                <Avatar 
                  name={user?.username?.charAt(0).toUpperCase() || 'U'} 
                  className="bg-gradient-to-r from-apple-primary to-orange-600 text-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-apple-3 mb-apple-4">
            <Card className="card-hover scale-in">
              <CardBody className="p-apple-3">
                <div className="flex items-center gap-apple-2">
                  <div className="w-12 h-12 bg-gradient-to-r from-apple-primary to-orange-600 rounded-xl flex items-center justify-center">
                    <MessageSquare className="text-white" size={20} />
                  </div>
                  <div>
                    <p className="text-xl font-mono font-bold text-neutral-900">{todaysQueries}</p>
                    <p className="text-sm font-mono text-neutral-600">Queries Today</p>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card className="card-hover scale-in" style={{ animationDelay: '100ms' }}>
              <CardBody className="p-apple-3">
                <div className="flex items-center gap-apple-2">
                  <div className="w-12 h-12 bg-gradient-to-r from-apple-success to-green-600 rounded-xl flex items-center justify-center">
                    <Wifi className="text-white" size={20} />
                  </div>
                  <div>
                    <p className="text-xl font-mono font-bold text-neutral-900">{connectedSystems.length}/2</p>
                    <p className="text-sm font-mono text-neutral-600">Systems Connected</p>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card className="card-hover scale-in" style={{ animationDelay: '200ms' }}>
              <CardBody className="p-apple-3">
                <div className="flex items-center gap-apple-2">
                  <div className="w-12 h-12 bg-gradient-to-r from-apple-secondary to-blue-600 rounded-xl flex items-center justify-center">
                    <Clock className="text-white" size={20} />
                  </div>
                  <div>
                    <p className="text-xl font-mono font-bold text-neutral-900">{insights.performance.dataFreshness}%</p>
                    <p className="text-sm font-mono text-neutral-600">Data Freshness</p>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card className="card-hover scale-in" style={{ animationDelay: '300ms' }}>
              <CardBody className="p-apple-3">
                <div className="flex items-center gap-apple-2">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Zap className="text-white" size={20} />
                  </div>
                  <div>
                    <p className="text-xl font-mono font-bold text-neutral-900">{insights.performance.avgResponse}ms</p>
                    <p className="text-sm font-mono text-neutral-600">Avg Response</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap gap-apple-2 mb-apple-4">
            <Link to="/query">
              <Button className="btn-hover font-mono font-bold" startContent={<Plus size={16} />}>
                NEW QUERY
              </Button>
            </Link>
            <Button variant="flat" className="btn-hover font-mono" startContent={<BarChart3 size={16} />}>
              VIEW REPORTS
            </Button>
            <Button variant="flat" className="btn-hover font-mono" startContent={<Activity size={16} />}>
              SYSTEM HEALTH
            </Button>
            <Button variant="flat" className="btn-hover font-mono" startContent={<Calendar size={16} />}>
              SCHEDULE REPORT
            </Button>
          </div>
        </div>

        {/* MAIN CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-apple-4">
          {/* LEFT & CENTER - INSIGHTS CARDS */}
          <div className="lg:col-span-2 space-y-apple-3">
            {/* Revenue Pipeline Summary */}
            <Card className="card-hover fade-in">
              <CardBody className="p-apple-3">
                <div className="flex items-center justify-between mb-apple-3">
                  <h3 className="font-mono font-bold text-neutral-900 flex items-center gap-apple-1">
                    <DollarSign size={18} className="text-apple-success" />
                    REVENUE PIPELINE SUMMARY
                  </h3>
                  <Chip className="status-online font-mono">+{insights.revenue.growth}% QoQ</Chip>
                </div>
                
                <div className="grid grid-cols-3 gap-apple-3">
                  <div className="text-center">
                    <p className="text-2xl font-mono font-bold text-neutral-900">
                      ${(insights.revenue.current / 1000000).toFixed(1)}M
                    </p>
                    <p className="text-sm font-mono text-neutral-600">Current Quarter</p>
                    <div className="mt-apple-1">
                      <TrendingUp className="text-apple-success mx-auto" size={16} />
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-mono font-bold text-apple-primary">
                      ${(insights.revenue.pipeline / 1000000).toFixed(1)}M
                    </p>
                    <p className="text-sm font-mono text-neutral-600">Pipeline Value</p>
                    <div className="mt-apple-1">
                      <Target className="text-apple-primary mx-auto" size={16} />
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-mono font-bold text-apple-secondary">
                      ${(insights.revenue.forecast / 1000000).toFixed(1)}M
                    </p>
                    <p className="text-sm font-mono text-neutral-600">Q1 Forecast</p>
                    <div className="mt-apple-1">
                      <LineChart className="text-apple-secondary mx-auto" size={16} />
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Collection Alerts */}
            <Card className="card-hover fade-in" style={{ animationDelay: '100ms' }}>
              <CardBody className="p-apple-3">
                <div className="flex items-center justify-between mb-apple-3">
                  <h3 className="font-mono font-bold text-neutral-900 flex items-center gap-apple-1">
                    <CreditCard size={18} className="text-apple-warning" />
                    COLLECTION ALERTS & OVERDUE ACCOUNTS
                  </h3>
                  <Chip className="status-warning font-mono">{insights.collections.urgent} URGENT</Chip>
                </div>
                
                <div className="grid grid-cols-2 gap-apple-4">
                  <div>
                    <div className="mb-apple-2">
                      <p className="text-xl font-mono font-bold text-apple-warning">
                        {insights.collections.overdue}
                      </p>
                      <p className="text-sm font-mono text-neutral-600">Overdue Accounts</p>
                    </div>
                    <div>
                      <p className="text-lg font-mono font-bold text-neutral-900">
                        ${insights.collections.amount.toLocaleString()}
                      </p>
                      <p className="text-sm font-mono text-neutral-600">Total Amount</p>
                    </div>
                  </div>
                  <div className="space-y-apple-1">
                    <div className="flex justify-between">
                      <span className="font-mono text-sm text-neutral-600">30+ Days</span>
                      <span className="font-mono text-sm font-bold text-apple-warning">{insights.collections.pastDue}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-mono text-sm text-neutral-600">60+ Days</span>
                      <span className="font-mono text-sm font-bold text-apple-error">{insights.collections.urgent}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-mono text-sm text-neutral-600">90+ Days</span>
                      <span className="font-mono text-sm font-bold text-apple-error">1</span>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Recent Deal Activity */}
            <Card className="card-hover fade-in" style={{ animationDelay: '200ms' }}>
              <CardBody className="p-apple-3">
                <div className="flex items-center justify-between mb-apple-3">
                  <h3 className="font-mono font-bold text-neutral-900 flex items-center gap-apple-1">
                    <Briefcase size={18} className="text-apple-success" />
                    RECENT DEAL ACTIVITY
                  </h3>
                  <Chip className="status-info font-mono">{insights.deals.closing} CLOSING THIS QUARTER</Chip>
                </div>
                
                <div className="grid grid-cols-4 gap-apple-2">
                  <div className="text-center">
                    <p className="text-lg font-mono font-bold text-neutral-900">{insights.deals.active}</p>
                    <p className="text-xs font-mono text-neutral-600">Active</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-mono font-bold text-apple-primary">{insights.deals.closing}</p>
                    <p className="text-xs font-mono text-neutral-600">Closing</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-mono font-bold text-apple-success">{insights.deals.won}</p>
                    <p className="text-xs font-mono text-neutral-600">Won</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-mono font-bold text-apple-error">{insights.deals.lost}</p>
                    <p className="text-xs font-mono text-neutral-600">Lost</p>
                  </div>
                </div>
                
                <Divider className="my-apple-2" />
                
                <div className="text-center">
                  <p className="text-xl font-mono font-bold text-neutral-900">
                    ${(insights.deals.value / 1000000).toFixed(1)}M
                  </p>
                  <p className="text-sm font-mono text-neutral-600">Total Pipeline Value</p>
                </div>
              </CardBody>
            </Card>

            {/* System Performance & AI Usage */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-apple-3">
              <Card className="card-hover fade-in" style={{ animationDelay: '300ms' }}>
                <CardBody className="p-apple-3">
                  <h3 className="font-mono font-bold text-neutral-900 mb-apple-2 flex items-center gap-apple-1">
                    <Activity size={18} className="text-apple-secondary" />
                    SYSTEM PERFORMANCE
                  </h3>
                  <div className="space-y-apple-2">
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-sm text-neutral-600">Uptime</span>
                      <span className="font-mono text-sm font-bold text-apple-success">
                        {insights.performance.uptime}%
                      </span>
                    </div>
                    <Progress value={insights.performance.uptime} className="h-2" color="success" />
                    
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-sm text-neutral-600">Response Time</span>
                      <span className="font-mono text-sm font-bold text-neutral-900">
                        {insights.performance.avgResponse}ms
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-sm text-neutral-600">Errors (24h)</span>
                      <span className="font-mono text-sm font-bold text-apple-success">
                        {insights.performance.errors}
                      </span>
                    </div>
                  </div>
                </CardBody>
              </Card>

              <Card className="card-hover fade-in" style={{ animationDelay: '400ms' }}>
                <CardBody className="p-apple-3">
                  <h3 className="font-mono font-bold text-neutral-900 mb-apple-2 flex items-center gap-apple-1">
                    <Zap size={18} className="text-purple-500" />
                    AI USAGE STATISTICS
                  </h3>
                  <div className="grid grid-cols-2 gap-apple-2">
                    <div className="text-center">
                      <p className="text-lg font-mono font-bold text-purple-500">{insights.aiUsage.queries}</p>
                      <p className="text-xs font-mono text-neutral-600">Queries Today</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-mono font-bold text-apple-success">{insights.aiUsage.accuracy}%</p>
                      <p className="text-xs font-mono text-neutral-600">Accuracy</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-mono font-bold text-apple-primary">{insights.aiUsage.timeSaved}</p>
                      <p className="text-xs font-mono text-neutral-600">Time Saved</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-mono font-bold text-apple-secondary">{insights.aiUsage.efficiency}%</p>
                      <p className="text-xs font-mono text-neutral-600">Efficiency</p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>

          {/* RIGHT COLUMN - NAVIGATION & ACTIVITY */}
          <div className="space-y-apple-3">
            {/* Navigation Sidebar */}
            <Card className="card-hover fade-in">
              <CardBody className="p-apple-3">
                <h3 className="font-mono font-bold text-neutral-900 mb-apple-2">NAVIGATION</h3>
                <div className="space-y-apple-1">
                  <div className="p-apple-2 bg-apple-primary bg-opacity-10 rounded-lg border border-apple-primary">
                    <div className="flex items-center gap-apple-1">
                      <BarChart3 size={14} className="text-apple-primary" />
                      <span className="font-mono text-sm font-bold text-apple-primary">Dashboard</span>
                    </div>
                  </div>
                  
                  <Link to="/query" className="block">
                    <div className="p-apple-2 hover:bg-neutral-100 rounded-lg transition-colors">
                      <div className="flex items-center gap-apple-1">
                        <MessageSquare size={14} className="text-neutral-600" />
                        <span className="font-mono text-sm text-neutral-900">Query Interface</span>
                      </div>
                    </div>
                  </Link>
                  
                  <div className="p-apple-2 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer">
                    <div className="flex items-center gap-apple-1">
                      <Search size={14} className="text-neutral-600" />
                      <span className="font-mono text-sm text-neutral-900">Saved Searches</span>
                    </div>
                  </div>
                  
                  <div className="p-apple-2 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer">
                    <div className="flex items-center gap-apple-1">
                      <FileText size={14} className="text-neutral-600" />
                      <span className="font-mono text-sm text-neutral-900">Reports & Analytics</span>
                    </div>
                  </div>
                  
                  <Link to="/settings" className="block">
                    <div className="p-apple-2 hover:bg-neutral-100 rounded-lg transition-colors">
                      <div className="flex items-center gap-apple-1">
                        <Settings size={14} className="text-neutral-600" />
                        <span className="font-mono text-sm text-neutral-900">System Settings</span>
                      </div>
                    </div>
                  </Link>
                  
                  <div className="p-apple-2 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer">
                    <div className="flex items-center gap-apple-1">
                      <User size={14} className="text-neutral-600" />
                      <span className="font-mono text-sm text-neutral-900">User Profile</span>
                    </div>
                  </div>
                  
                  <Link to="/help" className="block">
                    <div className="p-apple-2 hover:bg-neutral-100 rounded-lg transition-colors">
                      <div className="flex items-center gap-apple-1">
                        <HelpCircle size={14} className="text-neutral-600" />
                        <span className="font-mono text-sm text-neutral-900">Help & Support</span>
                      </div>
                    </div>
                  </Link>
                </div>
              </CardBody>
            </Card>

            {/* Recent Activity Timeline */}
            <Card className="card-hover fade-in" style={{ animationDelay: '100ms' }}>
              <CardBody className="p-apple-3">
                <h3 className="font-mono font-bold text-neutral-900 mb-apple-2">RECENT ACTIVITY</h3>
                <div className="space-y-apple-2 max-h-96 overflow-y-auto">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start gap-apple-2">
                      <div className="mt-1">{getActivityIcon(activity.type)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-mono text-sm font-bold text-neutral-900 truncate">
                          {activity.title}
                        </p>
                        <div className="flex items-center gap-apple-1 mt-1">
                          <p className="font-mono text-xs text-neutral-500">{activity.time}</p>
                          {activity.user && (
                            <>
                              <span className="text-neutral-300">•</span>
                              <p className="font-mono text-xs text-neutral-500">{activity.user}</p>
                            </>
                          )}
                        </div>
                        {(activity.records || activity.value || activity.uptime) && (
                          <p className="font-mono text-xs text-apple-secondary mt-1">
                            {activity.records && `${activity.records} records`}
                            {activity.value && activity.value}
                            {activity.uptime && `${activity.uptime} uptime`}
                          </p>
                        )}
                      </div>
                      <Chip 
                        size="sm" 
                        className={`font-mono ${getActivityBadgeColor(activity.status)}`}
                      >
                        {activity.status.toUpperCase()}
                      </Chip>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>

            {/* System Status */}
            <Card className="card-hover fade-in" style={{ animationDelay: '200ms' }}>
              <CardBody className="p-apple-3">
                <h3 className="font-mono font-bold text-neutral-900 mb-apple-2">SYSTEM STATUS</h3>
                <div className="space-y-apple-2">
                  {systemConnections.length > 0 ? (
                    (systemConnections as any[]).map((system) => (
                      <div key={system.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-apple-1">
                          {system.isConnected ? 
                            <Wifi size={14} className="text-apple-success" /> : 
                            <WifiOff size={14} className="text-apple-error" />
                          }
                          <span className="font-mono text-sm font-bold">
                            {system.systemType.toUpperCase()}
                          </span>
                        </div>
                        <Chip
                          size="sm"
                          className={`font-mono ${
                            system.isConnected ? 'status-online' : 'status-offline'
                          }`}
                        >
                          {system.isConnected ? 'ONLINE' : 'OFFLINE'}
                        </Chip>
                      </div>
                    ))
                  ) : (
                    <p className="text-neutral-600 font-mono text-sm">No systems configured</p>
                  )}
                </div>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="mt-apple-4 flex items-center justify-between p-apple-3 bg-white rounded-xl border border-neutral-200 card-hover">
          <div className="flex items-center gap-apple-3">
            <div className="flex items-center gap-apple-1">
              <div className="w-3 h-3 bg-apple-success rounded-full animate-pulse"></div>
              <span className="font-mono text-sm text-neutral-600">All Systems Operational</span>
            </div>
            <Divider orientation="vertical" className="h-6" />
            <div className="flex items-center gap-apple-1">
              <Clock size={14} className="text-neutral-500" />
              <span className="font-mono text-sm text-neutral-600">
                Last sync: {lastSync.toLocaleTimeString()}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-apple-2">
            <Button 
              size="sm" 
              variant="flat" 
              className="btn-hover font-mono"
              startContent={<Star size={14} />}
            >
              Quick Feedback
            </Button>
            <Button 
              size="sm" 
              className="btn-hover font-mono"
              startContent={<HelpCircle size={14} />}
            >
              Support Chat
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}