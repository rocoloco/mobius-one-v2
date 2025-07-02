import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown } from "lucide-react";

export default function ProfileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const { data: user } = useQuery({
    queryKey: ['/api/user'],
    enabled: true
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!user) return null;

  const getFirstName = (fullName: string) => {
    if (!fullName) return "User";
    const firstName = fullName.split(' ')[0];
    return firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
  };

  const firstName = getFirstName((user as any)?.name);
  const initials = (user as any)?.initials || firstName.substring(0, 2).toUpperCase();

  return (
    <div 
      ref={menuRef}
      style={{
        position: 'relative',
        zIndex: 1000
      }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          background: 'white',
          border: '2px solid #E2E8F0',
          borderRadius: '8px',
          padding: '8px 12px',
          cursor: 'pointer',
          fontFamily: 'Inter, sans-serif',
          fontSize: '14px',
          color: '#4A5568',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = '#048BA8';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = '#E2E8F0';
        }}
      >
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: '#048BA8',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: '600',
          fontSize: '14px',
          marginRight: '8px'
        }}>
          {initials}
        </div>
        <span style={{marginRight: '8px', fontWeight: '500'}}>{firstName}</span>
        <ChevronDown 
          size={16} 
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease'
          }}
        />
      </button>
      
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: '0',
          marginTop: '4px',
          background: 'white',
          border: '2px solid #E2E8F0',
          borderRadius: '8px',
          minWidth: '220px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          zIndex: 1001
        }}>
          <div style={{
            padding: '16px',
            borderBottom: '1px solid #E2E8F0'
          }}>
            <div style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: '600',
              color: '#061A40',
              fontSize: '14px',
              marginBottom: '4px'
            }}>
              {firstName}
            </div>
            <div style={{
              fontFamily: 'Inter, sans-serif',
              color: '#718096',
              fontSize: '12px',
              marginBottom: '2px'
            }}>
              john@company.com
            </div>
            <div style={{
              fontFamily: 'Inter, sans-serif',
              color: '#718096',
              fontSize: '12px'
            }}>
              Business User
            </div>
          </div>
          
          <div style={{padding: '8px 0'}}>
            <a 
              href="/profile" 
              style={{
                display: 'block',
                padding: '8px 16px',
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                color: '#4A5568',
                textDecoration: 'none',
                transition: 'background 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#F7FAFC';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              👤 Profile & Account
            </a>
            <a 
              href="/billing" 
              style={{
                display: 'block',
                padding: '8px 16px',
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                color: '#4A5568',
                textDecoration: 'none',
                transition: 'background 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#F7FAFC';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              💳 Billing & Subscription
            </a>
            <a 
              href="/team" 
              style={{
                display: 'block',
                padding: '8px 16px',
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                color: '#4A5568',
                textDecoration: 'none',
                transition: 'background 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#F7FAFC';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              👥 Team Management
            </a>
          </div>
          
          <div style={{borderTop: '1px solid #E2E8F0', padding: '8px 0'}}>
            <button 
              onClick={() => {
                localStorage.setItem('logout', 'true');
                window.location.href = '/';
              }}
              style={{
                display: 'block',
                width: '100%',
                padding: '8px 16px',
                background: 'none',
                border: 'none',
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                color: '#E53E3E',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'background 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#FED7D7';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              🚪 Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}