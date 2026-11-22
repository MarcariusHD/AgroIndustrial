import { useState, useEffect } from 'react';
import Modal from './Modal';

const API_BASE_URL = 'http://127.0.0.1:8000';

const UserModal = ({ isOpen, onClose, userData, roles, onSave }) => {
  const [formData, setFormData] = useState({ ...userData, password: '' });

  useEffect(() => {
    setFormData({ ...userData, password: '' });
  }, [userData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/usuarios/${userData.id_usuario}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombres: formData.nombres,
          apellidos: formData.apellidos,
          correo: formData.correo,
          celular: formData.celular,
          password: formData.password || null,
          id_rol: parseInt(formData.id_rol)
        })
      });
      if (response.ok) {
        onSave();
      } else {
        const err = await response.json();
        alert("Error: " + (err.detail || "No se pudo actualizar"));
      }
    } catch (error) {
      alert("Error de conexión");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Perfil y Acceso" subtitle="Gestión administrativa de usuario">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase text-gray-400">Nombres</label>
          <input name="nombres" value={formData.nombres} onChange={handleChange} className="w-full p-3 bg-gray-50 rounded-xl text-sm font-bold border-none" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase text-gray-400">Apellidos</label>
          <input name="apellidos" value={formData.apellidos} onChange={handleChange} className="w-full p-3 bg-gray-50 rounded-xl text-sm font-bold border-none" />
        </div>
      </div>
      
      <div className="space-y-1">
        <label className="text-[10px] font-black uppercase text-gray-400">Correo Electrónico</label>
        <input name="correo" value={formData.correo} onChange={handleChange} className="w-full p-3 bg-gray-50 rounded-xl text-sm font-bold border-none" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase text-gray-400">Celular</label>
          <input name="celular" value={formData.celular} onChange={handleChange} className="w-full p-3 bg-gray-50 rounded-xl text-sm font-bold border-none" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase text-gray-400">Asignar Rol</label>
          <select name="id_rol" value={formData.id_rol} onChange={handleChange} className="w-full p-3 bg-gray-50 rounded-xl text-sm font-bold border-none">
            <option value="" disabled>Seleccionar Rol</option>
            {roles.map(r => (
              <option key={r.id_rol} value={r.id_rol}>
                {r.nombre_rol === 'admin' ? 'Administrador' : 
                 r.nombre_rol === 'user' ? 'Usuario General' : 
                 r.nombre_rol === 'supervisor' ? 'Supervisor Técnico' : r.nombre_rol}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-[10px] font-black uppercase text-gray-400">Nueva Contraseña (Opcional)</label>
        <input name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Dejar vacío para no cambiar" className="w-full p-3 bg-gray-50 rounded-xl text-sm font-bold border-none" />
      </div>

      <div className="flex gap-4 pt-4">
        <button onClick={handleSubmit} className="flex-grow py-4 bg-[#207b25] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all">
          Actualizar Usuario
        </button>
        <button onClick={onClose} className="px-6 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black text-[10px] uppercase tracking-widest">
          Cancelar
        </button>
      </div>
    </Modal>
  );
};

export default UserModal;