import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldAlert
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { fetchDashboardAlerts } from './api';
import { useSensors } from './useSensors';
import { useGreenhouses } from './useGreenhouses';
import SoilAnalysisModal from './SoilAnalysisModal';
import LiveGreenhouseSensors from './LiveGreenhouseSensors';

const API_BASE_URL = 'http://127.0.0.1:8000';

// Mock data para gráficas
const tempData = [
  { name: '00h', value: 18 }, { name: '04h', value: 16 },
  { name: '08h', value: 22 }, { name: '12h', value: 28 },
  { name: '16h', value: 30 }, { name: '20h', value: 24 }, { name: '23h', value: 19 },
];
const nutrientData = [
  { name: '00h', val: 120 }, { name: '04h', val: 110 }, { name: '08h', val: 350 },
  { name: '12h', val: 480 }, { name: '16h', val: 400 }, { name: '20h', val: 250 }, { name: '23h', val: 150 },
];

// Función auxiliar para mapear IDs a las 3 imágenes disponibles
const getInvernaderoImageName = (id) => {
  if (!id) return "invernadero";
  const index = (id - 1) % 3; // Ciclo entre 0, 1, 2
  return index === 0 ? "invernadero" : `invernadero${index + 1}`;
};

const EstadoInvernaderos = ({ userId, userRole }) => {
  const { greenhouses = [], loading, error, getGreenhouses } = useGreenhouses(userId);
  const [activeGreenhouseId, setActiveGreenhouseId] = useState(null);
  const { sensorData, getSensors } = useSensors(activeGreenhouseId);
  const [alerts, setAlerts] = useState([]);
  const [customImage, setCustomImage] = useState(null);
  const [lockedStatus, setLockedStatus] = useState({});
  const [hasSoilData, setHasSoilData] = useState(true); 
  const [isSoilModalOpen, setIsSoilModalOpen] = useState(false);
  const [isForcedSoilModal, setIsForcedSoilModal] = useState(false);

  // Helper para obtener la lista de plantas desde la descripción (JSON)
  const getPlantsFromDesc = (desc) => {
    if (!desc) return [];
    try {
      const parsed = JSON.parse(desc);
      return Array.isArray(parsed) ? parsed : [desc];
    } catch (e) {
      return desc ? [desc] : [];
    }
  };

  // Deduplicar la lista para el selector de botones
  const uniqueGreenhouses = Array.from(new Map(greenhouses.map(inv => [inv.nombre, inv])).values());

  useEffect(() => {
    if (greenhouses.length > 0 && activeGreenhouseId === null) {
      setActiveGreenhouseId(greenhouses[0].id_invernadero);
    }
  }, [greenhouses, activeGreenhouseId]);

  // Efecto para obtener el estado de bloqueo de TODOS los invernaderos para el selector
  useEffect(() => {
    const fetchAllSoilStatus = async () => {
      if (uniqueGreenhouses.length === 0) return;
      
      const statuses = {};
      // Peticiones en paralelo para mayor velocidad de carga inicial de candados
      const results = await Promise.all(uniqueGreenhouses.map(async (inv) => {
      try {
          const res = await fetch(`${API_BASE_URL}/invernaderos/${inv.id_invernadero}/analisis-suelo`);
          const data = res.ok ? await res.json() : null;
          // Bloqueado (true) si no hay datos en la DB para este invernadero
          const isLocked = !data || Object.keys(data).length === 0 || data === null;
          return { id: inv.id_invernadero, isLocked };
        } catch (e) { 
          return { id: inv.id_invernadero, isLocked: false }; 
        }
      }));
      
      results.forEach(res => { statuses[res.id] = res.isLocked; });
      setLockedStatus(statuses);
    };
    fetchAllSoilStatus();
  }, [greenhouses.length]); 

  // Lógica de bloqueo para Administrador: Forzar llenado de balance químico
  useEffect(() => {
    const checkSoilDataStatus = async () => {
      if (activeGreenhouseId) {
        try {
          const response = await fetch(`${API_BASE_URL}/invernaderos/${activeGreenhouseId}/analisis-suelo`);
          const data = response.ok ? await response.json() : null;
          const exists = data && Object.keys(data).length > 0 && !data.detail;
          
          setHasSoilData(exists);
          
          if (!exists) {
            setLockedStatus(prev => ({ ...prev, [activeGreenhouseId]: true }));
            setIsForcedSoilModal(true);
            setIsSoilModalOpen(true);
          }
        } catch (e) { 
          console.error(e);
          setHasSoilData(true); // Fallback: Ante error de red, no bloqueamos la pantalla
        }
      }
    };
    checkSoilDataStatus();
  }, [activeGreenhouseId, userRole]);

  // Sincronizar imagen personalizada desde localStorage por ID
  useEffect(() => {
    setCustomImage(localStorage.getItem(`gh_img_${activeGreenhouseId}`));
  }, [activeGreenhouseId]);

  // Cargar alertas de dispositivos para reflejar el estado del primer nodo en el panel lateral
  useEffect(() => {
    const loadAlerts = async () => {
      try {
        const data = await fetchDashboardAlerts(activeGreenhouseId);
        setAlerts(data || []);
      } catch (err) {
        console.error("Error al sincronizar alertas en Estado:", err);
      }
    };
    loadAlerts();
  }, [activeGreenhouseId]);

  const selectedInv = uniqueGreenhouses.find(g => g.id_invernadero === activeGreenhouseId) || (uniqueGreenhouses.length > 0 ? uniqueGreenhouses[0] : null);

  // Sub-componente para la pantalla de bloqueo
  const LockedView = () => (
    <div className="relative h-[650px] bg-gray-900 rounded-[40px] overflow-hidden shadow-3xl flex flex-col items-center justify-center p-12 text-center animate-fadeIn">
      {/* Imagen de fondo desenfocada (Efecto de bloqueo visual) */}
      <div className="absolute inset-0 opacity-20 filter blur-2xl scale-110">
        <img 
          src={activeGreenhouseId ? `${API_BASE_URL}/api/asset/IMG/invernadero_${activeGreenhouseId}` : `${API_BASE_URL}/api/asset/IMG/invernadero`} 
          className="w-full h-full object-cover" 
          alt="locked-bg" 
        />
      </div>
      
      {/* Cuadrícula técnica decorativa */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#71cc49 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-[#031c06]/50 to-[#031c06]"></div>
      
      {/* Contenido del Mensaje */}
      <div className="relative z-10 space-y-8 max-w-2xl">
        <div className="w-24 h-24 bg-white/5 backdrop-blur-xl rounded-[2.5rem] flex items-center justify-center mx-auto border border-white/10 shadow-[0_0_50px_rgba(113,204,73,0.2)] animate-pulse">
          <ShieldAlert size={48} className="text-[#71cc49]" />
        </div>
        
        <div className="space-y-4">
          <h2 className="text-5xl font-black text-white uppercase tracking-tighter leading-none italic">
            Acceso Restringido
          </h2>
          <p className="text-emerald-400 font-black uppercase text-[12px] tracking-[0.5em]">
            Invernadero: {selectedInv?.nombre || '---'}
          </p>
        </div>

        <p className="text-gray-400 text-lg font-medium leading-relaxed italic">
          "Para garantizar la integridad del ecosistema, es imperativo registrar el análisis químico inicial del suelo antes de habilitar el monitoreo de telemetría y mediciones de sensores."
        </p>

        <button 
          onClick={() => setIsSoilModalOpen(true)}
          className="px-12 py-5 bg-[#71cc49] text-[#031c06] font-black uppercase text-xs tracking-widest rounded-2xl hover:bg-white transition-all shadow-[0_0_30px_rgba(113,204,73,0.3)] active:scale-95 flex items-center gap-3 mx-auto"
        >
          <span>📝</span> Iniciar Registro de Laboratorio
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* SELECTOR DE INVERNADERO DINÁMICO */}
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {uniqueGreenhouses.map((inv) => (
          <button
            key={inv.id_invernadero}
            onClick={() => {
              const isLocked = !!lockedStatus[inv.id_invernadero];
              
              if (isLocked) {
                setActiveGreenhouseId(inv.id_invernadero);
                setHasSoilData(false); // Bloqueo visual inmediato de gráficas
                setIsForcedSoilModal(true);
                setIsSoilModalOpen(true);
              } else {
                setActiveGreenhouseId(inv.id_invernadero);
                setHasSoilData(true);
                setIsForcedSoilModal(false);
              }
            }}
            className={`px-8 py-4 rounded-[24px] font-black text-[10px] uppercase tracking-[0.2em] transition-all whitespace-nowrap shadow-xl border-2 flex items-center gap-2 ${
              activeGreenhouseId === inv.id_invernadero 
              ? 'bg-[#031c06] text-white border-transparent' 
              : 'bg-white text-gray-400 border-gray-100 hover:border-emerald-500/30'
            }`}
          >
            🌿 {inv.nombre}
            {lockedStatus[inv.id_invernadero] === true && (
              <span className="text-amber-500 animate-pulse text-sm">🔒</span>
            )}
          </button>
        ))}
        {greenhouses.length === 0 && (
          <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
            <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">No hay invernaderos registrados</p>
          </div>
        )}
      </div>

      {hasSoilData ? (
      <div className="grid grid-cols-12 gap-6">
        {/* PANEL IZQUIERDO (Sidebar de Datos) */}
        <div className="col-span-3 space-y-6">
          <LiveGreenhouseSensors key={activeGreenhouseId ?? 'none'} greenhouseId={activeGreenhouseId} ambientOnly />

          <div className="bg-gray-50 p-5 rounded-3xl border border-gray-200">
            <h3 className="text-[10px] font-black uppercase text-gray-400 mb-3 tracking-widest text-left">Consumo de Energía</h3>
            <div className="flex justify-center items-baseline gap-1 mb-3">
              <span className="text-3xl font-black text-[#031c06]">
                {sensorData.find(s => s.nombre === "Consumo de Energía")?.valor ?? "Sin datos"}
              </span>
              <span className="text-xs font-bold text-[#207b25] uppercase">
                {sensorData.find(s => s.nombre === "Consumo de Energía")?.unidad ?? ""}
              </span>
            </div>
          </div>

          <div className="bg-gray-50 p-5 rounded-3xl border border-gray-200">
            <h3 className="text-[10px] font-black uppercase text-gray-400 mb-4 tracking-widest">Alertas Críticas</h3>
            <div className="space-y-3">
              {alerts.length > 0 ? (
                <div className={`flex items-center gap-3 p-3 border-l-4 rounded-r-xl ${alerts[0].status === 'danger' ? 'bg-red-100/50 border-red-500 animate-pulse' : 'bg-emerald-100/50 border-emerald-500'}`}>
                  <span className="text-lg">{alerts[0].icon}</span>
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-black uppercase leading-none ${alerts[0].status === 'danger' ? 'text-red-800' : 'text-emerald-800'}`}>
                        {alerts[0].name}
                      </span>
                      <span className="text-[7px] font-black text-gray-400">({alerts[0].id})</span>
                    </div>
                    <p className={`text-[8px] font-black uppercase leading-none ${alerts[0].status === 'danger' ? 'text-red-600' : 'text-emerald-600'}`}>
                      {alerts[0].val} — {alerts[0].dev}
                    </p>
                    <span className={`text-[7px] font-bold uppercase tracking-tighter ${alerts[0].status === 'danger' ? 'text-red-500' : 'text-emerald-500'}`}>
                      {alerts[0].place} • {alerts[0].status === 'danger' ? 'ALTO' : 'BAJO'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 bg-gray-50 border-l-4 border-gray-300 rounded-r-xl">
                  <span className="text-lg opacity-30">📡</span>
                  <span className="text-[10px] font-black text-gray-400 uppercase leading-none italic">Sincronizando nodos...</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* PANEL CENTRAL (Visualización Principal) */}
        <div className="col-span-6 flex flex-col">
          <div className="bg-white rounded-[40px] overflow-hidden border border-gray-100 shadow-2xl relative h-full min-h-[500px]">
            <img 
              src={customImage || (activeGreenhouseId ? `${API_BASE_URL}/api/asset/IMG/invernadero_${activeGreenhouseId}?t=${Date.now()}` : `${API_BASE_URL}/api/asset/IMG/invernadero`)}
              className="absolute inset-0 w-full h-full object-cover" 
              alt="Vista Real Invernadero"
              onError={(e) => { 
                const stockUrl = `${API_BASE_URL}/api/asset/IMG/${getInvernaderoImageName(activeGreenhouseId)}`;
                if (!e.target.src.includes(stockUrl)) {
                  e.target.src = stockUrl;
                } else {
                  // Fallback final
                  e.target.src = 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1200&q=80';
                }
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#031c06]/90 via-transparent to-transparent flex flex-col justify-end p-10">
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-[32px] text-white">
                <h2 className="text-4xl font-black uppercase tracking-tighter mb-2">
                  {selectedInv ? selectedInv.nombre : 'Seleccione un Invernadero'}
                </h2>
                <div className="flex items-center gap-4">
                  <span className="px-3 py-1 bg-[#207b25] rounded-full text-[10px] font-black uppercase">En Producción</span>
                  <span className="text-lg font-medium uppercase tracking-tight">
                    {selectedInv 
                      ? (getPlantsFromDesc(selectedInv.descripcion).join(' - ') || 'Sin descripción disponible') 
                      : 'Sin descripción disponible'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-white/20">
                  <div className="flex flex-col">
                    <span className="text-[8px] uppercase font-black opacity-60 tracking-widest">Estado</span>
                    <span className="text-xs font-bold uppercase text-green-400">
                      {selectedInv ? 'Activo' : '---'}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] uppercase font-black opacity-60 tracking-widest">Fecha</span>
                    <span className="text-xs font-bold">{new Date().toLocaleDateString()}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] uppercase font-black opacity-60 tracking-widest">Lugar</span>
                    <span className="text-xs font-bold uppercase">
                      {selectedInv ? selectedInv.ubicacion : 'Desconocido'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PANEL DERECHO (Métricas y Energía) */}
        <div className="col-span-3 space-y-6">
          <div className="bg-gray-50 p-5 rounded-3xl border border-gray-200" key={`soil-chart-${activeGreenhouseId}`}>
            <h3 className="text-[10px] font-black uppercase text-gray-400 mb-4 tracking-widest text-center">Balance Químico Suelo</h3>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%" minHeight={180}>
                <RadialBarChart cx="50%" cy="50%" innerRadius="30%" outerRadius="100%" barSize={10} data={[
                  { name: 'pH', value: 68, fill: '#10b981' },
                  { name: 'CO2', value: 85, fill: '#059669' },
                  { name: 'EC', value: 45, fill: '#34d399' }
                ]}>
                  <RadialBar minAngle={15} background clockWise dataKey="value" cornerRadius={5} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '10px', fontWeight: 'bold' }}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-2">
              <div className="flex items-center gap-1 text-[8px] font-black uppercase text-gray-500"><span className="w-2 h-2 rounded-full bg-[#10b981]"></span> pH</div>
              <div className="flex items-center gap-1 text-[8px] font-black uppercase text-gray-500"><span className="w-2 h-2 rounded-full bg-[#059669]"></span> CO2</div>
              <div className="flex items-center gap-1 text-[8px] font-black uppercase text-gray-500"><span className="w-2 h-2 rounded-full bg-[#34d399]"></span> EC</div>
            </div>
            {userRole === 'admin' && (
              <button 
                onClick={() => setIsSoilModalOpen(true)}
                className="w-full mt-6 py-3 bg-[#031c06] text-white text-[10px] font-black uppercase rounded-2xl hover:bg-emerald-700 transition-all shadow-lg active:scale-95"
              >
                Ingresar
              </button>
            )}
          </div>

          <div className="bg-gray-50 p-6 rounded-3xl border border-gray-200 flex-grow">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Inyección Nutrientes (mL)</h3>
              <div className="flex bg-gray-200 p-1 rounded-xl">
                <button className="text-[8px] font-black uppercase px-3 py-1 bg-white rounded-lg shadow-sm">Diario</button>
                <button className="text-[8px] font-black uppercase px-3 py-1 text-gray-500">Ciclo</button>
              </div>
            </div>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%" minHeight={180}>
                <BarChart data={nutrientData}>
                  <Bar dataKey="val" radius={[4, 4, 0, 0]}>
                    {nutrientData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#10b981' : '#059669'} />
                    ))}
                  </Bar>
                  <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-between mt-4 text-[8px] font-black text-gray-400 uppercase"><span>00h</span><span>12h</span><span>23h</span></div>
          </div>
        </div>
      </div>
      ) : (
        <LockedView />
      )}

      <SoilAnalysisModal 
        isOpen={isSoilModalOpen}
        onClose={() => {
          setIsSoilModalOpen(false);
          setIsForcedSoilModal(false);
          // Refrescar estados al cerrar para desbloquear instantáneamente
          const refresh = async () => {
            try {
              const res = await fetch(`${API_BASE_URL}/invernaderos/${activeGreenhouseId}/analisis-suelo`);
              const data = res.ok ? await res.json() : null;
              const exists = data && Object.keys(data).length > 0 && !data.detail;
              setHasSoilData(exists);
              setLockedStatus(prev => ({ ...prev, [activeGreenhouseId]: !exists }));
            } catch (e) { console.error(e); }
            getSensors(activeGreenhouseId);
          };
          refresh();
        }}
        greenhouseId={activeGreenhouseId}
        isForced={isForcedSoilModal}
      />
    </div>
  );
};

export default EstadoInvernaderos;
