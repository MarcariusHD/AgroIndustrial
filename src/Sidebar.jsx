import { useState } from 'react';
import {
  LayoutDashboard,
  Thermometer,
  Bug,
  Users,
  Settings,
  LogOut,
  Home,
  Bell,
  Activity,
  Cpu,
  ChevronDown,
  ChevronUp,
  Droplet,
  ShieldAlert,
  AlertTriangle
} from 'lucide-react';

const Sidebar = ({
  activeModule,
  setActiveModule,
  profilePic,
  handlePhotoChange,
  userNames,
  userRole,
  logout,
  userId,
  collapsed,
  onToggle
}) => {
  const storageKey = `sidebar_sections_${userId}_${userRole}`;
  const [expandedModules, setExpandedModules] = useState(() => {
    try { return JSON.parse(localStorage.getItem(storageKey)) || {}; }
    catch { return {}; }
  });

  const toggleModule = (moduleName) => {
    const updated = { ...expandedModules, [moduleName]: !expandedModules[moduleName] };
    setExpandedModules(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  const railItems = [
    { module: 'home', label: 'Home', Icon: Home },
    { module: 'estado_invernaderos', label: 'Estado de invernaderos', Icon: Activity },
    { module: 'dispositivos_activos', label: 'Dispositivos activos', Icon: Cpu },
    { module: 'alertas_recientes', label: 'Alertas recientes', Icon: Bell },
    { module: 'monitoreo_general', label: 'Monitoreo climático', Icon: Thermometer },
    ...(userRole === 'admin' ? [{ module: 'gestion_central_invernaderos', label: 'Gestión central', Icon: Settings }] : []),
    { module: 'gestor_riesgos', label: 'Riesgos y plagas', Icon: ShieldAlert },
    ...(userRole === 'admin' ? [{ module: 'usuario', label: 'Usuarios', Icon: Users }] : []),
  ];

  if (collapsed) return (
    <aside aria-label="Menú lateral compacto" className="w-20 flex-shrink-0 bg-[#031c06] text-white h-screen sticky top-0 flex flex-col items-center border-r border-white/10">
      <button type="button" onClick={onToggle} aria-label="Desplegar menú" aria-expanded={false} title="Desplegar menú" className="w-10 h-10 my-3 rounded-xl text-2xl text-emerald-100 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400">&gt;</button>
      <label title="Cambiar foto de perfil" className="block w-11 h-11 shrink-0 rounded-full overflow-hidden border-2 border-[#71cc49] cursor-pointer">
        <img src={profilePic} alt={`Perfil de ${userNames || 'usuario'}`} className="w-full h-full object-cover" />
        <input type="file" className="sr-only" accept="image/*" aria-label="Cambiar foto de perfil" onChange={handlePhotoChange} />
      </label>
      <nav aria-label="Accesos del menú" className="w-full flex-1 min-h-0 overflow-y-auto flex flex-col items-center gap-2 py-5 mt-4 border-t border-white/10">
        {railItems.map(({ module, label, Icon }) => {
          const active = activeModule === module || (module === 'gestor_riesgos' && activeModule === 'alertas_plagas');
          return <button key={module} type="button" onClick={() => setActiveModule(module)} title={label} aria-label={label} aria-current={active ? 'page' : undefined} className={`w-11 h-11 shrink-0 flex items-center justify-center rounded-xl transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400 ${active ? 'bg-white/15 text-white' : 'text-emerald-100/60 hover:bg-white/10 hover:text-white'}`}><Icon size={22} strokeWidth={1.8} aria-hidden="true" /></button>;
        })}
      </nav>
      <button type="button" onClick={logout} title="Cerrar sesión" aria-label="Cerrar sesión" className="w-11 h-11 my-4 shrink-0 flex items-center justify-center rounded-xl text-red-300 hover:bg-red-500/15"><LogOut size={22} /></button>
    </aside>
  );

  return (
    <aside className="w-72 flex-shrink-0 bg-[#031c06] text-white flex flex-col shadow-2xl max-h-screen sticky top-0 overflow-hidden">
      <button type="button" onClick={onToggle} aria-label="Contraer menú" aria-expanded={true} title="Contraer menú" className="self-end w-10 h-10 m-3 rounded-xl text-2xl text-emerald-100 hover:bg-white/10">&lt;</button>
      <div className="flex flex-col flex-grow overflow-y-auto">
        <div className="p-6 text-center border-b border-[#043b05]">
          <div 
            className="relative group w-24 h-24 mx-auto bg-white rounded-full mb-3 flex items-center justify-center overflow-hidden border-4 border-[#71cc49] cursor-pointer"
            onClick={() => document.getElementById('photoInput').click()}
          >
            <img src={profilePic} alt="User" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-[10px] font-bold">CAMBIAR</span>
            </div>
          </div>
          <input type="file" id="photoInput" hidden accept="image/*" onChange={handlePhotoChange} />
          <p className="font-bold text-base uppercase tracking-widest leading-tight mb-1">{userNames || 'Usuario'}</p>
          <div className="flex items-center justify-center gap-2">
            <span className="w-2 h-2 bg-[#71cc49] rounded-full animate-pulse"></span>
            <span className="text-[10px] text-green-300 font-medium uppercase">En línea</span>
          </div>
        </div>

        <nav className="flex-grow p-4 space-y-6">
          {/* BOTÓN HOME */}
          <button 
            onClick={() => setActiveModule('home')}
            className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all font-bold ${activeModule === 'home' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-emerald-100 hover:bg-emerald-500/10'}`}
          >
            <Home className="w-5 h-5" /> HOME
          </button>

          {/* SECCIONES DEL MENÚ */}
          <div className="space-y-4">
            {/* MODULO GENERAL */}
            <div>
              <button 
                onClick={() => toggleModule('general')}
                className="w-full flex justify-between items-center px-3 py-2 text-sm font-black text-[#71cc49] uppercase tracking-wider hover:bg-[#043b05]/50 rounded-lg"
              >
                <div className="flex items-center gap-2"><LayoutDashboard className="w-4 h-4" /> Módulo General</div>
                {expandedModules['general'] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {expandedModules['general'] && (
                <ul className="mt-2 space-y-1 text-base text-green-100">
                  <li 
                    className={`p-3 rounded-xl cursor-pointer flex items-center gap-3 transition-colors ${activeModule === 'estado_invernaderos' ? 'bg-white/10 text-white font-bold' : 'hover:bg-white/5'}`}
                    onClick={() => setActiveModule('estado_invernaderos')}
                  ><Activity className="w-4 h-4 text-emerald-400" /> Estado Invernaderos</li>
                  <li 
                    className={`p-3 rounded-xl cursor-pointer flex items-center gap-3 transition-colors ${activeModule === 'dispositivos_activos' ? 'bg-white/10 text-white font-bold' : 'hover:bg-white/5'}`}
                    onClick={() => setActiveModule('dispositivos_activos')}
                  ><Cpu className="w-4 h-4 text-emerald-400" /> Dispositivos Activos</li>
                  <li 
                    className={`p-3 rounded-xl cursor-pointer flex items-center gap-3 transition-colors ${activeModule === 'alertas_recientes' ? 'bg-white/10 text-white font-bold' : 'hover:bg-white/5'}`}
                    onClick={() => setActiveModule('alertas_recientes')}
                  ><Bell className="w-4 h-4 text-emerald-400" /> Alertas Recientes</li>
                </ul>
              )}
            </div>

            {/* MONITOREO AMBIENTAL */}
            <div>
              <button 
                onClick={() => toggleModule('monitoreo')}
                className="w-full flex justify-between items-center px-3 py-2 text-sm font-black text-[#71cc49] uppercase tracking-wider hover:bg-[#043b05]/50 rounded-lg"
              >
                <div className="flex items-center gap-2"><Thermometer className="w-4 h-4" /> Monitoreo</div>
                {expandedModules['monitoreo'] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {expandedModules['monitoreo'] && (
                <ul className="mt-2 space-y-1 text-base text-green-100">
                  <li 
                    className={`p-3 rounded-xl cursor-pointer flex items-center gap-3 transition-colors ${activeModule === 'monitoreo_general' ? 'bg-white/10 text-white font-bold' : 'hover:bg-white/5'}`}
                    onClick={() => setActiveModule('monitoreo_general')}
                  ><Droplet className="w-4 h-4 text-emerald-400" /> Monitoreo Climático</li>
                </ul>
              )}
            </div>
            {/* GESTIÓN INVERNADEROS */}
            {userRole === 'admin' && (
              <div>
                <button 
                  onClick={() => toggleModule('invernaderos')}
                  className="w-full flex justify-between items-center px-3 py-2 text-sm font-black text-[#71cc49] uppercase tracking-wider hover:bg-[#043b05]/50 rounded-lg"
                >
                  <div className="flex items-center gap-2"><Home className="w-4 h-4" /> Invernaderos</div>
                  {expandedModules['invernaderos'] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {expandedModules['invernaderos'] && (
                  <ul className="mt-2 space-y-1 text-base text-green-100">
                    <li 
                      className={`p-3 rounded-xl cursor-pointer flex items-center gap-3 transition-colors ${activeModule === 'gestion_central_invernaderos' ? 'bg-white/10 text-white font-bold' : 'hover:bg-white/5'}`}
                      onClick={() => setActiveModule('gestion_central_invernaderos')}
                    >
                      <Settings className="w-4 h-4 text-emerald-400" /> Gestión Central
                    </li>
                  </ul>
                )}
              </div>
            )}

            {/* DETECCIÓN PLAGAS */}
            <div>
              <button 
                onClick={() => toggleModule('plagas')}
                className="w-full flex justify-between items-center px-3 py-2 text-sm font-black text-[#71cc49] uppercase tracking-wider hover:bg-[#043b05]/50 rounded-lg"
              >
                <div className="flex items-center gap-2"><Bug className="w-4 h-4" /> Plagas</div>
                {expandedModules['plagas'] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {expandedModules['plagas'] && (
                <ul className="mt-2 space-y-1 text-base text-green-100">
                  <li
                    className={`p-3 rounded-xl cursor-pointer flex items-center gap-3 transition-colors ${['gestor_riesgos', 'alertas_plagas'].includes(activeModule) ? 'bg-white/10 text-white font-bold' : 'hover:bg-white/5'}`}
                    onClick={() => setActiveModule('gestor_riesgos')}
                  >
                    <ShieldAlert className="w-4 h-4 text-emerald-400" /> Riesgos y Plagas
                  </li>

                </ul>
              )}
            </div>

            {/* GESTIÓN USUARIOS */}
            {userRole === 'admin' && (
              <div>
                <button 
                  onClick={() => toggleModule('usuarios_gest')}
                  className="w-full flex justify-between items-center px-3 py-2 text-sm font-black text-[#71cc49] uppercase tracking-wider hover:bg-[#043b05]/50 rounded-lg"
                >
                  Gestión Usuarios
                  <span className="text-xs">{expandedModules['usuarios_gest'] ? '▲' : '▼'}</span>
                </button>
                {expandedModules['usuarios_gest'] && (
                  <ul className="mt-2 space-y-1 text-base text-green-100">
                    <li className={`p-2 rounded-lg cursor-pointer ${activeModule === 'usuario' ? 'bg-[#207b25] font-bold' : 'hover:bg-[#043b05]'}`} onClick={() => setActiveModule('usuario')}>
                      Lista de Usuarios
                    </li>
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* CERRAR SESIÓN */}
          <button 
            onClick={logout}
            className="w-full mt-8 p-4 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" /> Cerrar Sesión
          </button>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
