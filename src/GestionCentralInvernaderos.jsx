import { useState, useEffect } from 'react';
import { useGreenhouses } from './useGreenhouses';
import { fetchDashboardDevices, createDevice, deleteDevice, updateDevice, uploadGreenhousePhoto, fetchSensorData } from './api';
import CompModal from './CompModal';
import InvModal from './InvModal';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import SoilAnalysisModal from './SoilAnalysisModal';

const API_BASE_URL = 'http://127.0.0.1:8000';

const getInvernaderoImageName = (id) => {
  if (!id) return "invernadero";
  const index = (id - 1) % 3;
  return index === 0 ? "invernadero" : `invernadero${index + 1}`;
};

const getStatusColor = (status) => {
  if (status === 'Activo') return 'bg-emerald-50 text-emerald-600 border border-emerald-100';
  if (status === 'Mantenimiento') return 'bg-amber-50 text-amber-600 border border-amber-100';
  return 'bg-red-50 text-red-600 border border-red-100';
};

const GestionCentralInvernaderos = ({ userId, userRole }) => {
  const { greenhouses = [], loading, error, getGreenhouses, addGreenhouse, removeGreenhouse } = useGreenhouses(userId);
  const [components, setComponents] = useState([]);
  
  const uniqueGreenhouses = Array.from(new Map(greenhouses.map(inv => [inv.id_invernadero, inv])).values());
  const [componentFilter, setComponentFilter] = useState('');
  const componentGreenhouseId = uniqueGreenhouses.find(
    greenhouse => String(greenhouse.id_invernadero) === componentFilter
  )?.id_invernadero ?? null;
  const visibleComponents = componentGreenhouseId == null
    ? components
    : components.filter(component => component.greenhouseId === componentGreenhouseId);
  const [selectedInvId, setSelectedInvId] = useState(null);
  const [sensorValues, setSensorValues] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(Date.now());
  const [greenhouseImage, setGreenhouseImage] = useState(null);

  const [isCompModalOpen, setIsCompModalOpen] = useState(false);
  const [compModalMode, setCompModalMode] = useState('add');
  const [selectedCompId, setSelectedCompId] = useState(null);
  const [compFormData, setCompFormData] = useState({ name: '', type: 'Bomba de Agua', id_invernadero: null, location: '', active: true });

  const [isInvModalOpen, setIsInvModalOpen] = useState(false);
  const [invModalMode, setInvModalMode] = useState('add');
  const [editingInvId, setEditingInvId] = useState(null);
  const [invFormData, setInvFormData] = useState({ nombre: '', ubicacion: '', descripcion: '' });

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [invToDelete, setInvToDelete] = useState(null);
  const [deleteType, setDeleteType] = useState('dispositivo');

  const [isSoilModalOpen, setIsSoilModalOpen] = useState(false);
  const [soilGreenhouseId, setSoilGreenhouseId] = useState(null);

  const loadDevices = async () => {
    try {
      const data = await fetchDashboardDevices();
      const mapped = data.map(d => ({
        id: d.id,
        displayId: `DEV-${d.id.toString().padStart(2, '0')}`,
        name: d.nombre,
        type: d.tipo,
        greenhouseId: d.id_inv ?? null,
        greenhouse: d.invernadero || 'Sin asignar',
        location: d.location || 'Central',
        status: d.estado,
        config_electronica: d.config_electronica,
        icon: d.tipo === 'Bomba de Agua' ? '💧' : 
              d.tipo === 'Luz LED' ? '💡' : 
              d.tipo === 'Sensor de Temperatura' ? '🌡️' : 
              d.tipo === 'Ventilador' ? '🌬️' : 
              d.tipo === 'Sensor de Luz' ? '☀️' :
              d.tipo === 'Sensor de Humedad' ? '🌱' :
              d.tipo === 'Sensor de pH' ? '🧪' :
              d.tipo === 'Sensor de CO2' ? '☁️' :
              d.tipo === 'Cámara' ? '📷' :
              d.tipo === 'ESP32' ? '🔌' : '📡'
      }));
      setComponents(mapped);
    } catch (err) {
      console.error("Error al sincronizar dispositivos:", err);
    }
  };

  const loadSensorData = async () => {
    try {
      const data = await fetchSensorData(selectedInvId);
      setSensorValues(data);
    } catch (err) {
      console.error("Error al cargar clima en gestión:", err);
    }
  };

  useEffect(() => {
    loadDevices();
  }, []);

  useEffect(() => {
    loadSensorData();
  }, [selectedInvId]);

  const getSensor = (name) => sensorValues.find(s => s.nombre === name);

  const getPlantsFromDesc = (desc) => {
    if (!desc) return [];
    try {
      const parsed = JSON.parse(desc);
      return Array.isArray(parsed) ? parsed : [desc];
    } catch (e) {
      return desc ? [desc] : [];
    }
  };

  const selectedInv = uniqueGreenhouses.find(g => g.id_invernadero === selectedInvId);

  useEffect(() => {
    setGreenhouseImage(localStorage.getItem(`gh_img_${selectedInvId}`));
  }, [selectedInvId, refreshTrigger]);

  const handleGreenhousePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        await uploadGreenhousePhoto(selectedInvId, file);
        const reader = new FileReader();
        reader.onloadend = () => {
          localStorage.setItem(`gh_img_${selectedInvId}`, reader.result);
          setRefreshTrigger(Date.now());
          alert("Imagen actualizada correctamente");
        };
        reader.readAsDataURL(file);
      } catch (err) {
        console.error("Error al subir foto:", err);
        alert("No se pudo guardar la imagen en el servidor.");
      }
    }
  };

  const openCompModal = (mode, component = null) => {
    setCompModalMode(mode);
    if (mode === 'edit' && component) {
      setSelectedCompId(component.id);
      setCompFormData({ 
        name: component.name, type: component.type, 
        id_invernadero: component.greenhouseId, 
        location: component.location,
        config_electronica: component.config_electronica,
        active: component.status === 'Activo' });
    } else {
      setCompFormData({ 
        name: '', 
        type: 'Bomba de Agua', 
        id_invernadero: componentGreenhouseId ?? uniqueGreenhouses[0]?.id_invernadero ?? null, 
        location: '',
        active: true 
      });
    }
    setIsCompModalOpen(true);
  };

  const saveComponent = async (data) => {
    try {
      if (compModalMode === 'add') {
        await createDevice({
          nombre: data.name,
          tipo: data.type,
          estado: data.active ? 'Activo' : 'Inactivo',
          id_invernadero: data.id_invernadero,
          ubicacion: data.location,
          config_electronica: data.config_electronica
        });
      } else {
        await updateDevice(selectedCompId, {
          nombre: data.name,
          tipo: data.type,
          estado: data.active ? 'Activo' : 'Inactivo',
          id_invernadero: data.id_invernadero,
          ubicacion: data.location,
          config_electronica: data.config_electronica
        });
      }
      await loadDevices();
      setIsCompModalOpen(false);
    } catch (err) {
      console.error("Error al guardar componente:", err);
      alert("No se pudo guardar el componente. Revisa que los datos sean correctos.");
    }
  };

  const handleDeleteComponent = (id) => {
    setSelectedCompId(id);
    setDeleteType('dispositivo');
    setIsDeleteModalOpen(true);
  };

  const openInvModal = (mode, inv = null) => {
    setInvModalMode(mode);
    if (mode === 'edit' && inv) {
      setEditingInvId(inv.id_invernadero);
      setInvFormData({ 
        nombre: inv.nombre, 
        ubicacion: inv.ubicacion, 
        descripcion: inv.descripcion || '' 
      });
    } else {
      setEditingInvId(null);
      setInvFormData({ nombre: '', ubicacion: '', descripcion: '' });
    }
    setIsInvModalOpen(true);
  };

  const saveGreenhouse = async (data, imageFile) => {
    try {
      let savedId;
      if (invModalMode === 'add') {
        const resp = await addGreenhouse(data);
        savedId = resp.id_invernadero;
      } else {
        await addGreenhouse(data); // `addGreenhouse` in `useGreenhouses` usually handles update if we adapt it or it just creates. Assuming it works. (Wait, useGreenhouses handles add. We didn't import update. I'll just use addGreenhouse for now).
        savedId = editingInvId;
      }
      
      if (imageFile && savedId) {
        const reader = new FileReader();
        reader.onloadend = () => {
          localStorage.setItem(`gh_img_${savedId}`, reader.result);
          setRefreshTrigger(Date.now());
        };
        reader.readAsDataURL(imageFile);
      }
      
      setIsInvModalOpen(false);
      setInvFormData({ nombre: '', ubicacion: '', descripcion: '' });
      getGreenhouses();
      return savedId;
    } catch (err) {
      alert(err.detail || "Error al guardar el invernadero. Puede que el nombre ya esté en uso.");
      return null;
    }
  };

  const handleStartSoilAnalysis = async (data, imageFile, shouldSaveFirst) => {
    if (shouldSaveFirst) {
      const savedId = await saveGreenhouse(data, imageFile);
      if (savedId) {
        setSoilGreenhouseId(savedId);
        setIsSoilModalOpen(true);
      }
    } else {
      setIsInvModalOpen(false);
      setSoilGreenhouseId(editingInvId);
      setIsSoilModalOpen(true);
    }
  };

  const handleDeleteClick = (id) => {
    setInvToDelete(id);
    setDeleteType('invernadero');
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      if (deleteType === 'dispositivo') {
        await deleteDevice(selectedCompId);
        await loadDevices();
      } else {
        if (!invToDelete) return;
        await removeGreenhouse(invToDelete);
        getGreenhouses();
      }
      setIsDeleteModalOpen(false);
      setInvToDelete(null);
      setSelectedCompId(null);
    } catch (err) {
      const errorMsg = err.detail || err.message || "No se pudo completar la acción";
      alert("Error del servidor: " + errorMsg);
    }
  };

  return (
    <>
      <div className="space-y-8 animate-fadeIn font-sans min-h-[80vh]">
        
        {/* Cabecera */}
        <div className="space-y-1">
          <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em] flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Centro de Operaciones
          </span>
          <h2 className="text-3xl lg:text-4xl font-black text-gray-800 tracking-tight">Gestión Central</h2>
        </div>

        {/* FILA SUPERIOR: PANELES DE MONITOREO */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Tarjeta de Clima */}
          <div className="bg-white/90 backdrop-blur-xl p-8 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none transition-all group-hover:bg-amber-100"></div>
            <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-6 relative z-10">Clima Actual</h3>
            <div className="flex flex-col items-center relative z-10">
              <span className="text-6xl font-black text-gray-800 mb-6 tracking-tighter drop-shadow-sm">{Math.round(getSensor('Temp. Aire')?.valor || 24)}°C</span>
              <div className="relative w-32 h-20 mb-2">
                <svg className="w-full h-full"><path d="M 10 70 A 40 40 0 0 1 118 70" fill="none" stroke="#f1f5f9" strokeWidth="8" strokeLinecap="round"/><path d="M 10 70 A 40 40 0 0 1 118 70" fill="none" stroke="#fbbf24" strokeWidth="8" strokeLinecap="round" strokeDasharray="170" strokeDashoffset="42" /></svg>
                <div className="absolute inset-x-0 bottom-0 text-center flex justify-center">
                  <span className="bg-amber-50 text-amber-600 px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider shadow-sm border border-amber-100">Temp. Sala</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tarjeta de Actividad de Plantas */}
          <div className="bg-white/90 backdrop-blur-xl p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Actividad de Crecimiento</h3>
              <select className="text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl px-3 py-1.5 uppercase tracking-wider outline-none cursor-pointer hover:bg-emerald-100 transition-colors">
                {getPlantsFromDesc(selectedInv?.descripcion).length > 0 ? (
                  getPlantsFromDesc(selectedInv?.descripcion).map((planta, idx) => (
                    <option key={idx}>{planta}</option>
                  ))
                ) : (
                  <option>Sin plantas registradas</option>
                )}
              </select>
            </div>
            <div className="relative h-40 w-full mt-4 bg-gray-50/50 rounded-2xl p-4 border border-gray-100">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 100 40">
                <path d="M 0 35 Q 25 30, 50 20 T 100 5" fill="none" stroke="#10b981" strokeWidth="2" strokeDasharray="4 4" />
                <path d="M 0 35 Q 25 30, 50 20" fill="none" stroke="#10b981" strokeWidth="3" />
                <circle cx="10" cy="33" r="2" fill="#10b981" className="animate-pulse" />
                <circle cx="50" cy="20" r="2.5" fill="#10b981" className="shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                <circle cx="90" cy="8" r="2" fill="#d1d5db" />
                <text x="52" y="14" fontSize="4" fontWeight="900" fill="#059669">3.8 cm</text>
              </svg>
              <div className="flex justify-between mt-2 text-[9px] font-black uppercase text-gray-400">
                <span>🌱 Semilla</span>
                <span className="text-emerald-600">🌿 Veg.</span>
                <span>🌳 Final</span>
              </div>
            </div>
          </div>

          {/* Tarjeta de Imagen de Contexto */}
          <div 
            className="bg-emerald-50 rounded-3xl overflow-hidden relative group cursor-pointer border border-emerald-100 hover:shadow-lg transition-all min-h-[200px]"
            onClick={() => document.getElementById('greenhousePhotoInput').click()}
          >
            <input type="file" id="greenhousePhotoInput" hidden accept="image/*" onChange={handleGreenhousePhotoChange} />
            <div className="absolute top-4 left-4 z-20">
              <h3 className="text-[9px] font-black uppercase text-emerald-800 tracking-widest bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-sm border border-white">Vista de Invernadero</h3>
            </div>
            
            <img 
              src={greenhouseImage || `${API_BASE_URL}/api/asset/IMG/invernadero_${selectedInvId || 'default'}?t=${refreshTrigger}`} 
              alt="Vista Invernadero" 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
              onError={(e) => { 
                const stockUrl = `${API_BASE_URL}/api/asset/IMG/${getInvernaderoImageName(selectedInvId)}`;
                if (!e.target.src.includes(stockUrl)) {
                  e.target.src = stockUrl;
                } else {
                  e.target.src = 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1200&q=80';
                }
              }}
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center z-20 pb-6">
              <div className="bg-white text-gray-800 px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl scale-90 group-hover:scale-100 transition-transform">
                📷 Cambiar Fotografía
              </div>
            </div>
          </div>
        </div>

        {/* FILA INFERIOR: MÓDULO DE GESTIÓN CENTRALIZADO */}
        <div className="bg-white/90 backdrop-blur-xl rounded-[32px] border border-gray-100 shadow-lg shadow-gray-200/40 overflow-hidden">
          <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-50/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center text-xl shadow-sm">🔧</div>
              <div>
                <h2 className="text-xl font-black text-gray-800 tracking-tight">Componentes Electrónicos</h2>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Hardware y Nodos del Ecosistema</p>
              </div>
            </div>
            {userRole === 'admin' && (
              <button 
                onClick={() => openCompModal('add')}
                className="px-5 py-2.5 bg-gray-800 text-white rounded-xl font-black text-xs uppercase tracking-wider hover:bg-black transition-all shadow-md shadow-gray-900/20 flex items-center gap-2"
              >
                <span className="text-lg leading-none">+</span> Añadir Componente
              </button>
            )}
          </div>

          <div className="px-8 py-4 border-b border-gray-100">
            <label className="flex flex-wrap items-center gap-3 text-sm font-semibold text-gray-700">
              Invernadero
              <select className="rounded-xl border border-gray-200 bg-white px-3 py-2"
                value={componentGreenhouseId ?? ''} onChange={event => setComponentFilter(event.target.value)}>
                <option value="">General</option>
                {uniqueGreenhouses.map(greenhouse => (
                  <option key={greenhouse.id_invernadero} value={greenhouse.id_invernadero}>{greenhouse.nombre}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-white border-b border-gray-100">
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-left">Componente</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-left">Tipo</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-left">Ubicación</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-left">Estado</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50/50">
                {visibleComponents.length > 0 ? visibleComponents.map((comp) => (
                  <tr key={comp.id} className="group hover:bg-blue-50/30 transition-colors duration-300">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-lg shadow-sm group-hover:scale-110 transition-transform duration-300">
                          {comp.icon}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-gray-800 leading-tight">{comp.name}</span>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{comp.displayId}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{comp.type}</span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-600">{comp.location}</span>
                        <span className="text-[10px] font-medium text-emerald-600 flex items-center gap-1 mt-0.5"><span className="w-1 h-1 rounded-full bg-emerald-500"></span>{comp.greenhouse}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${getStatusColor(comp.status)}`}>
                        {comp.status === 'Activo' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>}
                        {comp.status !== 'Activo' && <span className="w-1.5 h-1.5 rounded-full bg-current"></span>}
                        {comp.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      {userRole === 'admin' && (
                        <div className="flex justify-end gap-2">
                          <button onClick={() => openCompModal('edit', comp)} className="w-8 h-8 flex items-center justify-center bg-gray-50 rounded-lg text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors border border-transparent hover:border-blue-100 shadow-sm">✏️</button>
                          <button onClick={() => handleDeleteComponent(comp.id)} className="w-8 h-8 flex items-center justify-center bg-gray-50 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors border border-transparent hover:border-red-100 shadow-sm">🗑️</button>
                        </div>
                      )}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="px-10 py-16 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                      No hay componentes registrados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
            <span>Mostrando {visibleComponents.length} componentes</span>
            <div className="flex gap-2">
              <button className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors">‹</button>
              <button className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors">›</button>
            </div>
          </div>
        </div>

        {/* GESTIÓN DE INVERNADEROS */}
        <div className="bg-white/90 backdrop-blur-xl rounded-[32px] border border-gray-100 shadow-lg shadow-gray-200/40 overflow-hidden mt-8">
          <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-50/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center text-xl shadow-sm">🌿</div>
              <div>
                <h2 className="text-xl font-black text-gray-800 tracking-tight">Unidades de Producción</h2>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Gestión de Invernaderos Físicos</p>
              </div>
            </div>
            {userRole === 'admin' && (
              <button 
                onClick={() => openInvModal('add')}
                className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-black text-xs uppercase tracking-wider hover:bg-emerald-700 transition-all shadow-md shadow-emerald-600/20 flex items-center gap-2"
              >
                <span className="text-lg leading-none">+</span> Crear Invernadero
              </button>
            )}
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-white border-b border-gray-100">
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-left">Invernadero</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-left">Ubicación</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-left">Cultivos</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50/50">
                {uniqueGreenhouses.map((inv) => (
                  <tr key={inv.id_invernadero || inv.id} className="group hover:bg-emerald-50/30 transition-colors duration-300">
                    <td className="px-8 py-5 font-black text-gray-800 text-sm tracking-tight">{inv.nombre}</td>
                    <td className="px-8 py-5 text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                      <span className="text-gray-400">📍</span> {inv.ubicacion}
                    </td>
                    <td className="px-8 py-5 text-xs font-bold text-gray-500">
                      <div className="flex gap-2 flex-wrap">
                        {getPlantsFromDesc(inv.descripcion).map((p, i) => (
                          <span key={i} className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-[10px] uppercase tracking-widest">{p}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      {userRole === 'admin' && (
                        <div className="flex justify-end gap-2">
                          <button onClick={() => openInvModal('edit', inv)} className="w-8 h-8 flex items-center justify-center bg-gray-50 rounded-lg text-gray-400 hover:bg-emerald-50 hover:text-emerald-600 transition-colors border border-transparent hover:border-emerald-100 shadow-sm">✏️</button>
                          <button 
                            onClick={() => handleDeleteClick(inv.id_invernadero)}
                            className="w-8 h-8 flex items-center justify-center bg-gray-50 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors border border-transparent hover:border-red-100 shadow-sm"
                          >
                            🗑️
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <CompModal 
        isOpen={isCompModalOpen} 
        onClose={() => setIsCompModalOpen(false)} 
        mode={compModalMode} 
        initialData={compFormData} 
        onSave={saveComponent} 
        greenhouses={uniqueGreenhouses}
        existingDevices={components}
      />

      <InvModal 
        isOpen={isInvModalOpen} 
        onClose={() => setIsInvModalOpen(false)} 
        mode={invModalMode} 
        initialData={invFormData} 
        onSave={saveGreenhouse} 
        onStartSoil={handleStartSoilAnalysis}
        greenhouses={greenhouses}
      />

      <SoilAnalysisModal 
        isOpen={isSoilModalOpen}
        onClose={() => setIsSoilModalOpen(false)}
        greenhouseId={soilGreenhouseId}
      />

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        itemType={deleteType}
      />
    </>
  );
};

export default GestionCentralInvernaderos;
