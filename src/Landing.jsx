import LandingProvider from './landing/LandingProvider';
import { useLanding } from './landing/LandingContext';
import LandingContent from './landing/LandingContent';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from './landingData';
import SoilAnalysisModal from './SoilAnalysisModal';

const Landing = () => {
  const {
    setCurrentView,
    currentView,
    setIsProfileOpen,
    isProfileOpen,
    profilePic,
    setShowProfileModal,
    setShowConfigModal,
    selectedLandingInvId,
    setIsSoilModalOpen,
    isSoilModalOpen,
    showProfileModal,
    showConfigModal,
    isDarkMode,
    setIsDarkMode,
    onOpenLoginRegister,
    isLoggedIn,
    userRole,
    userId,
    userNames,
    onLogout
  } = useLanding();

  return (
    <div className="min-h-screen bg-gray-100 font-sans transition-colors duration-300">
      <nav className="sticky top-0 z-50 flex items-center justify-between px-10 py-4 bg-[#031c06]/90 backdrop-blur-xl shadow-lg border-b border-white/5 transition-all duration-300">
        <div className="flex items-center h-16 group cursor-pointer" onClick={() => setCurrentView('home')}>
          <img src={`${API_BASE_URL}/static/logoAgroIndustrial.png`} alt="Logo" className="h-full w-auto transition-transform duration-300 group-hover:scale-110 drop-shadow-md" />
        </div>
        <div className="flex items-center gap-12">
          {["Inicio", "Temporada", "Cultivo", "Invernadero"].map((item) => {
            const val = item.toLowerCase() === 'inicio' ? 'home' : item.toLowerCase();
            return (
              <button 
                key={item} 
                onClick={() => setCurrentView(val)}
                className={`font-black text-[13px] uppercase transition-all duration-300 hover:-translate-y-0.5 ${currentView === val ? 'text-white border-b-2 border-white pb-1' : 'text-emerald-100/70 hover:text-white'}`}
              >
                {item}
              </button>
            );
          })}
          <div className="flex items-center gap-6">
            {isLoggedIn ? (
              <div className="flex items-center gap-4">
                {(userRole === 'admin' || userRole === 'supervisor') && (
                  <button onClick={() => onOpenLoginRegister('dashboard')} className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white px-6 py-2.5 rounded-full font-black text-[10px] uppercase shadow-lg shadow-orange-500/30 transition-all hover:scale-105">Panel</button>
                )}
                <div className="relative">
                  <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="w-11 h-11 rounded-full border-2 border-white/40 hover:border-white overflow-hidden shadow-lg transition-all hover:scale-105">
                    <img src={profilePic} alt="Perfil" className="w-full h-full object-cover" />
                  </button>
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-4 w-56 bg-white rounded-3xl shadow-2xl py-3 z-50 border border-gray-100 overflow-hidden transform origin-top-right transition-all animate-fadeIn">
                      <div className="px-6 py-3 mb-2 border-b border-gray-100 bg-gray-50/50">
                        <p className="text-xs font-black text-gray-800 uppercase tracking-wider">{userNames || 'Marco Calderon'}</p>
                        <p className="text-[10px] font-bold text-emerald-600 capitalize mt-1">{userRole || 'admin'}</p>
                      </div>
                      <button onClick={() => { setShowProfileModal(true); setIsProfileOpen(false); }} className="w-full px-6 py-2.5 text-left text-xs font-bold text-gray-600 hover:bg-emerald-50 flex items-center gap-3 transition-colors">
                        <span className="text-emerald-500">👤</span> Mi Perfil
                      </button>
                      <button onClick={() => { setShowConfigModal(true); setIsProfileOpen(false); }} className="w-full px-6 py-2.5 text-left text-xs font-bold text-gray-600 hover:bg-emerald-50 flex items-center gap-3 transition-colors">
                        <span className="text-emerald-500">⚙️</span> Configuración
                      </button>
                      <div className="my-2 border-t border-gray-100"></div>
                      <button onClick={onLogout} className="w-full px-6 py-2.5 text-left text-xs font-black uppercase text-red-500 hover:bg-red-50 flex items-center gap-3 transition-colors">
                        <span className="text-red-500">🚪</span> Cerrar Sesión
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <button onClick={() => onOpenLoginRegister('login')} className="bg-white text-[#207b25] px-7 py-2.5 rounded-full font-black text-[11px] uppercase shadow-lg shadow-black/10 hover:bg-[#031c06] hover:text-white transition-all hover:scale-105">Ingresar</button>
            )}
          </div>
        </div>
      </nav>

      <div className="space-y-12 min-h-[calc(100vh-80px)]">
        {<LandingContent />}
      </div>

      <SoilAnalysisModal 
        isOpen={isSoilModalOpen}
        onClose={() => setIsSoilModalOpen(false)}
        greenhouseId={selectedLandingInvId}
      />

      <AnimatePresence>
        {showProfileModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full border border-gray-100"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-gray-800 uppercase tracking-tight">Mi Perfil</h3>
                <button onClick={() => setShowProfileModal(false)} className="text-gray-400 hover:text-red-500 transition-colors">✖</button>
              </div>
              <div className="flex flex-col items-center space-y-4 mb-6">
                <img src={profilePic} alt="Perfil" className="w-24 h-24 rounded-full shadow-lg border-4 border-emerald-500" />
                <div className="text-center">
                  <p className="text-lg font-black text-gray-800 uppercase">{userNames || 'Usuario'}</p>
                  <p className="text-sm font-bold text-emerald-600 capitalize">{userRole || 'admin'}</p>
                </div>
              </div>
              <div className="space-y-3 border-t border-gray-100 pt-6">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-400 uppercase">ID de Usuario</span>
                  <span className="text-sm font-bold text-gray-700">#{userId || '0000'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-400 uppercase">Estado de Cuenta</span>
                  <span className="text-sm font-bold text-emerald-500 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Verificado y Activo</span>
                </div>
              </div>
              <button onClick={() => setShowProfileModal(false)} className="w-full mt-8 bg-[#207b25] text-white py-3 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-[#031c06] transition-colors">Cerrar</button>
            </motion.div>
          </div>
        )}

        {showConfigModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full border border-gray-100"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-gray-800 uppercase tracking-tight">Configuración</h3>
                <button onClick={() => setShowConfigModal(false)} className="text-gray-400 hover:text-red-500 transition-colors">✖</button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                  <div>
                    <p className="font-bold text-sm text-gray-800">Notificaciones</p>
                    <p className="text-xs text-gray-500">Recibir alertas en pantalla</p>
                  </div>
                  <input type="checkbox" className="w-4 h-4 text-emerald-600 bg-gray-100 border-gray-300 rounded" defaultChecked />
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                  <div>
                    <p className="font-bold text-sm text-gray-800">Modo Oscuro</p>
                    <p className="text-xs text-gray-500">{isDarkMode ? 'Activado' : 'Desactivado'}</p>
                  </div>
                  <button onClick={() => setIsDarkMode(!isDarkMode)} className={`w-12 h-6 rounded-full transition-colors flex items-center px-1 ${isDarkMode ? 'bg-emerald-500 justify-end' : 'bg-gray-300 justify-start'}`}>
                    <div className="w-4 h-4 rounded-full bg-white shadow-sm"></div>
                  </button>
                </div>
              </div>
              <button onClick={() => setShowConfigModal(false)} className="w-full mt-8 bg-[#207b25] text-white py-3 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-[#031c06] transition-colors">Guardar</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <footer className="bg-[#031c06] text-white py-12 text-center mt-20">
        <p className="text-[10px] font-black uppercase tracking-[0.5em] opacity-40">&copy; 2026 Aflopha - Sistema de Gestión Inteligente</p>
      </footer>
    </div>
  );
};

export default function LandingPage(props) {
  return <LandingProvider {...props}><Landing /></LandingProvider>;
}
