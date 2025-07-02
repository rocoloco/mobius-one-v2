import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Button, Input, Avatar } from "@heroui/react";
import { 
  MessageSquare, Plus, TrendingUp, Users, DollarSign, Clock, 
  Search, ArrowRight, Database, BarChart3, Target, Calendar, 
  Activity, Globe, CheckCircle
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

  const todaysConversations = Array.isArray(conversations) 
    ? conversations.filter((conv: any) => {
        const today = new Date();
        const convDate = new Date(conv.createdAt);
        return convDate.toDateString() === today.toDateString();
      }).length 
    : 0;

  const quickQuestions = [
    { text: "Show me this quarter's revenue vs target", category: "Revenue Analysis", icon: TrendingUp },
    { text: "Which customers have overdue payments?", category: "Collections", icon: Target },
    { text: "What deals are closing this month?", category: "Sales Pipeline", icon: DollarSign },
    { text: "Compare our performance vs last quarter", category: "Performance", icon: BarChart3 },
    { text: "Show me top performing sales reps", category: "Team Performance", icon: Users },
    { text: "What's our cash flow projection?", category: "Financial Planning", icon: Calendar }
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

  const handleQuickQuestion = (question: string) => {
    window.location.href = `/?q=${encodeURIComponent(question)}`;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "success": return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "warning": return <Target className="h-4 w-4 text-amber-600" />;
      case "info": return <Activity className="h-4 w-4 text-blue-600" />;
      default: return <Activity className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Good {currentTime.getHours() < 12 ? 'morning' : currentTime.getHours() < 18 ? 'afternoon' : 'evening'}, {(user as any)?.username || 'there'}
            </h1>
            <p className="text-gray-600 mt-1">
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
              className="h-8 w-8 bg-gray-100 text-gray-700"
            />
          </div>
        </div>

        {/* Primary Search Action */}
        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                placeholder="Ask anything about your business data..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-modern pl-10 h-12 text-base w-full"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    handleQuickQuestion(searchQuery);
                  }
                }}
              />
            </div>
            <Link to={searchQuery.trim() ? `/?q=${encodeURIComponent(searchQuery)}` : "/"}>
              <button className="btn-primary h-12 px-6">
                Ask Mobius
                <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-semibold text-gray-900">{todaysConversations}</p>
                <p className="text-sm text-gray-600">Conversations Today</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-gray-600" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-semibold text-gray-900">{connectedSystems.length}</p>
                <p className="text-sm text-gray-600">Connected Systems</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                <Database className="h-5 w-5 text-gray-600" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-semibold text-gray-900">98.7%</p>
                <p className="text-sm text-gray-600">Data Freshness</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-gray-600" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-semibold text-gray-900">24ms</p>
                <p className="text-sm text-gray-600">Response Time</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                <Activity className="h-5 w-5 text-gray-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Popular Questions */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Popular Business Questions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickQuestions.map((question, index) => (
                <div 
                  key={index} 
                  className="card-hover p-4 cursor-pointer group"
                  onClick={() => handleQuickQuestion(question.text)}
                >
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-md bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <question.icon className="h-4 w-4 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 leading-relaxed">
                        {question.text}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{question.category}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Activity */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
              <div className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="card p-4">
                    <div className="flex items-start gap-3">
                      {getActivityIcon(activity.type)}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm text-gray-900">{activity.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                        <p className="text-xs text-gray-500 mt-2">{activity.time}</p>
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
            <div className="card p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link to="/query" className="block">
                  <button className="btn-secondary w-full justify-start">
                    <Plus className="h-4 w-4" />
                    New Query
                  </button>
                </Link>
                <button className="btn-secondary w-full justify-start">
                  <BarChart3 className="h-4 w-4" />
                  View Reports
                </button>
                <button className="btn-secondary w-full justify-start">
                  <Calendar className="h-4 w-4" />
                  Schedule Report
                </button>
              </div>
            </div>

            {/* System Health */}
            <div className="card p-6">
              <h3 className="font-semibold text-gray-900 mb-4">System Health</h3>
              <div className="space-y-4">
                {Array.isArray(systemConnections) && systemConnections.map((system: any) => (
                  <div key={system.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`h-2 w-2 rounded-full ${
                        system.isConnected ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                      <span className="text-sm font-medium text-gray-700">
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
                
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Overall Health</span>
                    <span className="text-sm font-medium text-green-600">99.8%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '99.8%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Conversations */}
            <div className="card p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Recent Conversations</h3>
              <div className="space-y-3">
                {(conversations as any[]).slice(0, 3).map((conv) => (
                  <div key={conv.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 cursor-pointer transition-colors">
                    <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{conv.title}</p>
                      <p className="text-xs text-gray-500">
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
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-gray-600">All systems operational</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  Last sync: {currentTime.toLocaleTimeString()}
                </span>
              </div>
            </div>
            <Link to="/help">
              <button className="btn-ghost text-sm">Need Help?</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}