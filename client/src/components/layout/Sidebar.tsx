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
// Logo will be loaded from public directory

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  className?: string;
  isMobile?: boolean;
  onMobileClose?: () => void;
}

export default function Sidebar({ isCollapsed, onToggleCollapse, className = "", isMobile = false, onMobileClose }: SidebarProps) {
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
      isMobile ? 'w-64' : (isCollapsed ? 'w-16' : 'w-64')
    } ${className}`}
    style={{
      background: 'linear-gradient(180deg, #061A40 0%, #04496B 100%)',
      borderRight: '1px solid rgba(4, 139, 168, 0.2)'
    }}>
      {/* Header */}
      <div className={`${isCollapsed && !isMobile ? 'p-2' : 'p-4'}`} style={{borderBottom: '1px solid rgba(4, 139, 168, 0.2)'}}>
        <div className="flex items-center justify-between">
          {isCollapsed && !isMobile ? (
            <div className="flex flex-col items-center space-y-2 w-full">
              <div className="w-12 h-12 flex items-center justify-center">
                <img 
                  src="/logos/mobius-logo-dark.png" 
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
                    src="/logos/mobius-logo-dark.png" 
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
              {!isMobile && (
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
              )}
            </>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className={`flex-1 space-y-1 ${isCollapsed && !isMobile ? 'px-2 py-4' : 'px-4 py-4'}`}>
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <button
              key={item.path}
              className={`w-full flex items-center transition-all duration-200 ${
                isCollapsed && !isMobile
                  ? 'justify-center h-12 rounded-xl' 
                  : 'justify-start gap-3 px-3 py-3 rounded-lg'
              } ${
                isActive 
                  ? 'text-white' 
                  : 'text-gray-200 hover:text-white'
              }`}
              style={isActive ? {
                background: 'rgba(4, 139, 168, 0.3)',
                borderLeft: isCollapsed && !isMobile ? 'none' : '3px solid #048BA8',
                boxShadow: isCollapsed && !isMobile ? '0 2px 8px rgba(4, 139, 168, 0.3)' : 'none'
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
              onClick={() => {
                navigate(item.path);
                if (isMobile && onMobileClose) {
                  onMobileClose();
                }
              }}
              title={isCollapsed && !isMobile ? item.label : undefined}
            >
              <Icon size={isCollapsed && !isMobile ? 24 : 20} strokeWidth={isActive ? 2.5 : 2} />
              {(!isCollapsed || isMobile) && <span className="font-medium text-sm">{item.label}</span>}
            </button>
          );
        })}
      </nav>




    </div>
  );
}