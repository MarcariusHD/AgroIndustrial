import { useState, useEffect } from 'react';

import ClimateTrendChart from './ClimateTrendChart';

import { fetchSensorData } from './api';

import { useGreenhouses } from './useGreenhouses';

import SoilAnalysisModal from './SoilAnalysisModal';




const API_BASE_URL = 'http://localhost:8000';



// Mock data

const tempData = [

  { name: '00h', value: 18 }, { name: '04h', value: 16 },

  { name: '08h', value: 22 }, { name: '12h', value: 28 },

  { name: '16h', value: 30 }, { name: '20h', value: 24 }, { name: '23h', value: 19 },

];



const weeklyData = [

  { name: 'Lun', value: 22, type: 'Real' },

  { name: 'Mar', value: 24, type: 'Real' },

  { name: 'Mie', value: 23, type: 'Real' },

  { name: 'Jue', value: 26, type: 'Hoy' },

  { name: 'Vie', value: 28, type: 'Predicción' },

  { name: 'Sab', value: 27, type: 'Predicción' },

  { name: 'Dom', value: 25, type: 'Predicción' },

];



const MonitoreoGeneral = ({ userId }) => {

  const { greenhouses = [] } = useGreenhouses(userId);

  const [selectedInvId, setSelectedInvId] = useState(null);

  const [sensorValues, setSensorValues] = useState([]);

  const [loading, setLoading] = useState(false);

  const [unit, setUnit] = useState('C'); 

  const [period, setPeriod] = useState('today'); 

  const [lockedStatus, setLockedStatus] = useState({});

  const [isSoilModalOpen, setIsSoilModalOpen] = useState(false);



  const uniqueGreenhouses = Array.from(new Map(greenhouses.map(inv => [inv.nombre, inv])).values());



  useEffect(() => {

    if (!selectedInvId && uniqueGreenhouses.length > 0) {

      setSelectedInvId(uniqueGreenhouses[0].id_invernadero);

    }

  }, [uniqueGreenhouses, selectedInvId]);



  useEffect(() => {

    const loadData = async () => {

      setLoading(true);

      try {

        const data = await fetchSensorData(selectedInvId);

        setSensorValues(data);

      } catch (error) {

        console.error("Error al cargar datos de sensores:", error);

      } finally {

        setLoading(false);

      }

    };

    loadData();

  }, [selectedInvId]);



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



  const getSensorData = (name) => sensorValues.find(s => s.nombre === name);



  const convertTemp = (val) => unit === 'F' ? (val * 9/5) + 32 : val;

  const displayData = (period === 'today' ? tempData : weeklyData).map(d => ({

    ...d,

    value: convertTemp(d.value)

  }));



  return (

    <div className="space-y-6 animate-fadeIn font-sans min-h-[80vh]">


      {/* Cabecera */}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">

        <div className="space-y-1">

          <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em] flex items-center gap-2">

            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>

            Supervisión Ambiental

          </span>

          <h2 className="text-3xl lg:text-4xl font-black text-gray-800 tracking-tight">Monitor Climático</h2>

        </div>

        <div className="flex gap-2 p-1.5 bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-gray-100">

          <button 

            onClick={() => setUnit('C')}

            className={`w-10 h-10 rounded-xl font-black text-xs transition-all ${unit === 'C' ? 'bg-gray-800 text-white shadow-md' : 'bg-transparent text-gray-500 hover:bg-white hover:shadow-sm'}`}

          >°C</button>

          <button 

            onClick={() => setUnit('F')}

            className={`w-10 h-10 rounded-xl font-black text-xs transition-all ${unit === 'F' ? 'bg-gray-800 text-white shadow-md' : 'bg-transparent text-gray-500 hover:bg-white hover:shadow-sm'}`}

          >°F</button>

        </div>

      </div>



      {/* Selector de Invernaderos */}

      <div className="flex flex-wrap gap-3 p-3 bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-gray-100">

        {uniqueGreenhouses.map((inv) => {

          const isSelected = selectedInvId === inv.id_invernadero;

          return (

            <button

              key={inv.id_invernadero}

              onClick={() => {

                setSelectedInvId(inv.id_invernadero);

                if (lockedStatus[inv.id_invernadero]) setIsSoilModalOpen(true);

              }}

              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-2 ${

                isSelected 

                  ? 'bg-gradient-to-r from-green-600 to-green-500 text-white shadow-md shadow-green-500/30' 

                  : 'bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-800'

              }`}

            >

              🌿 {inv.nombre}

              {lockedStatus[inv.id_invernadero] && <span className="text-amber-400 animate-pulse text-sm">🔒</span>}

            </button>

          );

        })}

      </div>



      {selectedInvId && lockedStatus[selectedInvId] ? (

        <div className="bg-white/90 backdrop-blur-xl p-16 rounded-[40px] border border-gray-100 shadow-xl text-center flex flex-col justify-center items-center min-h-[500px] relative overflow-hidden">

          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-50 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>

          <div className="text-8xl mb-8 animate-bounce relative z-10 drop-shadow-xl">🔐</div>

          <h3 className="text-3xl font-black text-gray-800 tracking-tight mb-4 relative z-10">Análisis Requerido</h3>

          <p className="text-sm font-bold text-gray-500 uppercase tracking-widest max-w-xl mx-auto leading-relaxed mb-10 relative z-10">

            Para desbloquear las proyecciones climáticas, registre primero el balance de nutrientes en la central analítica.

          </p>

          <button 

            onClick={() => setIsSoilModalOpen(true)} 

            className="px-10 py-4 bg-gradient-to-r from-gray-800 to-black text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-gray-900/20 hover:scale-105 transition-transform relative z-10"

          >

            Comenzar Análisis

          </button>

        </div>

      ) : (

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Panel Izquierdo: Temp Hoy */}

          <div className="lg:col-span-4 bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col items-center justify-center min-h-[500px] relative overflow-hidden group">

            <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-50 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none transition-all duration-700 group-hover:bg-yellow-100"></div>

            <div className="text-8xl drop-shadow-[0_0_20px_rgba(250,204,21,0.4)] mb-8 relative z-10 animate-pulse-slow">☀️</div>

            <div className="text-center relative z-10 mb-8">

              <h3 className="text-7xl font-black text-gray-800 tracking-tighter mb-2">

                {Math.round(convertTemp(getSensorData('Temp. Aire')?.valor || 24))}°{unit}

              </h3>

              <p className="text-xs font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg inline-block">

                Condiciones Óptimas

              </p>

            </div>

            <div className="w-full space-y-4 relative z-10">

              <div className="flex justify-between items-center p-4 bg-gray-50/80 backdrop-blur-sm rounded-2xl border border-gray-100 transition-colors hover:bg-gray-100">

                <div className="flex items-center gap-3">

                  <span className="text-xl">⛅</span>

                  <span className="text-xs font-black text-gray-600 uppercase tracking-widest">Cielo</span>

                </div>

                <span className="text-xs font-bold text-gray-400 uppercase">Despejado</span>

              </div>

              <div className="flex justify-between items-center p-4 bg-blue-50/80 backdrop-blur-sm rounded-2xl border border-blue-100 transition-colors hover:bg-blue-100">

                <div className="flex items-center gap-3">

                  <span className="text-xl">🚿</span>

                  <span className="text-xs font-black text-blue-700 uppercase tracking-widest">Riego</span>

                </div>

                <span className="text-xs font-bold text-blue-500 uppercase flex items-center gap-2">

                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse shadow-[0_0_5px_rgba(59,130,246,0.8)]"></span>

                  Activo

                </span>

              </div>

            </div>

          </div>



          {/* Panel Derecho */}

          <div className="lg:col-span-8 flex flex-col gap-6">

            <ClimateTrendChart data={displayData} unit={unit} period={period} onPeriodChange={setPeriod} />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {/* Cards KPIs */}

              <div className="bg-white/90 backdrop-blur-xl p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:border-amber-200 transition-colors">

                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Índice de Calor</h4>

                <div className="flex justify-between items-end">

                  <span className="text-4xl font-black text-gray-800 group-hover:text-amber-500 transition-colors">4.2</span>

                  <span className="text-[10px] font-black uppercase text-amber-600 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-100">Moderado</span>

                </div>

              </div>

              

              <div className="bg-white/90 backdrop-blur-xl p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between group hover:border-indigo-200 transition-colors">

                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Fotoperiodo</h4>

                <div className="space-y-3">

                  <div className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-xl group-hover:bg-indigo-50 transition-colors">

                    <span className="text-[10px] font-bold text-gray-400 uppercase">Inicio</span>

                    <span className="text-xs font-black text-gray-800">06:45 AM</span>

                  </div>

                  <div className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-xl group-hover:bg-indigo-50 transition-colors">

                    <span className="text-[10px] font-bold text-gray-400 uppercase">Fin</span>

                    <span className="text-xs font-black text-gray-800">18:30 PM</span>

                  </div>

                </div>

              </div>



              <div className="bg-white/90 backdrop-blur-xl p-6 rounded-3xl shadow-sm border border-gray-100 flex justify-between items-center group hover:border-blue-200 transition-colors">

                <div className="flex flex-col h-full justify-between">

                  <div>

                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Humedad</h4>

                    <p className="text-4xl font-black text-gray-800 mb-2">65%</p>

                  </div>

                  <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100 w-fit">Óptimo</span>

                </div>

                <div className="w-4 h-24 bg-gray-100 rounded-full overflow-hidden flex flex-col justify-end shadow-inner">

                  <div className="bg-gradient-to-t from-blue-600 to-blue-400 w-full rounded-full transition-all duration-1000 group-hover:from-blue-500 group-hover:to-cyan-400" style={{ height: '65%' }}></div>

                </div>

              </div>

            </div>

          </div>

        </div>

      )}



      <SoilAnalysisModal 

        isOpen={isSoilModalOpen}

        onClose={() => {

          setIsSoilModalOpen(false);

          fetch(`${API_BASE_URL}/invernaderos/${selectedInvId}/analisis-suelo`)

            .then(res => res.json())

            .then(data => setLockedStatus(prev => ({ ...prev, [selectedInvId]: !data })));

        }}

        greenhouseId={selectedInvId}

      />

    </div>

  );

};



export default MonitoreoGeneral;
