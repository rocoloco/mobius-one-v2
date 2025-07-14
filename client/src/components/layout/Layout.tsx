import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Button } from "@heroui/react";
import { Plus } from "lucide-react";
import Sidebar from "./Sidebar";
import BreadcrumbNavigation from "./Breadcrumb";
import { useNavigate } from "react-router-dom";

export default function Layout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const showBreadcrumbs = location.pathname !== '/';
  const showQuickAction = location.pathname !== '/';

  const handleNewQuery = () => {
    navigate('/');
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="h-screen flex" style={{background: 'linear-gradient(180deg, #FAFBFC 0%, rgba(193, 237, 204, 0.02) 100%)'}}>
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar 
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        className={`${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 fixed md:static z-50 transition-transform duration-300 ease-in-out`}
        isMobile={true}
        onMobileClose={() => setMobileMenuOpen(false)}
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
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg bg-primary hover:bg-primary/90"
            onClick={handleNewQuery}
          >
            <Plus size={24} />
          </Button>
        )}
      </div>
    </div>
  );
}