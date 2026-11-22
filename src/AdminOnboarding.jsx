import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import InvModal from './InvModal';
import SoilAnalysisModal from './SoilAnalysisModal';
import CompModal from './CompModal';
import { createGreenhouse, fetchGreenhouses, createDevice } from './api';

const AdminOnboarding = ({ userNames, onComplete }) => {
  const [step, setStep] = useState(1);

  // Greenhouse States
  const [selectedGreenhouseId, setSelectedGreenhouseId] = useState(null);
  const [isInvModalOpen, setIsInvModalOpen] = useState(false);
  const [showSelectGreenhouse, setShowSelectGreenhouse] = useState(false);
  const [greenhouses, setGreenhouses] = useState([]);
  
  // Device/Component States
  const [isCompModalOpen, setIsCompModalOpen] = useState(false);
  const [addedComponents, setAddedComponents] = useState([]);

  // Checklist States
  const [task1Completed, setTask1Completed] = useState(false);
  const [task2Completed, setTask2Completed] = useState(false);
  const [task3Completed, setTask3Completed] = useState(false);

  // Modal Visibilities
  const [showSoilModal, setShowSoilModal] = useState(false);
  const [showWaitModal, setShowWaitModal] = useState(false);
  const [showRecsModal, setShowRecsModal] = useState(false);

  useEffect(() => {
    const loadGreenhouses = async () => {
      try {
        const data = await fetchGreenhouses();
        setGreenhouses(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error al cargar invernaderos:", err);
      }
    };
    loadGreenhouses();
  }, []);

  const handleSaveGreenhouse = async (data) => {
    try {
      const resp = await createGreenhouse(data);
      if (resp && resp.id_invernadero) {
        setSelectedGreenhouseId(resp.id_invernadero);
        setIsInvModalOpen(false);
        handleNext();
      } else {
        alert("Error: No se devolvió el ID del invernadero.");
      }
    } catch (err) {
      console.error(err);
      alert("Error al crear invernadero");
    }
  };

  const handleExistingGreenhouseSelect = (e) => {
    setSelectedGreenhouseId(Number(e.target.value));
  };

  const handleSaveComponent = async (data) => {
    try {
      const resp = await createDevice(data);
      setAddedComponents(prev => [...prev, data]);
      setIsCompModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("Error al crear componente");
    }
  };

  // Animations variants
  const slideVariants = {
    hidden: { x: 50, opacity: 0 },
    visible: { x: 0, opacity: 1 },
    exit: { x: -50, opacity: 0 }
  };

  const handleNext = () => setStep(prev => prev + 1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/80 backdrop-blur-md font-sans">
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div 
            key="step1"
            variants={slideVariants} initial="hidden" animate="visible" exit="exit"
            className="bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col md:flex-row w-[90%] max-w-4xl h-[600px] relative"
          >
            <div className="w-full md:w-1/2 h-64 md:h-full relative bg-emerald-900">
              <img src="https://images.unsplash.com/photo-1592424001742-995c7324d9c7?auto=format&fit=crop&q=80&w=800" alt="Invernadero" className="w-full h-full object-cover mix-blend-overlay opacity-60" />
              <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-emerald-900/90 to-transparent flex items-end md:items-center p-10">
                <div>
                  <h1 className="text-4xl md:text-5xl font-black text-white leading-none tracking-tight">Bienvenido a la Gerencia.</h1>
                  <p className="text-emerald-300 font-bold mt-4 tracking-widest uppercase text-xs">Nuevo Rol de Administrador Activado</p>
                </div>
              </div>
            </div>
            <div className="w-full md:w-1/2 p-12 flex flex-col justify-center items-center text-center bg-white">
              <span className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-sm border border-emerald-100">👑</span>
              <h2 className="text-3xl font-black text-gray-800 tracking-tight mb-4">Hola, {userNames ? userNames.split(' ')[0] : 'Administrador'}</h2>
              <p className="text-gray-500 font-medium leading-relaxed mb-12">Has sido promovido al rol de Administrador. Ahora tienes control total sobre la infraestructura, el análisis de bioseguridad y la gestión del personal. Vamos a configurar tu espacio de trabajo.</p>
              
              <button 
                onClick={handleNext}
                className="group relative flex items-center gap-4 bg-emerald-600 text-white px-8 py-4 rounded-full font-black uppercase text-xs tracking-widest hover:bg-emerald-700 transition-all shadow-lg hover:shadow-emerald-600/30 active:scale-95"
              >
                Comenzar Configuración
                <span className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center group-hover:translate-x-2 transition-transform">→</span>
              </button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div 
            key="step2"
            variants={slideVariants} initial="hidden" animate="visible" exit="exit"
            className="bg-white rounded-[40px] shadow-2xl p-12 w-[90%] max-w-2xl text-center relative overflow-hidden"
          >
            <div className="absolute -top-32 -left-32 w-64 h-64 bg-emerald-100 rounded-full blur-3xl opacity-50"></div>
            
            <h2 className="text-3xl font-black text-gray-800 tracking-tight mb-2 relative z-10">Veamos primero el estado de tu invernadero</h2>
            <p className="text-gray-500 mb-10 text-sm relative z-10">El sistema central necesita conectarse a una infraestructura física para monitorear componentes y variables ambientales.</p>
            
            {!showSelectGreenhouse ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                <button onClick={() => setIsInvModalOpen(true)} className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 p-8 rounded-3xl flex flex-col items-center justify-center gap-4 transition-all hover:-translate-y-2 group">
                  <span className="text-4xl group-hover:scale-110 transition-transform">🏗️</span>
                  <span className="font-black text-emerald-800 uppercase text-xs tracking-widest">Crear Invernadero Nuevo</span>
                </button>
                <button onClick={() => setShowSelectGreenhouse(true)} className="bg-blue-50 hover:bg-blue-100 border border-blue-200 p-8 rounded-3xl flex flex-col items-center justify-center gap-4 transition-all hover:-translate-y-2 group">
                  <span className="text-4xl group-hover:scale-110 transition-transform">✅</span>
                  <span className="font-black text-blue-800 uppercase text-xs tracking-widest">Ya tengo Invernadero</span>
                </button>
              </div>
            ) : (
              <div className="relative z-10 flex flex-col items-center animate-fadeIn">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-4">Selecciona tu Invernadero</label>
                <select 
                  className="w-full max-w-md px-5 py-4 bg-gray-50 border-none rounded-[20px] text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all mb-6"
                  onChange={handleExistingGreenhouseSelect}
                  value={selectedGreenhouseId || ""}
                >
                  <option value="" disabled>Selecciona uno...</option>
                  {greenhouses.map(g => (
                    <option key={g.id_invernadero} value={g.id_invernadero}>{g.nombre}</option>
                  ))}
                </select>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setShowSelectGreenhouse(false)} 
                    className="px-6 py-3 bg-gray-100 text-gray-500 rounded-[20px] font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all"
                  >
                    Volver
                  </button>
                  <button 
                    onClick={handleNext}
                    disabled={!selectedGreenhouseId}
                    className="px-8 py-3 bg-blue-600 text-white rounded-[20px] font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continuar
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {step === 3 && (
          <motion.div 
            key="step3"
            variants={slideVariants} initial="hidden" animate="visible" exit="exit"
            className="bg-white rounded-[40px] shadow-2xl p-12 w-[90%] max-w-2xl text-center relative overflow-hidden flex flex-col h-[600px]"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50"></div>
            
            <div className="w-16 h-16 bg-blue-100 rounded-3xl mx-auto mb-6 flex items-center justify-center text-3xl shadow-inner border border-blue-200 flex-shrink-0">🔌</div>
            <h2 className="text-3xl font-black text-gray-800 tracking-tight mb-2 relative z-10 flex-shrink-0">Organización de Componentes</h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-6 relative z-10 flex-shrink-0">Añade los primeros dispositivos (sensores, bombas) a tu invernadero para comenzar a monitorearlo.</p>
            
            <div className="flex-grow overflow-y-auto mb-6 bg-gray-50 rounded-3xl p-6 border border-gray-100 relative z-10 custom-scrollbar text-left">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-black text-gray-700 uppercase tracking-widest">Componentes Registrados</h3>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">{addedComponents.length} Dispositivos</span>
              </div>
              
              {addedComponents.length === 0 ? (
                <div className="h-32 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl">
                  <span className="text-2xl mb-2">📭</span>
                  <p className="text-xs font-bold uppercase tracking-widest">Aún no hay componentes</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {addedComponents.map((comp, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-gray-800 text-sm">{comp.name}</h4>
                        <p className="text-xs text-gray-500">{comp.type} • {comp.location}</p>
                      </div>
                      <span className={`w-3 h-3 rounded-full ${comp.active ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                    </div>
                  ))}
                </div>
              )}
              
              <button 
                onClick={() => setIsCompModalOpen(true)}
                className="w-full mt-4 py-4 border-2 border-dashed border-blue-200 text-blue-600 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-50 hover:border-blue-300 transition-all"
              >
                + Añadir Nuevo Componente
              </button>
            </div>

            <div className="flex justify-center flex-shrink-0">
              <button 
                onClick={handleNext}
                className="bg-gray-900 text-white px-10 py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-black transition-all shadow-xl active:scale-95"
              >
                Continuar al Checklist
              </button>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div 
            key="step4"
            variants={slideVariants} initial="hidden" animate="visible" exit="exit"
            className="bg-white rounded-[40px] shadow-2xl p-12 w-[90%] max-w-2xl relative overflow-hidden"
          >
            <h2 className="text-3xl font-black text-gray-800 tracking-tight mb-2 text-center">Veremos el estado de tu invernadero</h2>
            <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mb-10 text-center">Checklist de Activación Inicial</p>
            
            <div className="space-y-6 mb-12">
              <button 
                onClick={() => setShowSoilModal(true)}
                disabled={task1Completed}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-all ${task1Completed ? 'bg-emerald-100 border-emerald-300 opacity-75 cursor-default' : 'bg-emerald-50/50 border-emerald-100 hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-100 cursor-pointer group'}`}
              >
                <div className={`w-8 h-8 rounded-full text-white font-black flex items-center justify-center flex-shrink-0 shadow-sm ${task1Completed ? 'bg-emerald-600' : 'bg-emerald-500 group-hover:scale-110 transition-transform'}`}>
                  {task1Completed ? '✔' : '1'}
                </div>
                <div>
                  <h4 className="font-black text-emerald-900 mb-1">Llenar Formulario de Balance Químico</h4>
                  <p className="text-sm text-emerald-700/80">El análisis de suelo debe anclarse al invernadero para calibrar la IA.</p>
                </div>
              </button>
              
              <button 
                onClick={() => setShowWaitModal(true)}
                disabled={task2Completed}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-all ${task2Completed ? 'bg-amber-100 border-amber-300 opacity-75 cursor-default' : 'bg-amber-50/50 border-amber-100 hover:-translate-y-1 hover:shadow-lg hover:shadow-amber-100 cursor-pointer group'}`}
              >
                <div className={`w-8 h-8 rounded-full text-white font-black flex items-center justify-center flex-shrink-0 shadow-sm ${task2Completed ? 'bg-amber-600' : 'bg-amber-500 group-hover:scale-110 transition-transform'}`}>
                  {task2Completed ? '✔' : '2'}
                </div>
                <div className="flex-grow">
                  <h4 className="font-black text-amber-900 mb-1">Dejar Componentes Activos 1 Hora</h4>
                  <p className="text-sm text-amber-700/80">Los sensores necesitan recopilar datos ambientales base.</p>
                </div>
              </button>

              <button 
                onClick={() => setShowRecsModal(true)}
                disabled={task3Completed}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-all ${task3Completed ? 'bg-blue-100 border-blue-300 opacity-75 cursor-default' : 'bg-blue-50/50 border-blue-100 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-100 cursor-pointer group'}`}
              >
                <div className={`w-8 h-8 rounded-full text-white font-black flex items-center justify-center flex-shrink-0 shadow-sm ${task3Completed ? 'bg-blue-600' : 'bg-blue-500 group-hover:scale-110 transition-transform'}`}>
                  {task3Completed ? '✔' : '3'}
                </div>
                <div>
                  <h4 className="font-black text-blue-900 mb-1">Recomendaciones Previas</h4>
                  <p className="text-sm text-blue-700/80">Revisa la infraestructura física de tu invernadero antes de operar.</p>
                </div>
              </button>
            </div>
            
            <div className="flex justify-center">
              <button 
                onClick={onComplete}
                disabled={!(task1Completed && task2Completed && task3Completed)}
                className={`px-12 py-4 rounded-2xl font-black uppercase text-sm tracking-widest transition-all shadow-xl flex items-center gap-3 ${
                  (task1Completed && task2Completed && task3Completed)
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-emerald-600/30 active:scale-95'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50'
                }`}
              >
                🚀 Listo para Comenzar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <InvModal 
        isOpen={isInvModalOpen} 
        onClose={() => setIsInvModalOpen(false)} 
        mode="add" 
        onSave={handleSaveGreenhouse} 
        greenhouses={greenhouses} 
      />

      <SoilAnalysisModal 
        isOpen={showSoilModal} 
        onClose={() => { setShowSoilModal(false); setTask1Completed(true); }} 
        greenhouseId={selectedGreenhouseId} 
        isForced={true} 
      />

      <CompModal 
        isOpen={isCompModalOpen} 
        onClose={() => setIsCompModalOpen(false)} 
        mode="add" 
        onSave={handleSaveComponent} 
        greenhouses={greenhouses} 
        initialData={{ name: '', type: 'Bomba de Agua', id_invernadero: selectedGreenhouseId, location: '', active: true }}
      />

      {/* Modal Tarea 2 */}
      {showWaitModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/80 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[30px] p-10 max-w-sm w-[90%] text-center shadow-2xl">
            <div className="w-20 h-20 mx-auto bg-amber-100 rounded-full flex items-center justify-center mb-6 relative">
              <span className="text-4xl relative z-10">⏱️</span>
              <div className="absolute inset-0 border-4 border-amber-500 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <h3 className="text-xl font-black text-gray-800 mb-2">Calibrando Sensores</h3>
            <p className="text-gray-500 text-sm mb-8">Tiempo estimado: 1 Hora</p>
            <button 
              onClick={() => { setShowWaitModal(false); setTask2Completed(true); }}
              className="w-full py-4 bg-amber-500 text-white rounded-xl font-black uppercase text-xs tracking-widest hover:bg-amber-600 transition-all shadow-lg active:scale-95"
            >
              Saltar
            </button>
          </motion.div>
        </div>
      )}

      {/* Modal Tarea 3 - Revista */}
      {showRecsModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/90 backdrop-blur-md py-10 font-serif">
          <motion.div initial={{ y: 50, opacity: 0, rotateX: -10 }} animate={{ y: 0, opacity: 1, rotateX: 0 }} transition={{ type: 'spring', damping: 20 }} className="bg-[#fdfbf7] rounded-none sm:rounded-[10px] p-0 w-full max-w-4xl h-[90vh] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden relative">
            
            {/* Cabecera Revista */}
            <div className="bg-[#2c3e2e] text-[#f4ecd8] p-10 flex-shrink-0 relative overflow-hidden">
              <div className="absolute top-0 right-0 opacity-10 text-[150px] leading-none -mt-10 -mr-10 font-serif italic">Agro</div>
              <p className="text-xs font-sans font-bold uppercase tracking-[0.3em] mb-4 text-[#a8bda9]">Manual Operativo • Edición 01</p>
              <h2 className="text-5xl md:text-6xl font-black mb-4 tracking-tighter">
                Guía Estructural <br/><span className="font-light italic text-[#d4dfd5]">Previa.</span>
              </h2>
              <p className="text-lg md:text-xl font-light opacity-90 max-w-xl font-sans">
                Antes de poner en marcha las automatizaciones, asegúrese de revisar minuciosamente su infraestructura física.
              </p>
            </div>

            {/* Contenido Revista con Grid */}
            <div className="flex-grow overflow-y-auto custom-scrollbar p-10 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                
                {/* Columna Izquierda */}
                <div className="space-y-10">
                  <div className="relative">
                    <span className="text-8xl text-[#e6e2d6] font-black absolute -top-8 -left-4 -z-10">01</span>
                    <h4 className="text-xl font-bold text-[#2c3e2e] mb-3 uppercase tracking-widest font-sans border-b border-[#2c3e2e]/20 pb-2">Estructura & Materiales</h4>
                    <p className="text-[#555] leading-relaxed text-justify first-letter:text-5xl first-letter:font-black first-letter:text-[#2c3e2e] first-letter:mr-1 first-letter:float-left">
                      La calidad de los materiales define la resiliencia del invernadero. Utilice estructuras de acero galvanizado o aluminio resistente a la corrosión. Verifique que las mallas antisombra y los plásticos de cubierta no presenten fisuras mayores a 5cm para no comprometer el microclima interior.
                    </p>
                  </div>

                  <div className="relative">
                    <span className="text-8xl text-[#e6e2d6] font-black absolute -top-8 -left-4 -z-10">02</span>
                    <h4 className="text-xl font-bold text-[#2c3e2e] mb-3 uppercase tracking-widest font-sans border-b border-[#2c3e2e]/20 pb-2">Ventilación</h4>
                    <p className="text-[#555] leading-relaxed text-justify">
                      Una buena aeración previene la condensación y la proliferación de hongos. Implemente ventilación cenital (en el techo) con una superficie no menor al 20% del área total, combinada con ventilas laterales automatizadas para un flujo cruzado óptimo.
                    </p>
                  </div>
                </div>

                {/* Columna Derecha */}
                <div className="space-y-10">
                  <div className="relative">
                    <span className="text-8xl text-[#e6e2d6] font-black absolute -top-8 -left-4 -z-10">03</span>
                    <h4 className="text-xl font-bold text-[#2c3e2e] mb-3 uppercase tracking-widest font-sans border-b border-[#2c3e2e]/20 pb-2">Drenaje & Riego</h4>
                    <p className="text-[#555] leading-relaxed text-justify">
                      Diseñe una pendiente del 1% al 2% en el terreno para facilitar la evacuación de excedentes. Haga una purga inicial de las tuberías por 5 minutos para eliminar sedimentos antes de conectar los goteros compensados. El área técnica de mezcla debe estar aislada para evitar contaminaciones.
                    </p>
                  </div>

                  <div className="relative">
                    <span className="text-8xl text-[#e6e2d6] font-black absolute -top-8 -left-4 -z-10">04</span>
                    <h4 className="text-xl font-bold text-[#2c3e2e] mb-3 uppercase tracking-widest font-sans border-b border-[#2c3e2e]/20 pb-2">Área Técnica</h4>
                    <p className="text-[#555] leading-relaxed text-justify">
                      Ubique el centro de control en una zona libre de humedad directa y exposición solar. Los tableros eléctricos deben tener grado de protección IP65 mínimo. Mantenga un perímetro de bioseguridad de 5 metros libre de malezas para prevenir el ingreso de vectores.
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* Pie de Revista */}
            <div className="flex-shrink-0 bg-white border-t-4 border-[#2c3e2e] p-6 flex justify-between items-center shadow-[0_-10px_20px_rgba(0,0,0,0.05)] z-10">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400 font-sans">Lectura Completada</span>
              <button 
                onClick={() => { setShowRecsModal(false); setTask3Completed(true); }}
                className="px-12 py-4 bg-[#2c3e2e] text-[#f4ecd8] rounded-none font-sans font-black uppercase text-xs tracking-[0.2em] hover:bg-black transition-all shadow-lg active:scale-95"
              >
                Entendido
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminOnboarding;
