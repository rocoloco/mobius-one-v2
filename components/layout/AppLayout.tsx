'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Button,
  Chip,
  Avatar,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Input
} from '@heroui/react'
import {
  LayoutDashboard,
  Users,
  FileText,
  Brain,
  BarChart3,
  Settings,
  Search,
  Menu,
  X,
  CheckCircle,
  Bell,
  LogOut,
  User
} from 'lucide-react'

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  description: string
}

const navigation: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
    description: 'Overview and key metrics'
  },
  {
    name: 'Customers',
    href: '/customers',
    icon: Users,
    description: 'Customer accounts and profiles'
  },
  {
    name: 'Invoices',
    href: '/invoices',
    icon: FileText,
    description: 'Invoice management and aging'
  },
  {
    name: 'Recommendations',
    href: '/recommendations',
    icon: Brain,
    description: 'AI-powered collection suggestions'
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    description: 'Performance reports and insights'
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
    description: 'Application preferences'
  }
]

interface AppLayoutProps {
  children: React.ReactNode
}

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()
  
  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200 dark:border-gray-700">
        <Link href="/" className="flex items-center space-x-3">
          <Image
            src="/favicon-dark.svg"
            alt="Mobius One"
            width={32}
            height={32}
          />
          <span className="text-xl font-semibold text-white whitespace-nowrap">
            Mobius One
          </span>
        </Link>
        {onClose && (
          <Button
            isIconOnly
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onPress={onClose}
            data-testid="close-sidebar"
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`supabase-nav-item ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <Icon
                className={`mr-3 h-5 w-5 transition-colors ${
                  isActive ? 'text-primary' : 'text-gray-400 group-hover:text-gray-500'
                }`}
              />
              <div>
                <div>{item.name}</div>
                {isActive && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {item.description}
                  </div>
                )}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* AI Status */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <Chip 
          color="success" 
          variant="flat"
          startContent={<CheckCircle className="h-4 w-4" />}
          className="w-full"
        >
          AI Engine Active
        </Chip>
      </div>
    </div>
  )
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024)
    }
    
    checkDesktop()
    window.addEventListener('resize', checkDesktop)
    return () => window.removeEventListener('resize', checkDesktop)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="lg:flex h-screen">
        {/* Desktop Sidebar */}
        <div className="w-64 supabase-sidebar shadow-lg fixed left-0 top-0 h-full z-30 max-lg:hidden" data-testid="sidebar">
          <SidebarContent />
        </div>

        {/* Mobile Sidebar */}
        <div
          className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 supabase-sidebar shadow-lg transform transition-transform duration-300 ease-in-out ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          data-testid="mobile-sidebar"
        >
          <SidebarContent onClose={() => setSidebarOpen(false)} />
        </div>

        {/* Main content */}
        <div className="min-h-screen" style={{ marginLeft: isDesktop ? '256px' : '0px' }}>
          {/* Top header */}
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-4">
              <Button
                isIconOnly
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onPress={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>

              {/* Search */}
              <div className="hidden sm:block">
                <Input
                  placeholder="Search customers, invoices..."
                  startContent={<Search className="h-4 w-4 text-gray-400" />}
                  className="w-80"
                  size="sm"
                />
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <Button isIconOnly variant="ghost" size="sm">
                <Bell className="h-5 w-5" />
              </Button>

              {/* User menu */}
              <Dropdown placement="bottom-end">
                <DropdownTrigger>
                  <Avatar
                    as="button"
                    size="sm"
                    name="User"
                    className="cursor-pointer"
                  />
                </DropdownTrigger>
                <DropdownMenu aria-label="User menu">
                  <DropdownItem key="profile" startContent={<User className="h-4 w-4" />}>
                    Profile
                  </DropdownItem>
                  <DropdownItem key="settings" startContent={<Settings className="h-4 w-4" />}>
                    Settings
                  </DropdownItem>
                  <DropdownItem 
                    key="logout" 
                    color="danger"
                    startContent={<LogOut className="h-4 w-4" />}
                  >
                    Sign Out
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}