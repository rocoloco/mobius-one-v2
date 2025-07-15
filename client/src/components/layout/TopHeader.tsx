import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, User, Settings as SettingsIcon, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export default function TopHeader() {
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const { logout } = useAuth();
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };

    if (isProfileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileDropdownOpen]);

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/' || location.pathname === '/collections';
    }
    return location.pathname === path;
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Navigation */}
          <div className="flex items-center gap-8">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <img 
                src="/logos/mobius-logo-light.png" 
                alt="Mobius Logo" 
                className="w-8 h-8 object-contain"
              />
              <span className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Mobius One
              </span>
            </Link>

            {/* Navigation */}
            <nav className="flex items-center gap-6">
              <Link 
                to="/" 
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive('/') 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Collections
              </Link>
              <Link 
                to="/settings" 
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive('/settings') 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Settings
              </Link>
              <Link 
                to="/help" 
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive('/help') 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Help
              </Link>
            </nav>
          </div>

          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
            >
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-blue-600" />
              </div>
              <span>Test User</span>
              <ChevronDown className="w-4 h-4" />
            </button>

            {isProfileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                <div className="py-1">
                  <Link
                    to="/settings"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={() => setIsProfileDropdownOpen(false)}
                  >
                    <SettingsIcon className="w-4 h-4" />
                    Settings
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setIsProfileDropdownOpen(false);
                    }}
                    className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}