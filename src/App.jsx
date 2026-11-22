import { useState } from 'react';
import Dashboard from './Dashboard';
import Landing from './Landing';
import LoginRegister from './LoginRegister';
import { useAuth } from './useAuth';

function App() {
  const { isLoggedIn, userRole, userId, userNames, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(null); // 'login', 'register' o null
  const [showDashboard, setShowDashboard] = useState(true);

  console.log("App.jsx State:", { isLoggedIn, userRole });

  // Si el usuario tiene privilegios (admin o supervisor) y está logueado, vamos al Dashboard
  const canAccessDashboard = isLoggedIn && (userRole === 'admin' || userRole === 'supervisor');

  if (canAccessDashboard && showDashboard) {
    return <Dashboard onGoHome={() => setShowDashboard(false)} />;
  }

  // En cualquier otro caso, mostramos la Landing Page
  return (
    <div className="relative">
      <Landing 
        isLoggedIn={isLoggedIn} 
        userRole={userRole}
        userId={userId}
        userNames={userNames}
        onOpenLoginRegister={(mode) => {
          if (mode === 'dashboard') setShowDashboard(true);
          else setShowAuthModal(mode);
        }} 
        onLogout={logout}
      />

      {showAuthModal && (
        <LoginRegister 
          initialMode={showAuthModal}
          onAuthSuccess={() => setShowAuthModal(null)} 
        />
      )}
    </div>
  );
}

export default App;
