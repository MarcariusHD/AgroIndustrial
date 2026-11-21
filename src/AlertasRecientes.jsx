import { useState, useEffect, useMemo } from 'react';
import { fetchDashboardAlerts, fetchDashboardDevices } from './api';
import { useGreenhouses } from './useGreenhouses';

const API_BASE_URL = 'http://localhost:8000';

const getSeverityColor = (status) => {
  if (status === 'danger') return 'text-red-600 bg-red-50 border-red-200 shadow-red-500/20';
  if (status === 'warning') return 'text-amber-600 bg-amber-50 border-amber-200 shadow-amber-500/20';
  return 'text-emerald-600 bg-emerald-50 border-emerald-200 shadow-emerald-500/20';
};

const AlertasRecientes = ({ userId }) => {
  const { greenhouses = [] } = useGreenhouses(userId);
  const [selectedInvId, setSelectedInvId] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterSeverity, setFilterSeverity] = useState('Todos');
  const [isSeverityOpen, setIsSeverityOpen] = useState(false);
  const [lockedStatus, setLockedStatus] = useState({});

  const uniqueGreenhouses = Array.from(new Map(greenhouses.map(inv => [inv.nombre, inv])).values())
    .filter(inv => inv.id_invernadero !== undefined || inv.id !== undefined);

  useEffect(() => {
    if (!selectedInvId && uniqueGreenhouses.length > 0) {
      setSelectedInvId(uniqueGreenhouses[0].id_invernadero || uniqueGreenhouses[0].id);
    }
  }, [uniqueGreenhouses, selectedInvId]);

  useEffect(() => {
    const fetchAllSoilStatus = async () => {
      const statuses = {};
      for (const inv of uniqueGreenhouses) {
        try {
          const id = inv.id_invernadero || inv.id;
          const res = await fetch(`${API_BASE_URL}/invernaderos/${id}/analisis-suelo`);
          const data = await res.json();
          statuses[id] = !data;
        } catch (e) { console.error(e); }
      }
      setLockedStatus(statuses);
    };
    if (uniqueGreenhouses.length > 0) fetchAllSoilStatus();
  }, [uniqueGreenhouses.length]);

  useEffect(() => {
    const loadAlerts = async () => {
      setLoading(true);
      try {
        const data = await fetchDashboardAlerts(selectedInvId);
        
        if (!data || data.length === 0) {
          // Generar alertas por defecto
          const devices = await fetchDashboardDevices(selectedInvId);
          if (devices && devices.length > 0) {
            const dummyAlerts = [];
            devices.forEach((dev, idx) => {
              // Alerta 1
              dummyAlerts.push({
                id: `AL-${dev.id}01`,
                name: 'Anomalía Detectada',
                dev: dev.nombre,
                id_inv: selectedInvId,
                status: idx % 2 === 0 ? 'warning' : 'danger',
                place: dev.location || 'Sector Principal',
                invernadero: dev.invernadero || '---',
                val: 'REVISIÓN REQUERIDA',
                icon: '⚠️'
              });
              // Alerta 2
              dummyAlerts.push({
                id: `AL-${dev.id}02`,
                name: 'Mantenimiento Preventivo',
                dev: dev.nombre,
                id_inv: selectedInvId,
                status: 'safe',
                place: dev.location || 'Sector Principal',
                invernadero: dev.invernadero || '---',
                val: 'OPERATIVO',
                icon: '✅'
              });
            });
            setAlerts(dummyAlerts);
          } else {
            setAlerts([]);
          }
        } else {
          setAlerts(data);
        }
      } catch (error) {
        console.error("Error al cargar alertas:", error);
        setAlerts([]);
      } finally {
        setLoading(false);
      }
    };
    loadAlerts();
  }, [selectedInvId]);

  const filteredAlerts = alerts.filter(alert => {
    const matchesSeverity = filterSeverity === 'Todos' || 
      (filterSeverity === 'Alto' && alert.status === 'danger') || 
      (filterSeverity === 'Medio' && alert.status === 'warning') ||
      (filterSeverity === 'Bajo' && alert.status === 'safe');
      
    const selectedGreenhouseName = greenhouses.find(g => (g.id_invernadero || g.id) == selectedInvId)?.nombre?.toLowerCase();
    
    const matchesId = Number(alert.id_inv) === Number(selectedInvId);
    const matchesNameHeuristic = alert.place?.toLowerCase().includes(selectedGreenhouseName) || 
                                 alert.invernadero?.toLowerCase().includes(selectedGreenhouseName);

    const matchesGreenhouse = !selectedInvId || matchesId || matchesNameHeuristic;
    
    return matchesSeverity && matchesGreenhouse;
  });

  const stats = useMemo(() => {
    const total = alerts.filter(a => Number(a.id_inv) === Number(selectedInvId) || !selectedInvId).length;
    const criticas = alerts.filter(a => a.status === 'danger' && (Number(a.id_inv) === Number(selectedInvId) || !selectedInvId)).length;
    const estables = total - criticas;
    return { total, criticas, estables };
  }, [alerts, selectedInvId]);

  return (
    <div className="space-y-6 animate-fadeIn font-sans min-h-[80vh]">
      {/* Cabecera del Apartado */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div className="space-y-1">
          <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em] flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Estado del Ecosistema
          </span>
          <h2 className="text-3xl lg:text-4xl font-black text-gray-800 tracking-tight">Centro de Alertas</h2>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <button 
              onClick={() => setIsSeverityOpen(!isSeverityOpen)}
              className="px-5 py-2.5 bg-white/80 backdrop-blur-md border border-gray-200 rounded-xl text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
            >
              {filterSeverity === 'Todos' ? 'Nivel de Severidad' : `Severidad: ${filterSeverity}`}
              <svg className={`w-4 h-4 transition-transform duration-300 ${isSeverityOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
            </button>
            {isSeverityOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white/95 backdrop-blur-xl border border-gray-100 rounded-xl shadow-xl z-30 overflow-hidden animate-fadeIn origin-top-right">
                {['Todos', 'Alto', 'Bajo'].map((nivel) => (
                  <button 
                    key={nivel} 
                    className={`w-full text-left px-4 py-3 text-xs font-bold transition-colors uppercase tracking-widest ${filterSeverity === nivel ? 'bg-green-50 text-green-700' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'}`}
                    onClick={() => { setFilterSeverity(nivel); setIsSeverityOpen(false); }}
                  >
                    {nivel}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/90 backdrop-blur-xl p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Total Nodos Evaluados</p>
            <p className="text-3xl font-black text-gray-800">{stats.total}</p>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center text-xl shadow-inner">📡</div>
        </div>
        <div className="bg-white/90 backdrop-blur-xl p-5 rounded-3xl border border-red-100 shadow-sm shadow-red-500/5 flex items-center justify-between relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-red-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase text-red-400 tracking-widest mb-1">Alertas Críticas</p>
            <p className="text-3xl font-black text-red-600">{stats.criticas}</p>
          </div>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-inner relative z-10 ${stats.criticas > 0 ? 'bg-red-500 text-white animate-pulse shadow-red-500/30' : 'bg-red-50 text-red-400'}`}>
            ⚠️
          </div>
        </div>
        <div className="bg-white/90 backdrop-blur-xl p-5 rounded-3xl border border-emerald-100 shadow-sm shadow-emerald-500/5 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase text-emerald-500 tracking-widest mb-1">Sistemas Estables</p>
            <p className="text-3xl font-black text-emerald-600">{stats.estables}</p>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center text-xl shadow-inner">✅</div>
        </div>
      </div>

      {/* Botones de Selección de Invernadero */}
      <div className="flex flex-wrap gap-3 p-3 bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-gray-100">
        {uniqueGreenhouses.map((inv) => {
          const id = inv.id_invernadero || inv.id;
          const isSelected = Number(selectedInvId) === Number(id);
          return (
            <button
              key={id}
              onClick={() => setSelectedInvId(id)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-2 ${
                isSelected 
                  ? 'bg-gradient-to-r from-green-600 to-green-500 text-white shadow-md shadow-green-500/30' 
                  : 'bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-800'
              }`}
            >
              🌿 {inv.nombre}
              {lockedStatus[id] && (
                <span className="text-amber-400 animate-pulse text-sm">🔒</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Data Table Container */}
      <div className="bg-white/90 backdrop-blur-xl rounded-[32px] border border-gray-100 shadow-lg shadow-gray-200/40 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
             <div className="w-10 h-10 border-4 border-emerald-100 border-t-emerald-500 rounded-full animate-spin"></div>
             <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Analizando Ecosistema...</p>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100">
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-left">Nodo Analizado</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-left">Estado Lógico</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-left">Condición</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-left">Ubicación Física</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Diagnóstico</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50/50">
                {filteredAlerts.length > 0 ? filteredAlerts.map((alert, idx) => (
                  <tr key={idx} className="group hover:bg-blue-50/30 transition-colors duration-300">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-sm transition-transform duration-500 group-hover:scale-110 group-hover:shadow-md ${alert.status === 'danger' ? 'bg-red-50 text-red-500 border border-red-100' : 'bg-gray-50 text-gray-600 border border-gray-100'}`}>
                          {alert.icon}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-gray-800 leading-tight tracking-tight">{alert.name}</span>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{alert.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider ${alert.val === 'OPERATIVO' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                        {alert.val === 'OPERATIVO' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>}
                        {alert.val !== 'OPERATIVO' && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>}
                        {alert.val}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full shadow-sm ${alert.status === 'safe' ? 'bg-emerald-500 shadow-emerald-500/50' : 'bg-red-500 shadow-red-500/50 animate-pulse'}`}></div>
                        <span className={`text-xs font-black tracking-widest uppercase ${alert.status === 'safe' ? 'text-emerald-600' : 'text-red-600'}`}>
                          {alert.dev}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-600">{alert.location || 'Central'}</span>
                        <span className="text-[10px] font-medium text-gray-400">{alert.invernadero || 'Invernadero'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest inline-block border shadow-sm ${getSeverityColor(alert.status)}`}>
                        {alert.status === 'danger' ? 'Crítico' : 'Estable'}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="px-10 py-24 text-center">
                      <div className="flex flex-col items-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-4xl mb-4 shadow-inner border border-gray-100">🌿</div>
                        <p className="text-sm font-black text-gray-600 mb-1">Ecosistema en Orden</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">No se detectaron anomalías en este sector</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertasRecientes;