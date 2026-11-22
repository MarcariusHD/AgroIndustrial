import { useState, useEffect } from 'react';
import { useGreenhouses } from './useGreenhouses';

const API_BASE_URL = 'http://localhost:8000';

const AlertasPlagas = ({ userId }) => {
  const { greenhouses = [] } = useGreenhouses(userId);
  const [selectedInvId, setSelectedInvId] = useState(null);
  const [lockedStatus, setLockedStatus] = useState({});

  const uniqueGreenhouses = Array.from(new Map(greenhouses.map(inv => [inv.nombre, inv])).values());

  useEffect(() => {
    if (!selectedInvId && uniqueGreenhouses.length > 0) {
      setSelectedInvId(uniqueGreenhouses[0].id_invernadero);
    }
  }, [uniqueGreenhouses, selectedInvId]);

  useEffect(() => {
    const fetchAllSoilStatus = async () => {
      const statuses = {};
      for (const inv of uniqueGreenhouses) {
        try {
          const res = await fetch(`${API_BASE_URL}/invernaderos/${inv.id_invernadero}/analisis-suelo`);
          const data = await res.json();
          statuses[inv.id_invernadero] = !data;
        } catch (e) { console.error(e); }
      }
      setLockedStatus(statuses);
    };
    if (uniqueGreenhouses.length > 0) fetchAllSoilStatus();
  }, [uniqueGreenhouses.length]);

  return (
    <div className="space-y-8 animate-fadeIn font-sans min-h-[80vh]">
      
      {/* Cabecera */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-1">
          <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em] flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Escaneo de Bioseguridad en Tiempo Real
          </span>
          <h2 className="text-3xl lg:text-4xl font-black text-gray-800 tracking-tight">Amenazas Biológicas</h2>
        </div>
        <div className="bg-emerald-50/80 backdrop-blur-md px-6 py-4 rounded-3xl border border-emerald-100 shadow-sm flex flex-col items-end">
          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Índice de Salud General</p>
          <div className="flex items-center gap-3 mt-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <p className="text-3xl font-black text-emerald-700 leading-none">92%</p>
          </div>
        </div>
      </div>

      {/* Selector de Invernaderos */}
      <div className="flex flex-wrap gap-4 p-2 bg-white/60 backdrop-blur-md rounded-2xl border border-gray-100 w-fit shadow-sm">
        {uniqueGreenhouses.map((inv) => (
          <button
            key={inv.id_invernadero}
            onClick={() => setSelectedInvId(inv.id_invernadero)}
            className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${selectedInvId === inv.id_invernadero ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' : 'bg-transparent text-gray-500 hover:bg-gray-100'}`}
          >
            🌿 {inv.nombre}
            {lockedStatus[inv.id_invernadero] && (
              <span className="text-amber-400 animate-pulse drop-shadow-sm">🔒</span>
            )}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Radar de Detección */}
        <div className="col-span-1 lg:col-span-2 bg-gray-900 rounded-[40px] p-8 relative overflow-hidden h-72 shadow-xl shadow-gray-900/20 group">
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-emerald-500 rounded-full group-hover:scale-110 transition-transform duration-1000"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 border border-emerald-400 rounded-full group-hover:scale-110 transition-transform duration-1000 delay-75"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 border border-emerald-300 rounded-full group-hover:scale-110 transition-transform duration-1000 delay-150"></div>
            <div className="absolute top-0 left-1/2 w-px h-full bg-gradient-to-b from-transparent via-emerald-500 to-transparent"></div>
            <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-500 to-transparent"></div>
            
            {/* Animación de barrido de radar */}
            <div className="absolute top-1/2 left-1/2 w-64 h-64 -translate-x-1/2 -translate-y-1/2 rounded-full border-t border-emerald-400 bg-gradient-to-r from-emerald-500/20 to-transparent animate-[spin_4s_linear_infinite] origin-center"></div>
          </div>
          
          <div className="relative z-10 flex flex-col justify-between h-full">
            <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest bg-gray-900/50 backdrop-blur-md w-fit px-3 py-1.5 rounded-lg border border-gray-800">Monitoreo de Sector Activo</h3>
            <div className="bg-gray-800/80 backdrop-blur-md p-4 rounded-2xl border border-gray-700/50 flex items-start gap-4">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-ping mt-1.5 shadow-[0_0_10px_rgba(239,68,68,1)]"></div>
              <div className="flex flex-col">
                <span className="text-white font-black text-sm md:text-base leading-tight">Alerta Crítica: Araña Roja Detectada</span>
                <span className="text-emerald-400 text-[9px] font-black uppercase tracking-widest mt-1">Sector B • Cuadrante 4</span>
              </div>
            </div>
          </div>
        </div>

        {/* Distribución de Especies */}
        <div className="col-span-1 lg:col-span-2 bg-white/90 backdrop-blur-xl rounded-[40px] p-8 border border-gray-100 shadow-sm flex flex-col justify-center">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Distribución de Amenazas por Especie</h3>
          <div className="space-y-5">
            {[
              { name: 'Araña Roja', count: 12, max: 20, color: 'bg-red-500', bgBorder: 'border-red-100', text: 'text-red-700' },
              { name: 'Pulgón Verde', count: 5, max: 20, color: 'bg-orange-400', bgBorder: 'border-orange-100', text: 'text-orange-700' },
              { name: 'Trips', count: 2, max: 20, color: 'bg-blue-400', bgBorder: 'border-blue-100', text: 'text-blue-700' }
            ].map((p, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-gray-600">{p.name}</span>
                  <span className={`${p.text}`}>{p.count} avistamientos</span>
                </div>
                <div className={`h-2.5 w-full bg-gray-50 rounded-full overflow-hidden border ${p.bgBorder}`}>
                  <div className={`h-full rounded-full ${p.color} transition-all duration-1000`} style={{ width: `${(p.count/p.max)*100}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alertas Visuales Recientes */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Historial Reciente de Alertas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {[
            { id: 'AL-99', type: 'Araña Roja', conf: '98%', time: '14:20', date: '10/05/2024', status: 'CRÍTICO', statusColor: 'bg-red-500', cardBg: 'bg-red-50/80', borderColor: 'border-red-200', textStatus: 'text-red-700', zone: 'Sector B', id_inv: uniqueGreenhouses[0]?.id_invernadero },
            { id: 'AL-85', type: 'Pulgón Verde', conf: '85%', time: '13:55', date: '10/05/2024', status: 'ADVERTENCIA', statusColor: 'bg-orange-400', cardBg: 'bg-orange-50/80', borderColor: 'border-orange-200', textStatus: 'text-orange-700', zone: 'Sector A1', id_inv: uniqueGreenhouses[0]?.id_invernadero },
            { id: 'AL-72', type: 'Trips', conf: '72%', time: '12:10', date: '09/05/2024', status: 'OBSERVACIÓN', statusColor: 'bg-blue-400', cardBg: 'bg-blue-50/80', borderColor: 'border-blue-200', textStatus: 'text-blue-700', zone: 'Sector C', id_inv: uniqueGreenhouses[0]?.id_invernadero },
            { id: 'AL-68', type: 'Araña Roja', conf: '92%', time: '11:45', date: '09/05/2024', status: 'CRÍTICO', statusColor: 'bg-red-500', cardBg: 'bg-red-50/80', borderColor: 'border-red-200', textStatus: 'text-red-700', zone: 'Sector B2', id_inv: uniqueGreenhouses[1]?.id_invernadero },
            { id: 'AL-61', type: 'Mosca Blanca', conf: '88%', time: '09:30', date: '08/05/2024', status: 'ADVERTENCIA', statusColor: 'bg-orange-400', cardBg: 'bg-orange-50/80', borderColor: 'border-orange-200', textStatus: 'text-orange-700', zone: 'Sector D', id_inv: uniqueGreenhouses[1]?.id_invernadero },
            { id: 'AL-55', type: 'Trips', conf: '65%', time: '16:15', date: '07/05/2024', status: 'OBSERVACIÓN', statusColor: 'bg-blue-400', cardBg: 'bg-blue-50/80', borderColor: 'border-blue-200', textStatus: 'text-blue-700', zone: 'Sector E', id_inv: uniqueGreenhouses[2]?.id_invernadero },
            { id: 'AL-42', type: 'Pulgón Verde', conf: '96%', time: '08:05', date: '07/05/2024', status: 'CRÍTICO', statusColor: 'bg-red-500', cardBg: 'bg-red-50/80', borderColor: 'border-red-200', textStatus: 'text-red-700', zone: 'Sector A2', id_inv: uniqueGreenhouses[2]?.id_invernadero }
          ].filter(a => !selectedInvId || a.id_inv === selectedInvId)
           .map((a, i) => (
            <div key={i} className={`p-6 rounded-[32px] border ${a.borderColor} ${a.cardBg} backdrop-blur-md shadow-sm flex flex-col justify-between min-h-[180px] hover:-translate-y-1 transition-transform relative overflow-hidden group`}>
              <div className={`absolute top-0 right-0 w-2 h-full ${a.statusColor}`}></div>
              
              <div className="flex justify-between items-start relative z-10">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest bg-white/50 px-2 py-1 rounded-md">{a.id}</span>
                <span className={`px-2.5 py-1 rounded-md text-[8px] font-black uppercase tracking-widest bg-white/80 backdrop-blur-sm ${a.textStatus} shadow-sm border ${a.borderColor}`}>
                  {a.status}
                </span>
              </div>
              
              <div className="relative z-10 mt-4 mb-4">
                <h4 className="text-2xl font-black text-gray-800 tracking-tight leading-none">{a.type}</h4>
                <p className="text-[9px] font-bold text-gray-500 uppercase mt-2 tracking-widest">
                  📍 {a.zone} <span className="mx-1">•</span> 🕒 {a.date} {a.time}
                </p>
              </div>
              
              <div className="flex justify-between items-center mt-auto relative z-10 pt-4 border-t border-black/5">
                <div className="flex -space-x-2">
                  <div className="w-7 h-7 rounded-full bg-gray-200 border-2 border-white shadow-sm flex items-center justify-center text-[10px]">📷</div>
                  <div className="w-7 h-7 rounded-full bg-gray-100 border-2 border-white shadow-sm flex items-center justify-center text-[10px]">🌿</div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-0.5">Confianza</span>
                  <span className={`text-sm font-black ${a.textStatus}`}>{a.conf}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AlertasPlagas;
