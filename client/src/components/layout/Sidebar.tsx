import { useState } from "react";
import { 
  Card, 
  CardBody, 
  Button, 
  Divider, 
  Avatar,
  Chip
} from "@heroui/react";
import { 
  Home,
  BarChart3,
  MessageSquare,
  Settings,
  History,
  HelpCircle,
  Menu,
  X,
  Terminal,
  Zap,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  className?: string;
}

export default function Sidebar({ isCollapsed, onToggleCollapse, className = "" }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const { data: user } = useQuery({
    queryKey: ['/api/user'],
    enabled: true
  });

  const { data: systemConnections = [] } = useQuery({
    queryKey: ['/api/systems'],
    enabled: true
  });

  const navigationItems = [
    { path: '/', label: 'Dashboard', icon: BarChart3 },
    { path: '/query', label: 'Query', icon: MessageSquare },
    { path: '/history', label: 'History', icon: History },
    { path: '/settings', label: 'Settings', icon: Settings },
    { path: '/help', label: 'Help', icon: HelpCircle }
  ];

  const connectedSystems = Array.isArray(systemConnections) 
    ? systemConnections.filter((conn: any) => conn.isConnected)
    : [];

  return (
    <div className={`h-full bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    } ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <Terminal className="text-white" size={16} />
              </div>
              <div>
                <h2 className="font-mono font-bold text-lg text-gray-900">
                  AI TERMINAL
                </h2>
                <p className="text-xs text-gray-500 font-mono">v2.0</p>
              </div>
            </div>
          )}
          <Button
            isIconOnly
            variant="flat"
            size="sm"
            onClick={onToggleCollapse}
            className="ml-auto"
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <Button
              key={item.path}
              variant={isActive ? "flat" : "light"}
              color={isActive ? "primary" : "default"}
              className={`w-full justify-start font-mono transition-all duration-150 ${
                isCollapsed ? 'px-0' : 'px-3'
              } ${isActive ? 'bg-gradient-to-r from-orange-100 to-red-100 text-orange-800' : ''}`}
              onClick={() => navigate(item.path)}
              startContent={<Icon size={18} />}
              style={{ minHeight: '44px' }}
            >
              {!isCollapsed && item.label.toUpperCase()}
            </Button>
          );
        })}
      </div>

      {/* System Status */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-200">
          <Card className="bg-gray-50 border border-gray-200">
            <CardBody className="p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-gray-700">
                  SYSTEM STATUS
                </span>
                <Chip 
                  size="sm"
                  color={connectedSystems.length > 0 ? "success" : "warning"}
                  variant="flat"
                  className="font-mono"
                >
                  {connectedSystems.length > 0 ? "ONLINE" : "OFFLINE"}
                </Chip>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="text-gray-500" size={14} />
                <span className="text-xs font-mono text-gray-600">
                  {connectedSystems.length}/{Array.isArray(systemConnections) ? systemConnections.length : 0} systems connected
                </span>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* User Profile */}
      {!isCollapsed && user && (
        <div className="p-4 border-t border-gray-200 space-y-3">
          <div className="flex items-center space-x-3">
            <Avatar
              size="sm"
              name={(user as any).username?.substring(0, 2).toUpperCase() || "U"}
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-mono font-bold"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-mono font-bold text-gray-900 truncate">
                {(user as any).username || "User"}
              </p>
              <p className="text-xs text-gray-500 font-mono">
                ADMIN
              </p>
            </div>
          </div>
          
          <Button
            size="sm"
            variant="bordered"
            className="w-full font-mono text-xs border-gray-300"
            onClick={() => {
              // Clear authentication and redirect to landing page
              localStorage.clear();
              sessionStorage.clear();
              window.location.href = '/';
            }}
          >
            SIGN OUT
          </Button>
        </div>
      )}
    </div>
  );
}