import { useState, useEffect } from 'react';
import Modal from './Modal';

const CompModal = ({ isOpen, onClose, mode, initialData, onSave, greenhouses = [], existingDevices = [] }) => {
  const [formData, setFormData] = useState(initialData || { name: '', type: 'Bomba de Agua', id_invernadero: null, location: '', active: true });
  const [error, setError] = useState('');
  const [locationError, setLocationError] = useState('');

  useEffect(() => {
    setFormData(initialData || { name: '', type: 'Bomba de Agua', id_invernadero: null, location: '', active: true });
    setError('');
  }, [initialData, mode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Convertimos el ID a número si es el campo de invernadero
    const finalValue = name === 'id_invernadero' ? (value ? parseInt(value, 10) : null) : value;
    setFormData(prev => ({ ...prev, [name]: finalValue }));
    if (name === 'name' && value.trim()) {
      setError('');
    }
    if (name === 'location' && value.trim()) {
      setLocationError('');
    }
  };

  const handleToggleActive = () => {
    setFormData(prev => ({ ...prev, active: !prev.active }));
  };

  const handleSubmit = () => {
    // Regex para detectar basura (secuencias de consonantes o caracteres sin sentido)
    const garbageRegex = /[^aeiouyáéíóúüñ\s\d\-]{5,}/i;
    // Regex para caracteres repetidos (3 o más veces seguidas)
    const repeatedRegex = /(.)\1{2,}/;
    const numericGarbageRegex = /\d{7,}/;
    // Caracteres especiales no deseados en nombres técnicos
    const forbiddenChars = /[<>{}[\]\\^`|~]/;

    // Validación del Nombre
    if (!formData.name || !formData.name.trim()) {
      setError('El nombre del componente es obligatorio');
      return;
    }
    if (formData.name.length < 3) {
      setError('El nombre es demasiado corto');
      return;
    }
    if (
      existingDevices.some(
        (d) =>
          d.greenhouseId === formData.id_invernadero &&
          d.name.trim().toLowerCase() === formData.name.trim().toLowerCase() &&
          (mode === 'add' || d.id !== initialData?.id)
      )
    ) {
      setError('No se puede repetir el nombre del dispositivo en este sector');
      return;
    }
    if (!/[aeiouyáéíóúüñ]/i.test(formData.name) && !/\d/.test(formData.name)) {
      setError('El nombre debe ser una palabra válida (con vocales)');
      return;
    }
    if (repeatedRegex.test(formData.name) || garbageRegex.test(formData.name) || numericGarbageRegex.test(formData.name)) {
      setError('El nombre parece ser aleatorio o inválido');
      return;
    }
    if (garbageRegex.test(formData.name) || forbiddenChars.test(formData.name)) {
      setError('El nombre parece ser aleatorio o contiene caracteres inválidos');
      return;
    }

    // Validación de la Ubicación
    if (!formData.location || !formData.location.trim()) {
      setLocationError('La ubicación específica es obligatoria');
      return;
    }
    if (formData.location.length < 3) {
      setLocationError('La ubicación es demasiado corta');
      return;
    }
    if (!/[aeiouyáéíóúüñ]/i.test(formData.location) && !/\d/.test(formData.location)) {
      setLocationError('La ubicación debe ser una palabra válida');
      return;
    }
    if (repeatedRegex.test(formData.location) || garbageRegex.test(formData.location) || numericGarbageRegex.test(formData.location)) {
      setLocationError('La ubicación parece ser aleatoria o inválida');
      return;
    }
    if (garbageRegex.test(formData.location) || forbiddenChars.test(formData.location)) {
      setLocationError('La ubicación parece ser aleatoria o inválida');
      return;
    }

    onSave(formData);
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={mode === 'add' ? 'Registrar Componente' : 'Editar Componente'}
      subtitle="Configuración técnica de hardware"
    >
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Nombre del Componente</label>
        <input 
          type="text" name="name" value={formData.name}
          onChange={handleChange}
          className={`w-full px-5 py-4 bg-gray-50 border-none rounded-[20px] text-sm font-bold focus:ring-2 transition-all ${error ? 'ring-2 ring-red-500' : 'focus:ring-[#71cc49]'}`}
          placeholder="Ej. Riego Central"
        />
        {error && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest mt-1 animate-pulse">{error}</p>}
      </div>
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Ubicación específica</label>
        <input 
          type="text" name="location" value={formData.location}
          onChange={handleChange}
          className={`w-full px-5 py-4 bg-gray-50 border-none rounded-[20px] text-sm font-bold focus:ring-2 transition-all ${locationError ? 'ring-2 ring-red-500' : 'focus:ring-[#71cc49]'}`}
          placeholder="Ej. Pasillo 4 - Sector Norte"
        />
        {locationError && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest mt-1 animate-pulse">{locationError}</p>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Tipo de Dispositivo</label>
          <select 
            name="type" value={formData.type}
            onChange={handleChange}
            className="w-full px-5 py-4 bg-gray-50 border-none rounded-[20px] text-sm font-bold"
          >
            {[
              'DHT22 interior', 'DHT22 exterior', 'Sensor capacitivo de humedad', 'Sensor de gotas de lluvia',
              'Bomba de Agua', 
              'Luz LED', 
              'Sensor de Temperatura', 
              'Ventilador', 
              'Sensor de Luz', 
              'Sensor de Humedad',
              'Sensor de Agua',
              'Relé', 
              'Sensor de pH', 
              'Sensor de CO2',
              'Cámara',
              'ESP32'
            ].map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Invernadero Destino</label>
          <select 
            name="id_invernadero" value={formData.id_invernadero || ''}
            onChange={handleChange}
            className="w-full px-5 py-4 bg-gray-50 border-none rounded-[20px] text-sm font-bold"
          >
            {!formData.id_invernadero && <option value="">Seleccionar...</option>}
            {greenhouses.map(h => (
              <option key={h.id_invernadero} value={h.id_invernadero}>{h.nombre}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-[20px]">
        <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Estado de Activación</span>
        <button 
          onClick={handleToggleActive}
          className={`w-12 h-6 rounded-full transition-colors relative ${formData.active ? 'bg-[#207b25]' : 'bg-gray-300'}`}
        >
          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.active ? 'right-1' : 'left-1'}`}></div>
        </button>
      </div>
      <div className="flex gap-4 pt-4">
        <button onClick={handleSubmit} className="flex-grow py-4 bg-[#031c06] text-white rounded-[20px] font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl">
          {mode === 'add' ? 'Crear Componente' : 'Guardar Cambios'}
        </button>
        <button onClick={onClose} className="px-8 py-4 bg-gray-100 text-gray-500 rounded-[20px] font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all">Cancelar</button>
      </div>
    </Modal>
  );
};

export default CompModal;
