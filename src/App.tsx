import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import MainLayout from './layouts/MainLayout';
import LoginPage from './pages/LoginPage';
import CompaniesPage from './pages/CompaniesPage';
import CompanyPage from './pages/CompanyPage';
import DeadlinesPage from './pages/DeadlinesPage';
import AddCompanyPage from './pages/AddCompanyPage';
import AddEmployeePage from './pages/AddEmployeePage';
import { supabase } from './lib/supabase';
import AddCompanyDocumentPage from './pages/AddCompanyDocumentPage';
import NotFoundPage from './pages/NotFoundPage';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isAuthenticated === null) {
    return <div className="flex h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
    </div>;
  }

  return isAuthenticated ? (
    <MainLayout>
      {children}
    </MainLayout>
  ) : (
    <Navigate to="/login" replace />
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <CompaniesPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/companies"
          element={
            <PrivateRoute>
              <CompaniesPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/company/new"
          element={
            <PrivateRoute>
              <AddCompanyPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/company/:id"
          element={
            <PrivateRoute>
              <CompanyPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/company/:id/dipendenti/nuovo"
          element={
            <PrivateRoute>
              <AddEmployeePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/company/:id/documenti/nuovo"
          element={
            <PrivateRoute>
              <AddCompanyDocumentPage />
            </PrivateRoute>
          }
        />  
        
        <Route
          path="/deadlines"
          element={
            <PrivateRoute>
              <DeadlinesPage />
            </PrivateRoute>
          }
        />
        <Route
          path="*"
          element={
            <PrivateRoute>
              <NotFoundPage />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;