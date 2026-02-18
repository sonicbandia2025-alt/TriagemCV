import React, { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { AdminDashboard } from './components/AdminDashboard';
import { ClientDashboard } from './components/ClientDashboard'; // Using the new component
import { RoleSelection } from './components/RoleSelection';
import { User } from './types';
import { authService } from './services/authService';
import { Loader2 } from 'lucide-react';

type AuthMode = 'SELECTION' | 'LOGIN_CLIENT' | 'LOGIN_ADMIN';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authMode, setAuthMode] = useState<AuthMode>('SELECTION');

  // Initialize Auth Listener
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged(async (user) => {
      // Security Check: If logging in as Admin but user is NOT admin
      if (user && authMode === 'LOGIN_ADMIN' && !user.isAdmin) {
        alert("Acesso Negado: Este usuário não possui privilégios administrativos.");
        await authService.logout();
        setCurrentUser(null);
        setIsLoadingAuth(false);
        return;
      }

      setCurrentUser(user);
      setIsLoadingAuth(false);
    });

    return () => unsubscribe();
  }, [authMode]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    authService.logout();
    setAuthMode('SELECTION');
  };

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  // --- NOT AUTHENTICATED FLOW ---
  if (!currentUser) {
    if (authMode === 'SELECTION') {
      return (
        <RoleSelection 
          onSelect={(role) => setAuthMode(role === 'client' ? 'LOGIN_CLIENT' : 'LOGIN_ADMIN')} 
        />
      );
    }
    
    return (
      <Login 
        onLogin={handleLogin} 
        mode={authMode === 'LOGIN_CLIENT' ? 'client' : 'admin'}
        onBack={() => setAuthMode('SELECTION')}
      />
    );
  }

  // --- AUTHENTICATED FLOW ---

  // 1. Admin
  if (currentUser.isAdmin) {
    return <AdminDashboard currentUser={currentUser} onLogout={handleLogout} />;
  }

  // 2. Client (Now uses the dedicated robust dashboard)
  return <ClientDashboard currentUser={currentUser} onLogout={handleLogout} />;
};

export default App;