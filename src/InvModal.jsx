import { projectCrops } from './landingData';
import { useState, useEffect } from 'react';
import Modal from './Modal';

const InvModal = ({ isOpen, onClose, mode, initialData, onSave, greenhouses = [], onStartSoil }) => {
  const [formData, setFormData] = useState(initialData || { nombre: '', ubicacion: '', descripcion: '' });
  const [plantNames, setPlantNames] = useState(['']);
  const [errors, setErrors] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      try {
        const parsed = JSON.parse(initialData.descripcion);
        setPlantNames(Array.isArray(parsed) ? parsed : [initialData.descripcion]);
      } catch (e) {
        setPlantNames([initialData.descripcion || '']);
      }
    } else {
      setFormData({ nombre: '', ubicacion: '', descripcion: '' });
      setPlantNames(['']);
    }
    setErrors({});
    setImageFile(null);
    setImagePreview(null);
  }, [initialData, mode]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleQuantityChange = (e) => {
    const val = parseInt(e.target.value, 10) || 0;
    const qty = Math.min(20, Math.max(0, val));
    const newNames = [...plantNames];
    if (qty > newNames.length) {
      for (let i = newNames.length; i < qty; i++) newNames.push('');
    } else {
      newNames.splice(qty);
    }
    setPlantNames(newNames);
  };

  const handlePlantNameChange = (index, value) => {
    const newNames = [...plantNames];
    newNames[index] = value;
    setPlantNames(newNames);
    if (errors[`plant_${index}`]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[`plant_${index}`];
        return next;
      });
    }
  };

  const handleSubmit = () => {
    const newErrors = {};
    
    // Regex para detectar basura (5 o más caracteres seguidos que no sean vocales, números o espacios)
    const garbageRegex = /[^aeiouyáéíóúüñ\s\d\-]{5,}/i;
    // Regex para caracteres repetidos (3 o más veces seguidas)
    const repeatedRegex = /(.)\1{2,}/;
    // Regex para detectar si el texto es solo números o basura numérica
    const numericGarbageRegex = /\d{6,}/;
    // Caracteres especiales no deseados
    const forbiddenChars = /[<>{}[\]\\^`|~]/;

    // Validación del Nombre del Invernadero
    if (!formData.nombre || !formData.nombre.trim()) {
      newErrors.nombre = "El nombre es obligatorio";
    } else if (formData.nombre.length < 3) {
      newErrors.nombre = "El nombre es demasiado corto";
    } else if (repeatedRegex.test(formData.nombre)) {
      newErrors.nombre = "Nombre inválido (demasiados caracteres repetidos)";
    } else if (
      greenhouses.some(
        (g) =>
          g.nombre.trim().toLowerCase() === formData.nombre.trim().toLowerCase() &&
          (mode === 'add' || g.id_invernadero !== initialData?.id_invernadero)
      )
    ) {
      newErrors.nombre = "No se puede repetir el nombre del invernadero";
    } else if (garbageRegex.test(formData.nombre) || numericGarbageRegex.test(formData.nombre) || forbiddenChars.test(formData.nombre)) {
      newErrors.nombre = "El nombre parece ser aleatorio o inválido";
    }

    // Validación de la Ubicación
    if (!formData.ubicacion || !formData.ubicacion.trim()) {
      newErrors.ubicacion = "La ubicación es obligatoria";
    } else if (formData.ubicacion.length < 3) {
      newErrors.ubicacion = "La ubicación es demasiado corta";
    } else if (repeatedRegex.test(formData.ubicacion)) {
      newErrors.ubicacion = "Ubicación inválida (caracteres repetidos)";
    } else if (garbageRegex.test(formData.ubicacion) || numericGarbageRegex.test(formData.ubicacion) || forbiddenChars.test(formData.ubicacion)) {
      newErrors.ubicacion = "La ubicación parece ser aleatoria o inválida";
    }

    // Validación estricta de cada nombre de planta
    plantNames.forEach((name, index) => {
      const trimmedName = name.trim();
      if (!trimmedName) {
        newErrors[`plant_${index}`] = "El nombre de la planta es obligatorio";
      } else if (trimmedName.length < 3) {
        newErrors[`plant_${index}`] = "El nombre es demasiado corto";
      } else if (repeatedRegex.test(trimmedName)) {
        newErrors[`plant_${index}`] = "Nombre inválido (caracteres repetidos)";
      } else if (/\d/.test(trimmedName)) {
        newErrors[`plant_${index}`] = "No se permiten números en el nombre de la planta";
      } else if (!/[aeiouyáéíóúüñ]/i.test(trimmedName)) {
        newErrors[`plant_${index}`] = "Nombre inválido (debe contener vocales)";
      } else if (/[^aeiouyáéíóúüñ\s]{4,}/i.test(trimmedName) || forbiddenChars.test(trimmedName)) {
        newErrors[`plant_${index}`] = "El nombre parece ser aleatorio o inválido";
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Guardamos los nombres de las plantas como un JSON string en el campo descripcion
    const finalData = {
      ...formData,
      descripcion: JSON.stringify(plantNames.filter(n => n.trim() !== ''))
    };
    onSave(finalData, imageFile);
  };

  const handleStartSoil = () => {
    if (mode === 'add') {
      alert("Primero se creará el invernadero para asociarle el análisis químico.");
      // Simularemos un submit y luego notificaremos al padre
      const newErrors = {};
      if (!formData.nombre || formData.nombre.trim().length < 3) newErrors.nombre = "Nombre inválido";
      if (!formData.ubicacion || formData.ubicacion.trim().length < 3) newErrors.ubicacion = "Ubicación inválida";
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
      const finalData = {
        ...formData,
        descripcion: JSON.stringify(plantNames.filter(n => n.trim() !== ''))
      };
      onStartSoil(finalData, imageFile, true); // true indica que se debe guardar y abrir
    } else {
      onStartSoil(formData, null, false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={mode === 'add' ? 'Registrar Invernadero' : 'Editar Invernadero'}
      subtitle="Configuración de unidad de producción"
    >
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Nombre del Invernadero</label>
        <input 
          type="text" name="nombre" value={formData.nombre}
          onChange={handleChange}
          className={`w-full px-5 py-4 bg-gray-50 border-none rounded-[20px] text-sm font-bold focus:ring-2 transition-all ${errors.nombre ? 'ring-2 ring-red-500' : 'focus:ring-[#71cc49]'}`}
          placeholder="Ej. Invernadero Central A"
        />
        {errors.nombre && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest mt-1 animate-pulse">{errors.nombre}</p>}
      </div>
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Ubicación</label>
        <input 
          type="text" name="ubicacion" value={formData.ubicacion}
          onChange={handleChange}
          className={`w-full px-5 py-4 bg-gray-50 border-none rounded-[20px] text-sm font-bold focus:ring-2 transition-all ${errors.ubicacion ? 'ring-2 ring-red-500' : 'focus:ring-[#71cc49]'}`}
          placeholder="Ej. Sector Norte - Achocalla"
        />
        {errors.ubicacion && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest mt-1 animate-pulse">{errors.ubicacion}</p>}
      </div>
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Tipo de Cosecha (Cantidad de Variedades)</label>
        <input 
          type="number" 
          value={plantNames.length}
          onChange={handleQuantityChange}
          className="w-full px-5 py-4 bg-gray-50 border-none rounded-[20px] text-sm font-bold focus:ring-2 focus:ring-[#71cc49] transition-all"
          min="1"
          max="20"
        />
      </div>
      <div className="max-h-48 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
        {plantNames.map((name, index) => (
          <div key={index} className="space-y-1">
            <label className="text-[9px] font-black uppercase text-emerald-600 ml-2">Nombre Planta {index + 1}</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => handlePlantNameChange(index, e.target.value)}
              className={`w-full px-5 py-3 bg-emerald-50/50 border rounded-[15px] text-xs font-bold focus:ring-2 transition-all ${errors[`plant_${index}`] ? 'border-red-500 ring-2 ring-red-500' : 'border-emerald-100 focus:ring-[#71cc49]'}`}
              list="project-crops"
              placeholder="Ej: Lechuga de hoja"
            />
            {errors[`plant_${index}`] && <p className="text-red-500 text-[9px] font-black uppercase tracking-widest mt-0.5 ml-2 animate-pulse">{errors[`plant_${index}`]}</p>}
          </div>
        ))}
      </div>

      <datalist id="project-crops">{projectCrops.map(crop => <option key={crop.nombre} value={crop.nombre} />)}</datalist>

      <div className="space-y-2 pt-2 border-t border-gray-100">
        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Imagen de Portada (Opcional)</label>
        <div className="flex items-center gap-4">
          <div 
            className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center border-2 border-dashed border-gray-300 overflow-hidden cursor-pointer hover:border-[#71cc49] transition-colors"
            onClick={() => document.getElementById('invImgInput').click()}
          >
            {imagePreview ? <img src={imagePreview} className="w-full h-full object-cover" /> : <span className="text-xl">📷</span>}
          </div>
          <div className="flex-1">
            <input type="file" id="invImgInput" hidden accept="image/*" onChange={handleImageChange} />
            <button 
              onClick={() => document.getElementById('invImgInput').click()}
              className="text-[10px] font-black uppercase text-gray-600 bg-gray-200 px-4 py-2 rounded-xl hover:bg-gray-300 transition-colors"
            >
              Seleccionar Archivo
            </button>
            <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-1">Formato JPG o PNG</p>
          </div>
        </div>
      </div>

      <div className="p-4 bg-emerald-50 rounded-[20px] border border-emerald-100 mt-4 flex items-center justify-between">
        <div>
          <h4 className="text-[10px] font-black uppercase text-emerald-800 tracking-widest">Balance Químico de Suelos</h4>
          <p className="text-[9px] font-bold text-emerald-600/70 uppercase">Requerido para el ecosistema</p>
        </div>
        <button 
          onClick={handleStartSoil}
          className="px-6 py-2.5 bg-[#207b25] text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-[#031c06] transition-all shadow-md active:scale-95"
        >
          Comenzar
        </button>
      </div>
      
      <div className="flex gap-4 pt-4">
        <button onClick={handleSubmit} className="flex-grow py-4 bg-[#031c06] text-white rounded-[20px] font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl">
          {mode === 'add' ? 'Crear Invernadero' : 'Guardar Cambios'}
        </button>
        <button onClick={onClose} className="px-8 py-4 bg-gray-100 text-gray-500 rounded-[20px] font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all">
          Cancelar
        </button>
      </div>
    </Modal>
  );
};

export default InvModal;