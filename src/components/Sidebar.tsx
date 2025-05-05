import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Building2, Calendar } from 'lucide-react';
import { cn } from '../lib/utils';

const Sidebar: React.FC = () => {
  const location = useLocation();

  const navigation = [
    { name: 'Aziende', href: '/companies', icon: Building2 },
    { name: 'Scadenze', href: '/deadlines', icon: Calendar }
  ];

  return (
    <aside className="fixed top-16 left-0 bottom-0 w-64 bg-white border-r border-gray-200">
      <nav className="p-4">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className={cn(
                    'flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors',
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar; 