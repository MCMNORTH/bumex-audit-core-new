import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Home, Users, FolderOpen, FileText, Settings, Menu, X, LogOut, ChevronDown, ChevronRight, Monitor, Target } from 'lucide-react';
import { useTranslation } from '@/contexts/TranslationContext';
import { LanguageSelector } from '@/components/LanguageSelector';
const getNavigationItems = (t: (key: string) => string) => [{
  name: t('nav.dashboard'),
  href: '/dashboard',
  icon: Home,
  roles: ['dev', 'admin', 'semi-admin', 'users']
}, {
  name: t('nav.clients'),
  href: '/clients',
  icon: Users,
  roles: ['dev', 'admin', 'semi-admin', 'users']
}, {
  name: 'My Projects',
  href: '/my-projects',
  icon: FolderOpen,
  roles: ['dev', 'admin', 'semi-admin', 'users']
}, {
  name: t('nav.projects'),
  href: '/projects',
  icon: FolderOpen,
  roles: ['dev', 'admin', 'semi-admin']
}, {
  name: 'IT Section',
  icon: Monitor,
  roles: ['dev'],
  isParent: true,
  children: [
    {
      name: 'Users',
      href: '/users',
      icon: Users,
      roles: ['dev']
    },
    {
      name: t('nav.logs'),
      href: '/logs',
      icon: FileText,
      roles: ['dev']
    },
    {
      name: 'Cycles',
      href: '/cycles',
      icon: Target,
      roles: ['dev']
    },
    {
      name: t('nav.appControl'),
      href: '/app-control',
      icon: Settings,
      roles: ['dev']
    }
  ]
}];
export const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const {
    user,
    logout
  } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();
  const navigationItems = getNavigationItems(t);
  const filteredItems = navigationItems.filter(item => user && item.roles.includes(user.role));

  const toggleSection = (itemName: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(itemName)) {
      newExpanded.delete(itemName);
    } else {
      newExpanded.add(itemName);
    }
    setExpandedSections(newExpanded);
  };
  const handleLogout = async () => {
    try {
      await logout();
      } catch (error) {
        // Silent error for logout
      }
  };
  return <>
      <Button variant="ghost" size="icon" className="fixed top-4 left-4 z-50 lg:hidden" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X /> : <Menu />}
      </Button>

      <div className={cn("fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0", isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0")}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-start h-16 px-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <img src="https://storage.googleapis.com/flutterflow-io-6f20.appspot.com/projects/real-estate-dashboard-u-i-kit-6wf0w2/assets/z0klmkn6b7a7/Untitled_design_(2).png" alt="BUMEX Logo" className="w-32 h-32 object-contain" />
              
            </div>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-2">
            {filteredItems.map(item => {
              const Icon = item.icon;
              
              if (item.isParent && item.children) {
                const isExpanded = expandedSections.has(item.name);
                const filteredChildren = item.children.filter(child => user && child.roles.includes(user.role));
                
                return (
                  <div key={item.name}>
                    <div
                      className="flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors text-gray-600 hover:bg-gray-100 hover:text-gray-900 cursor-pointer"
                      onClick={() => toggleSection(item.name)}
                    >
                      <Icon className="mr-3 h-5 w-5" />
                      <span className="flex-1">{item.name}</span>
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </div>
                    
                    {isExpanded && (
                      <div 
                        className="ml-6 mt-1 space-y-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {filteredChildren.map(child => {
                          const ChildIcon = child.icon;
                          const isActive = location.pathname === child.href;
                          return (
                            <Link
                              key={child.name}
                              to={child.href}
                              className={cn(
                                "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                                isActive ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                              )}
                              onClick={() => setIsOpen(false)}
                            >
                              <ChildIcon className="mr-3 h-4 w-4" />
                              {child.name}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }
              
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                    isActive ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="p-4">
            <div className="mb-3">
              <LanguageSelector />
            </div>
            
            <Button 
              variant="ghost" 
              onClick={handleLogout} 
              className="flex items-center justify-start w-full px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors mb-3"
            >
              <LogOut className="mr-3 h-4 w-4" />
              {t('nav.logout')}
            </Button>
            
            <div className="border-t border-gray-200 pt-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-700">
                    {user?.first_name?.[0]}{user?.last_name?.[0]}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.first_name} {user?.last_name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user?.email}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isOpen && <div className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden" onClick={() => setIsOpen(false)} />}
    </>;
};
