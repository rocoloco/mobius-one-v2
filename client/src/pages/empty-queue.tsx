import { useEffect } from 'react';
import mobiusLogo from '@assets/Icon for dark background_1751426557804.png';

export default function EmptyQueuePage() {
  useEffect(() => {
    // Clear any existing progress when arriving at empty queue
    localStorage.removeItem('collectionsProgress');
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="text-center max-w-md mx-auto">
        {/* Mobius Logo */}
        <div className="mb-8">
          <img 
            src={mobiusLogo} 
            alt="Mobius" 
            className="w-16 h-16 mx-auto opacity-80"
          />
        </div>
        
        {/* Main Message */}
        <h1 className="text-2xl font-semibold text-gray-800 mb-4">
          No invoices need attention right now ✨
        </h1>
        
        {/* Subtitle */}
        <p className="text-gray-600 text-lg leading-relaxed">
          We'll notify you when new ones arrive
        </p>
      </div>
    </div>
  );
}