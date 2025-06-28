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
    { path: '/', label: 'Home', icon: Home },
    { path: '/history', label: 'History', icon: History },
    { path: '/settings', label: 'Settings', icon: Settings },
    { path: '/help', label: 'Help', icon: HelpCircle }
  ];

  const connectedSystems = Array.isArray(systemConnections) 
    ? systemConnections.filter((conn: any) => conn.isConnected)
    : [];

  return (
    <div className={`h-full bg-background border-r border-border flex flex-col transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    } ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Home className="text-primary-foreground" size={16} />
              </div>
              <div>
                <h2 className="font-semibold text-lg text-foreground">
                  Mobius One
                </h2>
                <p className="text-xs text-muted-foreground">Business AI</p>
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
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <button
              key={item.path}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-150 ${
                isActive 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
              onClick={() => navigate(item.path)}
            >
              <Icon size={18} />
              {!isCollapsed && <span className="font-medium">{item.label}</span>}
            </button>
          );
        })}
      </nav>



      {/* User Profile */}
      {!isCollapsed && user && (
        <div className="p-4 border-t border-border space-y-3">
          <div className="flex items-center space-x-3">
            <Avatar
              size="sm"
              name={(user as any)?.username?.substring(0, 2).toUpperCase() || "U"}
              className="bg-primary text-primary-foreground"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {(user as any)?.username || "User"}
              </p>
              <p className="text-xs text-muted-foreground">
                Business User
              </p>
            </div>
          </div>
          
          <Button
            size="sm"
            variant="bordered"
            className="w-full text-xs"
            onClick={() => {
              localStorage.setItem('logout', 'true');
              window.location.href = '/';
            }}
          >
            Sign Out
          </Button>
        </div>
      )}
    </div>
  );
}