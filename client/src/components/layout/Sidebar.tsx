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
  ChevronRight,
  DollarSign,
  MessageSquare
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import mobiusLogo from "@assets/Icon for dark background_1751426557804.png";

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
    { path: '/', label: 'Collections', icon: DollarSign },
    { path: '/chat', label: 'Chat', icon: MessageSquare },
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
      <div className={`${isCollapsed ? 'p-2' : 'p-4'}`} style={{borderBottom: '1px solid rgba(4, 139, 168, 0.2)'}}>
        <div className="flex items-center justify-between">
          {isCollapsed ? (
            <div className="flex flex-col items-center space-y-2 w-full">
              <div className="w-12 h-12 flex items-center justify-center">
                <img 
                  src={mobiusLogo} 
                  alt="Mobius Logo" 
                  className="w-10 h-10 object-contain"
                />
              </div>
              <Button
                isIconOnly
                variant="flat"
                size="sm"
                onClick={onToggleCollapse}
                className="text-white hover:bg-white/10 h-8 w-8 min-w-8 rounded-lg"
                style={{
                  background: 'rgba(4, 139, 168, 0.2)',
                  transition: 'all 0.2s ease'
                }}
              >
                <ChevronRight size={16} />
              </Button>
            </div>
          ) : (
            <>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
                  <img 
                    src={mobiusLogo} 
                    alt="Mobius Logo" 
                    className="w-10 h-10 object-contain"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-brand text-lg text-white truncate">
                    Mobius One
                  </h2>
                </div>
              </div>
              <Button
                isIconOnly
                variant="flat"
                size="sm"
                onClick={onToggleCollapse}
                className="text-white hover:bg-white/10 h-8 w-8 min-w-8 rounded-lg"
                style={{
                  background: 'rgba(4, 139, 168, 0.2)',
                  transition: 'all 0.2s ease'
                }}
              >
                <ChevronLeft size={16} />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className={`flex-1 space-y-1 ${isCollapsed ? 'px-2 py-4' : 'px-4 py-4'}`}>
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <button
              key={item.path}
              className={`w-full flex items-center transition-all duration-200 ${
                isCollapsed 
                  ? 'justify-center h-12 rounded-xl' 
                  : 'justify-start gap-3 px-3 py-3 rounded-lg'
              } ${
                isActive 
                  ? 'text-white' 
                  : 'text-gray-200 hover:text-white'
              }`}
              style={isActive ? {
                background: 'rgba(4, 139, 168, 0.3)',
                borderLeft: isCollapsed ? 'none' : '3px solid #048BA8',
                boxShadow: isCollapsed ? '0 2px 8px rgba(4, 139, 168, 0.3)' : 'none'
              } : {}}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(4, 139, 168, 0.15)';
                  e.currentTarget.style.transform = 'scale(1.02)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = '';
                  e.currentTarget.style.transform = 'scale(1)';
                }
              }}
              onClick={() => navigate(item.path)}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon size={isCollapsed ? 24 : 20} strokeWidth={isActive ? 2.5 : 2} />
              {!isCollapsed && <span className="font-medium text-sm">{item.label}</span>}
            </button>
          );
        })}
      </nav>




    </div>
  );
}