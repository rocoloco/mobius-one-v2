import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Button } from "@heroui/react";
import { Plus } from "lucide-react";
import Sidebar from "./Sidebar";
import BreadcrumbNavigation from "./Breadcrumb";
import { useNavigate } from "react-router-dom";

export default function Layout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const showBreadcrumbs = location.pathname !== '/' && location.pathname !== '/query';
  const showQuickAction = location.pathname !== '/query';

  const handleNewQuery = () => {
    navigate('/query');
  };

  return (
    <div className="h-screen flex bg-gradient-to-br from-orange-50 to-red-50">
      {/* Sidebar */}
      <Sidebar 
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Breadcrumb Navigation */}
        {showBreadcrumbs && <BreadcrumbNavigation />}

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>

        {/* Quick Action Button */}
        {showQuickAction && (
          <Button
            color="primary"
            isIconOnly
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg bg-gradient-to-r from-orange-500 to-red-500"
            onClick={handleNewQuery}
          >
            <Plus size={24} />
          </Button>
        )}
      </div>
    </div>
  );
}