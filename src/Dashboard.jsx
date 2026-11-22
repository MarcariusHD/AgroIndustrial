import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import Header from './Header';
import StatCard from './StatCard';
import { 
  Home as HomeIcon, 
  Cpu, 
  Bell, 
  ShieldAlert, 
  Thermometer, 
  Bug
} from 'lucide-react';
import { useAuth } from './useAuth';

// Importar todos los módulos del dashboard
import EstadoInvernaderos from './EstadoInvernaderos';
import GestionCentralInvernaderos from './GestionCentralInvernaderos';
import DispositivosActivos from './DispositivosActivos';
import AlertasRecientes from './AlertasRecientes';
import AlertasTemperatura from './AlertasTemperatura';
import RiesgosPlagas from './RiesgosPlagas';
import MonitoreoGeneral from './MonitoreoGeneral';
import Usuarios from './Usuarios';
import AdminOnboarding from './AdminOnboarding';

const Dashboard = ({ onGoHome }) => {
  const { userId, userRole, userNames, logout } = useAuth();
  const [activeModule, setActiveModule] = useState('estado_invernaderos');
  const [profilePic, setProfilePic] = useState("https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const sidebarKey = `sidebar_hidden_${userId}_${userRole}`;
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem(sidebarKey) === 'true');
  const toggleSidebar = () => {
    const hidden = !sidebarCollapsed;
    setSidebarCollapsed(hidden);
    localStorage.setItem(sidebarKey, String(hidden));
  };

  // Sincronizar foto única por ID de usuario
  useEffect(() => {
    if (userId) {
      const storedPic = localStorage.getItem(`user_profile_pic_${userId}`);
      if (storedPic) {
        setProfilePic(storedPic);
      } else {
        setProfilePic(`https://ui-avatars.com/api/?name=${userNames || 'User'}&background=0D8ABC&color=fff`);
      }
      
      // Chequeo de Onboarding de Administrador
      if (userRole === 'admin') {
        const hasCompletedOnboarding = localStorage.getItem(`admin_onboarding_completed_${userId}`);
        if (!hasCompletedOnboarding) {
          setShowOnboarding(true);
        }
      }
    }
  }, [userId, userNames, userRole]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file && userId) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result;
        setProfilePic(base64);
        localStorage.setItem(`user_profile_pic_${userId}`, base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const renderModule = () => {
    switch (activeModule) {
      case 'estado_invernaderos': return <EstadoInvernaderos userId={userId} userRole={userRole} />;
      case 'gestion_central_invernaderos': 
        if (userRole !== 'admin') return <EstadoInvernaderos userId={userId} userRole={userRole} />;
        return <GestionCentralInvernaderos userId={userId} userRole={userRole} />;
      case 'dispositivos_activos': return <DispositivosActivos userId={userId} />;
      case 'alertas_recientes': return <AlertasRecientes userId={userId} />;
      case 'alertas_temperatura': return <AlertasTemperatura />;
      case 'alertas_plagas':
      case 'gestor_riesgos': return <RiesgosPlagas userId={userId} userNames={userNames} />;
      case 'monitoreo_general': return <MonitoreoGeneral userId={userId} />;
      case 'usuario': 
        if (userRole !== 'admin') return <EstadoInvernaderos userId={userId} userRole={userRole} />;
        return <Usuarios />;
      default: return <div className="text-center py-20 text-gray-400 font-bold uppercase tracking-widest">Módulo no encontrado</div>;
    }
  };

  const handleOnboardingComplete = () => {
    localStorage.setItem(`admin_onboarding_completed_${userId}`, 'true');
    setShowOnboarding(false);
  };

  return (
    <div className="flex min-h-screen bg-gray-100 relative">
      {showOnboarding && (
        <AdminOnboarding 
          userNames={userNames} 
          onComplete={handleOnboardingComplete} 
        />
      )}
      
      <Sidebar
        activeModule={activeModule}
        setActiveModule={(mod) => {
          if (mod === 'home') onGoHome();
          else setActiveModule(mod);
        }}
        profilePic={profilePic}
        handlePhotoChange={handlePhotoChange}
        userNames={userNames}
        userRole={userRole}
        userId={userId}
        collapsed={sidebarCollapsed}
        onToggle={toggleSidebar}
        logout={logout}
      />

      <main className="flex-grow min-w-0 p-10 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeModule}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="bg-white rounded-[40px] shadow-sm p-10 min-h-[600px] border border-gray-100"
          >
            {renderModule()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Dashboard;
