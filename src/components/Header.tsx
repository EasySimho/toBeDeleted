import React from 'react';
import { LogOut } from 'lucide-react';
import Button from './Button';
import { useAuth } from '../contexts/AuthContext';


const Header: React.FC = () => {
  const { user, signOut } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50">
      <div className="flex items-center justify-between h-full px-6">
        <div className="flex items-center space-x-4">
          <img src={"/Cti-Isolare-logo.svg"} alt="Logo" className="ml-2 h-10 w-10" />
        </div>
        
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">{user?.email}</span>
          <Button variant="ghost" className="flex items-center" size="icon" onClick={signOut}>
            <span className="text-sm">Logout</span>
            <LogOut className="ml-2 h-5 w-5" />

          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header; 