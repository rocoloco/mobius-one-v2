import { Breadcrumbs, BreadcrumbItem } from "@heroui/react";
import { ChevronRight, Home } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

export default function BreadcrumbNavigation() {
  const location = useLocation();
  const navigate = useNavigate();

  const pathSegments = location.pathname.split('/').filter(Boolean);
  
  const getBreadcrumbItems = () => {
    const items = [{ label: 'Home', path: '/' }];
    
    let currentPath = '';
    pathSegments.forEach(segment => {
      currentPath += `/${segment}`;
      items.push({
        label: segment.charAt(0).toUpperCase() + segment.slice(1),
        path: currentPath
      });
    });
    
    return items;
  };

  const breadcrumbItems = getBreadcrumbItems();

  if (breadcrumbItems.length <= 1) {
    return null;
  }

  return (
    <div className="p-4 border-b border-gray-200 bg-white">
      <Breadcrumbs
        separator={<ChevronRight size={14} className="text-gray-400" />}
        className="font-mono"
      >
        {breadcrumbItems.map((item, index) => (
          <BreadcrumbItem
            key={item.path}
            isCurrent={index === breadcrumbItems.length - 1}
            className={`text-sm ${
              index === breadcrumbItems.length - 1 
                ? 'text-orange-600 font-bold' 
                : 'text-gray-600 hover:text-orange-500 cursor-pointer'
            }`}
            onClick={() => index < breadcrumbItems.length - 1 && navigate(item.path)}
          >
            {index === 0 && <Home size={14} className="mr-1" />}
            {item.label.toUpperCase()}
          </BreadcrumbItem>
        ))}
      </Breadcrumbs>
    </div>
  );
}