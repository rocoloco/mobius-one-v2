import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@heroui/react';
import { 
  BarChart3, 
  Settings, 
  RefreshCw, 
  Home,
  Clock,
  CheckCircle
} from 'lucide-react';
import mobiusLogo from '@assets/Icon for dark background_1751426557804.png';

export default function EmptyQueuePage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Clear any existing progress when arriving at empty queue
    localStorage.removeItem('collectionsProgress');
  }, []);

  const handleLoadDemoData = () => {
    // Clear processed invoices to reload demo data
    localStorage.removeItem('processedInvoices');
    localStorage.removeItem('collectionsProgress');
    navigate('/collections');
  };

  const handleViewDashboard = () => {
    navigate('/');
  };

  const handleSettings = () => {
    navigate('/settings');
  };

  const handleRefresh = () => {
    // In a real app, this would check for new overdue invoices
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Simple Top Navigation */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src={mobiusLogo} 
              alt="Mobius" 
              className="w-8 h-8"
            />
            <h1 className="text-xl font-bold text-gray-900">Mobius One</h1>
          </div>
          <nav className="flex items-center gap-6">
            <button 
              onClick={handleViewDashboard}
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              Dashboard
            </button>
            <button 
              onClick={handleSettings}
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              Settings
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center p-4" style={{ minHeight: 'calc(100vh - 80px)' }}>
        <div className="text-center max-w-lg mx-auto">
          {/* Success Icon */}
          <div className="mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
          </div>

          {/* Main Message */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            All caught up! ✨
          </h1>

          {/* Subtitle */}
          <p className="text-gray-600 text-lg mb-8 leading-relaxed">
            No invoices need attention right now. We'll notify you when new ones arrive.
          </p>

          {/* Action Buttons */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button
                onClick={handleViewDashboard}
                className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-3"
                size="lg"
              >
                <BarChart3 className="w-5 h-5" />
                View Dashboard
              </Button>

              <Button
                onClick={handleLoadDemoData}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-3"
                size="lg"
              >
                <RefreshCw className="w-5 h-5" />
                Load Demo Data
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button
                onClick={handleRefresh}
                className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-3"
                size="lg"
              >
                <Clock className="w-5 h-5" />
                Check for New
              </Button>

              <Button
                onClick={handleSettings}
                className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-3"
                size="lg"
              >
                <Settings className="w-5 h-5" />
                Settings
              </Button>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="mt-12 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Impact</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">100%</div>
                <div className="text-sm text-gray-600">Queue Cleared</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">$127K</div>
                <div className="text-sm text-gray-600">Revenue Accelerated</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">12.5h</div>
                <div className="text-sm text-gray-600">Time Saved</div>
              </div>
            </div>
          </div>

          {/* Footer Message */}
          <p className="mt-8 text-sm text-gray-500">
            Great work! Your collection efforts are keeping cash flow healthy and relationships strong.
          </p>
        </div>
      </div>
    </div>
  );
}