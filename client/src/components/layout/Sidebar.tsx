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
    <div className={`h-full flex flex-col transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    } ${className}`}
    style={{
      background: 'linear-gradient(180deg, #061A40 0%, #04496B 100%)',
      borderRight: '1px solid rgba(4, 139, 168, 0.2)'
    }}>
      {/* Header */}
      <div className="p-4" style={{borderBottom: '1px solid rgba(4, 139, 168, 0.2)'}}>
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
                <svg 
                  width="32" 
                  height="32" 
                  viewBox="0 0 100 100" 
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-8 h-8"
                >
                  <defs>
                    <linearGradient id="mobiusGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" style={{stopColor: '#048BA8', stopOpacity: 1}} />
                      <stop offset="100%" style={{stopColor: '#C1EDCC', stopOpacity: 1}} />
                    </linearGradient>
                  </defs>
                  {/* Left part of M */}
                  <path d="M10 15 L10 85 L25 85 L25 45 L40 70 L50 50 L65 75 L65 85 L80 85 L80 15 L65 15 L65 55 L50 30 L40 50 L25 25 L25 15 Z" 
                        fill="url(#mobiusGradient)" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-semibold text-lg text-white truncate">
                  Mobius One
                </h2>
                <p className="text-xs text-gray-200">Business AI</p>
              </div>
            </div>
          )}
          <Button
            isIconOnly
            variant="flat"
            size="sm"
            onClick={onToggleCollapse}
            className="text-white hover:bg-white/10 ml-auto"
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
                  ? 'text-white border-l-3 border-l-4' 
                  : 'text-gray-200 hover:text-white'
              }`}
              style={isActive ? {
                background: 'rgba(4, 139, 168, 0.2)',
                borderLeft: '3px solid #048BA8'
              } : {}}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(4, 139, 168, 0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = '';
                }
              }}
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
        <div className="p-4 space-y-3" style={{borderTop: '1px solid rgba(4, 139, 168, 0.2)'}}>
          <div className="flex items-center space-x-3">
            <Avatar
              size="sm"
              name={(user as any)?.username?.substring(0, 2).toUpperCase() || "U"}
              className="bg-teal-500 text-white"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {(user as any)?.username || "User"}
              </p>
              <p className="text-xs text-gray-200">
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