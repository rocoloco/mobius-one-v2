import { Outlet, useLocation } from "react-router-dom";
import { Button } from "@heroui/react";
import { Plus } from "lucide-react";
import BreadcrumbNavigation from "./Breadcrumb";
import { useNavigate } from "react-router-dom";

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();

  const showBreadcrumbs = location.pathname !== '/';
  const showQuickAction = location.pathname !== '/';

  const handleNewQuery = () => {
    navigate('/');
  };

  return (
    <div className="h-screen flex flex-col" style={{background: 'linear-gradient(180deg, #FAFBFC 0%, rgba(193, 237, 204, 0.02) 100%)'}}>
      {/* Main Content Area - Now Full Width */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Breadcrumb Navigation */}
        {showBreadcrumbs && <BreadcrumbNavigation />}

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}