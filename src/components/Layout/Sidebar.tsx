import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Home, Users, FolderOpen, FileText, Settings, Menu, X, LogOut } from 'lucide-react';
const navigationItems = [{
  name: 'Dashboard',
  href: '/dashboard',
  icon: Home,
  roles: ['dev', 'partner', 'manager', 'incharge', 'staff']
}, {
  name: 'Clients',
  href: '/clients',
  icon: Users,
  roles: ['dev', 'partner', 'manager', 'incharge']
}, {
  name: 'Projects',
  href: '/projects',
  icon: FolderOpen,
  roles: ['dev', 'partner', 'manager', 'incharge', 'staff']
}, {
  name: 'Logs',
  href: '/logs',
  icon: FileText,
  roles: ['dev', 'partner', 'manager', 'incharge', 'staff']
}, {
  name: 'App Control',
  href: '/app-control',
  icon: Settings,
  roles: ['dev']
}];
export const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    user,
    logout
  } = useAuth();
  const location = useLocation();
  const filteredItems = navigationItems.filter(item => user && item.roles.includes(user.role));
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
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
            const isActive = location.pathname === item.href;
            return <Link key={item.name} to={item.href} className={cn("flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors", isActive ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900")} onClick={() => setIsOpen(false)}>
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>;
          })}
          </nav>

          <div className="p-4 border-t border-gray-200">
            <div className="flex flex-col space-y-3">
              <Button 
                variant="ghost" 
                onClick={handleLogout} 
                className="flex items-center justify-start w-full px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors"
              >
                <LogOut className="mr-3 h-4 w-4" />
                Log out
              </Button>
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
                  <p className="text-xs text-gray-500 uppercase">
                    {user?.role}
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
