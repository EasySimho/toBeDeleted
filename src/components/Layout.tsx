import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Clock, Home } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Layout: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  if (!user) return <Outlet />;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                CTI Isolare - Gestione Documenti
              </h1>
            </div>
            <div className="flex-grow"></div> {/* Aggiunto per aumentare la distanza */}
            <div className="flex items-center">
              <span className="text-sm text-gray-700 mr-4">
                {user.email}
              </span>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-800"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Esci
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar and Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <nav className="bg-blue-800 w-20 md:w-64 pt-6 flex flex-col items-center md:items-start">
          <Link 
            to="/" 
            className={`w-full text-white px-4 py-3 flex items-center justify-center md:justify-start hover:bg-blue-700 transition-colors ${
              location.pathname === '/' ? 'bg-blue-900' : ''
            }`}
          >
            <Home className="h-6 w-6" />
            <span className="ml-3 hidden md:block">Home</span>
          </Link>
          <Link 
            to="/deadlines" 
            className={`w-full text-white px-4 py-3 flex items-center justify-center md:justify-start hover:bg-blue-700 transition-colors ${
              location.pathname === '/deadlines' ? 'bg-blue-900' : ''
            }`}
          >
            <Clock className="h-6 w-6" />
            <span className="ml-3 hidden md:block">Scadenze</span>
          </Link>
        </nav>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;