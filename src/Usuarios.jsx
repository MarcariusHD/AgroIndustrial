import { useState, useEffect, useCallback } from 'react';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import UserModal from './UserModal';

const API_BASE_URL = 'http://127.0.0.1:8000';

const Usuarios = () => {
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [roles, setRoles] = useState([]);
  
  // Estados para Modales
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Estado local para los interruptores de Activo/Inactivo (Simulado)
  const [userStatuses, setUserStatuses] = useState(() => {
    const saved = localStorage.getItem('userStatuses');
    return saved ? JSON.parse(saved) : {};
  });

  // Cargar Usuarios y Roles desde la DB
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [resUsers, resRoles] = await Promise.all([
        fetch(`${API_BASE_URL}/usuario`),
        fetch(`${API_BASE_URL}/roles`)
      ]);
      if (resUsers.ok && resRoles.ok) {
        setUsersList(await resUsers.json());
        setRoles(await resRoles.json());
      } else {
        setError("Error al conectar con el servidor");
      }
    } catch (err) {
      setError("Error de red");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleUserActive = (userId) => {
    const newStatuses = { ...userStatuses, [userId]: !userStatuses[userId] };
    setUserStatuses(newStatuses);
    localStorage.setItem('userStatuses', JSON.stringify(newStatuses));
  };

  const handleUpdateRole = async (userId, roleId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/usuarios/${userId}/rol`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_rol: parseInt(roleId) })
      });
      if (response.ok) {
        fetchData(); // Sincronizar inmediatamente
      }
    } catch (error) {
      alert("Error al actualizar el rol");
    }
  };

  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/usuarios/${selectedUser.id_usuario}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setIsDeleteModalOpen(false);
        fetchData();
      }
    } catch (error) {
      alert("No se pudo eliminar al usuario");
    }
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setIsUserModalOpen(true);
  };

  const handleSaveUser = async (updatedData) => {
    setIsUserModalOpen(false);
    fetchData();
  };

  return (
    <div className="space-y-8 animate-fadeIn font-sans min-h-[80vh]">
      
      {/* Cabecera */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
            Gestión de Personal
          </span>
          <h2 className="text-3xl lg:text-4xl font-black text-gray-800 tracking-tight">Control de Accesos</h2>
        </div>
        <button 
          className="px-6 py-3 bg-white/80 backdrop-blur-md text-gray-700 border border-gray-200 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-50 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm active:scale-95 flex items-center gap-2"
          onClick={fetchData}
        >
          <span className={`${loading ? 'animate-spin' : ''}`}>🔄</span> 
          Sincronizar Usuarios
        </button>
      </div>

      {/* Tarjetas de Resumen Rápido */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/90 backdrop-blur-xl p-6 rounded-[32px] border border-gray-100 shadow-sm flex items-center gap-5">
          <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center text-xl">👥</div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Usuarios</p>
            <p className="text-3xl font-black text-gray-800 tracking-tighter">{usersList.length}</p>
          </div>
        </div>
        <div className="bg-white/90 backdrop-blur-xl p-6 rounded-[32px] border border-gray-100 shadow-sm flex items-center gap-5">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center text-xl">✅</div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cuentas Activas</p>
            <p className="text-3xl font-black text-gray-800 tracking-tighter">
              {usersList.filter(u => userStatuses[u.id_usuario] !== false).length}
            </p>
          </div>
        </div>
        <div className="bg-white/90 backdrop-blur-xl p-6 rounded-[32px] border border-gray-100 shadow-sm flex items-center gap-5">
          <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center text-xl">🛡️</div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Administradores</p>
            <p className="text-3xl font-black text-gray-800 tracking-tighter">
              {usersList.filter(u => u.id_rol === roles.find(r => r.nombre_rol === 'admin')?.id_rol).length}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white/90 backdrop-blur-xl rounded-[40px] border border-gray-100 shadow-lg shadow-gray-200/40 overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-left">Identidad</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-left">Contacto</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-left">Nivel de Acceso</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Estado</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading && <tr><td colSpan="5" className="text-center py-16 text-gray-400 font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3"><span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></span> Cargando base de datos...</td></tr>}
              {error && <tr><td colSpan="5" className="text-center py-16 text-red-500 font-black uppercase text-[10px] tracking-widest">{error}</td></tr>}
              {!loading && !error && usersList.map(item => {
                const isActive = userStatuses[item.id_usuario] !== false;
                const isAdmin = item.id_rol === roles.find(r => r.nombre_rol === 'admin')?.id_rol;
                
                return (
                  <tr key={item.id_usuario} className="group hover:bg-blue-50/30 transition-all duration-300">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-sm group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 ${isAdmin ? 'bg-gradient-to-br from-amber-400 to-amber-600' : 'bg-gradient-to-br from-blue-500 to-indigo-600'}`}>
                          {(item.nombres?.[0] || 'U')}{(item.apellidos?.[0] || '')}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-gray-800 leading-none">{item.nombres || 'Usuario'} {item.apellidos || ''}</span>
                          <span className="text-[10px] font-bold text-gray-500 mt-1.5 break-all">{item.correo}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-xs font-bold text-gray-600 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-xl flex items-center w-fit gap-2">
                        <span className="opacity-50">📱</span> {item.celular || 'No registrado'}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="relative">
                        <select 
                          className="text-[10px] font-black uppercase bg-gray-50 text-gray-700 border border-gray-200 rounded-xl px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none cursor-pointer appearance-none pr-8 hover:bg-white transition-colors shadow-sm"
                          value={item.id_rol || ''}
                          onChange={(e) => handleUpdateRole(item.id_usuario, e.target.value)}
                        >
                          <option value="" disabled>--- Asignar Rol ---</option>
                          {roles.map(role => (
                            <option key={role.id_rol} value={role.id_rol}>
                              {role.nombre_rol === 'admin' ? '🛡️ Administrador' : 
                               role.nombre_rol === 'user' ? '👤 Usuario General' :
                               role.nombre_rol === 'supervisor' ? '⚙️ Supervisor Técnico' : 
                               `💠 ${role.nombre_rol}`}
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-xs">▼</div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col items-center gap-2">
                        <button 
                          onClick={() => toggleUserActive(item.id_usuario)}
                          className={`relative inline-flex items-center h-7 w-14 rounded-full transition-all duration-300 focus:outline-none shadow-inner border border-transparent ${isActive ? 'bg-emerald-500 border-emerald-600' : 'bg-gray-200 border-gray-300'}`}
                        >
                          <span className={`inline-block w-5 h-5 transform bg-white rounded-full shadow-sm transition-transform duration-300 ${isActive ? 'translate-x-8' : 'translate-x-1'}`} />
                        </button>
                        <span className={`text-[8px] font-black uppercase tracking-widest ${isActive ? 'text-emerald-600' : 'text-gray-400'}`}>
                          {isActive ? 'Operativo' : 'Suspendido'}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleEditClick(item)}
                          className="w-10 h-10 flex items-center justify-center bg-gray-50 border border-gray-100 text-gray-400 rounded-xl hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm"
                          title="Editar Usuario"
                        >
                          ✏️
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(item)}
                          className="w-10 h-10 flex items-center justify-center bg-gray-50 border border-gray-100 text-gray-400 rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all shadow-sm"
                          title="Eliminar Usuario"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!loading && !error && usersList.length === 0 && (
                <tr><td colSpan="5" className="text-center py-16 text-gray-400 font-black uppercase text-[10px] tracking-widest">No hay usuarios registrados</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-gray-50/50 border-t border-gray-100 flex justify-between items-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
          <span>Mostrando {usersList.length} registros</span>
        </div>
      </div>

      {/* Modales de soporte */}
      <ConfirmDeleteModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        itemType="usuario"
      />

      {selectedUser && (
        <UserModal 
          isOpen={isUserModalOpen}
          onClose={() => setIsUserModalOpen(false)}
          userData={selectedUser}
          roles={roles}
          onSave={handleSaveUser}
        />
      )}
    </div>
  );
};

export default Usuarios;