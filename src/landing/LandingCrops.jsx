import SeasonCropDetailView from './SeasonCropDetailView';
import manualPhasesData from './manualPhasesData';
import { motion } from 'framer-motion';
import { API_BASE_URL, seasonCrops } from '../landingData';
import { useLanding } from './LandingContext';

export default function LandingCrops() {
  const {
    selectedCrop,
    setSelectedCrop,
    selectedManualStepIndex,
    setSelectedManualStepIndex,
    showGeneralSteps,
    setShowGeneralSteps,
    uniqueGreenhouses,
    getPlants,
    isLoggedIn,
    setCurrentView
  } = useLanding();
if (selectedManualStepIndex !== null) {
          const stepData = manualPhasesData[selectedManualStepIndex];
          return (
            <div className="w-full min-h-screen px-6 md:px-24 py-12 animate-fadeIn pb-32 space-y-16 bg-[#faf9f5]">
              <button onClick={() => setSelectedManualStepIndex(null)} className="flex items-center gap-3 px-6 py-3 bg-stone-900 text-white rounded-full text-[11px] font-black uppercase tracking-widest shadow-xl hover:bg-emerald-800 transition-all">
                ← Volver al Manual
              </button>
              
              {/* Cabecera Editorial Minimalista */}
              <div className="text-center space-y-4">
                <p className="text-sm font-black uppercase tracking-[0.5em] text-emerald-800">Crónica de Huerto &amp; Ingeniería Agrónoma</p>
                <h2 className="text-5xl md:text-8xl font-serif font-black text-stone-900 tracking-tighter italic leading-none">
                  {stepData.title}
                </h2>
                <div className="flex justify-center items-center gap-8 text-xs font-bold text-stone-500 uppercase tracking-[0.3em]">
                  <span>Edición Especial de Cultivo</span>
                  <span className="text-emerald-600 opacity-30">●</span>
                  <span>Protocolos de Preparación</span>
                </div>
              </div>

              {/* Copete Informativo con Imagen Lateral */}
              <div className="max-w-7xl mx-auto border-y border-stone-200 py-20 grid lg:grid-cols-2 gap-20 items-center">
                <div className="space-y-8">
                  <p className="text-2xl md:text-3xl font-serif text-stone-800 leading-relaxed italic first-letter:text-8xl first-letter:font-black first-letter:text-emerald-900 first-letter:float-left first-letter:mr-6 first-letter:leading-[0.8] text-justify">
                    {stepData.intro}
                  </p>
                  <div className="w-32 h-1 bg-emerald-600/20"></div>
                </div>
                <div className="rounded-[4rem] overflow-hidden shadow-2xl h-[550px] border-8 border-white bg-white">
                  <img src={`${API_BASE_URL}/api/asset/IMG/${stepData.img}`} className="w-full h-full object-cover transition-all duration-1000" alt="Ingeniería Agrónoma" />
                </div>
              </div>

              {/* Secciones de Información Sin Contenedores (Abiertas) */}
              <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-x-20 gap-y-24 pt-4">
                {stepData.pillars.map((item, i) => (
                  <div key={i} className={`space-y-6 pb-12 border-b border-stone-200 last:border-0 md:border-b-0 ${item.fullWidth ? 'md:col-span-2' : ''}`}>
                    <div className="flex items-center gap-6 group">
                      <span className="text-5xl transition-all duration-500">{item.icon}</span>
                      <h4 className="text-3xl font-serif font-black text-stone-900 tracking-tight underline decoration-emerald-500/30 underline-offset-8">
                        {item.title}
                      </h4>
                    </div>
                    <p className="text-stone-700 font-medium text-xl leading-relaxed text-justify">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>

              {/* Consejo de Cierre */}
              <div className="pt-20 border-t-2 border-stone-800 text-center space-y-6 max-w-4xl mx-auto pb-20">
                <span className="text-5xl block">🌿</span>
                <h4 className="text-sm font-black uppercase text-stone-500 tracking-[0.5em]">El Manifiesto de la Paciencia</h4>
                <p className="text-stone-800 font-serif text-3xl italic leading-snug">
                  "{stepData.quote}"
                </p>
                <div className="w-24 h-1 bg-emerald-600 mx-auto mt-8"></div>
              </div>
            </div>
          );
        }
if (showGeneralSteps) {
          return (
            <div className="animate-fadeIn">
              {/* Hero del Manual */}
              <div className="relative h-[300px] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#021404] via-[#05290a] to-[#010a02]"></div>
                <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[120px] -mr-32 -mt-32"></div>
                <div className="relative z-10 h-full flex flex-col justify-center px-16">
                  <button onClick={() => setShowGeneralSteps(false)} className="flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10 hover:bg-white/20 transition-all w-fit mb-6">← Volver al Catálogo</button>
                  <span className="text-[#71cc49] font-black uppercase text-[11px] tracking-[0.5em] block mb-3">Protocolo de Ingeniería Agrónoma</span>
                  <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter uppercase italic">Manual del Cultivador</h2>
                  <p className="text-white/40 font-medium text-base mt-3 max-w-xl">Los fundamentos científicos y prácticos para llevar tu huerta al máximo potencial. Cada fase contiene información técnica detallada.</p>
                </div>
              </div>

              {/* Steps Grid */}
              <div className="px-16 py-16 space-y-8 max-w-6xl mx-auto">
                {[
                  { title: "Planificación Estratégica", text: "Elige un lugar con al menos 6 horas de sol directo. Diseña la geometría de tu espacio productivo y calcula los recursos necesarios.", icon: "📋", color: "emerald" },
                  { title: "Suelo y Nutrición", text: "Mezcla un 40% de materia orgánica (compost). Comprende la microbiología del suelo y el balance de nutrientes N-P-K.", icon: "🟫", color: "amber" },
                  { title: "La Siembra", text: "Respeta la profundidad (2-3 veces el tamaño de la semilla). Conoce las diferencias entre siembra directa y almácigos.", icon: "🌱", color: "green" },
                  { title: "Riego Inteligente", text: "Nunca riegues las hojas para evitar hongos. Domina la hidrodinámica vegetal y los sistemas de eficiencia hídrica.", icon: "🚿", color: "blue" }
                ].map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.12 }}
                    onClick={() => setSelectedManualStepIndex(i)}
                    className="bg-white rounded-[3rem] border border-gray-100 shadow-lg hover:shadow-2xl hover:border-emerald-200 transition-all cursor-pointer group overflow-hidden"
                  >
                    <div className="flex items-stretch">
                      {/* Number indicator */}
                      <div className="bg-[#031c06] w-28 flex-shrink-0 flex flex-col items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#71cc49 1px, transparent 1px)', backgroundSize: '15px 15px' }}></div>
                        <span className="text-5xl relative z-10 group-hover:scale-110 transition-transform">{step.icon}</span>
                        <span className="text-white/30 font-black text-xs uppercase tracking-widest mt-2 relative z-10">Fase {(i + 1).toString().padStart(2, '0')}</span>
                      </div>
                      <div className="p-10 flex-grow flex items-center justify-between gap-8">
                        <div className="space-y-2">
                          <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight group-hover:text-[#207b25] transition-colors">
                            {step.title}
                          </h3>
                          <p className="text-gray-500 font-medium leading-relaxed text-[15px] max-w-xl">{step.text}</p>
                        </div>
                        <div className="flex-shrink-0 w-12 h-12 bg-gray-50 group-hover:bg-emerald-500 rounded-2xl flex items-center justify-center transition-all">
                          <svg className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          );
        }
if (selectedCrop) {
          // Reutilizamos la vista de detalle de temporada que ya tiene el formato deseado.
          return <SeasonCropDetailView crop={selectedCrop} selectedSeason={"General"} onBack={() => setSelectedCrop(null)} />;
        }
return (
          <div className="animate-fadeIn">
            {/* Hero de Cultivo */}
            <div className="relative h-[380px] overflow-hidden">
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${API_BASE_URL}/api/asset/IMG/cultivo3)` }}></div>
              <div className="absolute inset-0 bg-gradient-to-b from-[#031c06]/85 via-[#031c06]/60 to-gray-100"></div>
              <div className="relative z-10 h-full flex flex-col justify-center px-16 max-w-4xl">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                  <span className="text-[#71cc49] font-black uppercase text-[11px] tracking-[0.5em] block mb-4">Centro de Conocimiento</span>
                  <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-white leading-[0.9]">Guía de Cultivo Profesional</h1>
                  <p className="text-white/50 font-medium text-lg mt-4 max-w-xl">Accede al manual del cultivador y explora las fichas técnicas de los cultivos registrados en tus invernaderos.</p>
                </motion.div>
              </div>
            </div>

            <div className="px-16 py-16 space-y-20 max-w-7xl mx-auto">
              {/* Manual Card */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                onClick={() => setShowGeneralSteps(true)}
                className="relative overflow-hidden rounded-[4rem] cursor-pointer group"
              >
                <div className="absolute inset-0 bg-[#031c06]"></div>
                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#71cc49 1.5px, transparent 1.5px)', backgroundSize: '40px 40px' }}></div>
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-500/15 rounded-full blur-[100px] -mr-32 -mt-32"></div>
                
                <div className="relative z-10 p-12 md:p-16 flex flex-col md:flex-row items-center gap-12">
                  <div className="flex-shrink-0">
                    <div className="w-28 h-28 bg-emerald-500/20 rounded-[2.5rem] flex items-center justify-center group-hover:bg-emerald-500/30 group-hover:scale-105 transition-all">
                      <span className="text-6xl">📖</span>
                    </div>
                  </div>
                  <div className="space-y-4 flex-grow text-center md:text-left">
                    <div className="flex flex-col md:flex-row md:items-center gap-3">
                      <h3 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight">Manual del Cultivador</h3>
                      <span className="bg-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-full w-fit mx-auto md:mx-0">4 Fases Técnicas</span>
                    </div>
                    <p className="text-white/40 font-medium text-base max-w-2xl">Desde la planificación estratégica hasta el riego inteligente. Domina los fundamentos de la ingeniería agrónoma con protocolos detallados y consejos prácticos.</p>
                    <div className="flex flex-wrap justify-center md:justify-start gap-3 pt-2">
                      {["Planificación", "Suelo & Nutrición", "Siembra", "Riego"].map((step, i) => (
                        <span key={i} className="bg-white/5 border border-white/10 text-white/60 text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-full flex items-center gap-2">
                          <span className="w-4 h-4 bg-emerald-500/30 rounded-full flex items-center justify-center text-[7px] text-emerald-400 font-black">{i+1}</span>
                          {step}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-emerald-900/30">
                      <svg className="w-6 h-6 text-[#031c06]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </div>
                  </div>
                </div>
              </motion.section>

              {/* Mis Cultivos Registrados */}
              {(() => {
                const allPlants = uniqueGreenhouses.flatMap(inv => getPlants(inv.descripcion));
                const uniquePlantNames = [...new Set(allPlants)];

                if (uniquePlantNames.length === 0) {
                  return (
                    <div className="text-center py-20 space-y-6">
                      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-5xl">🌱</div>
                      <h3 className="text-3xl font-black text-gray-300 uppercase tracking-tight">Sin Cultivos Registrados</h3>
                      <p className="text-gray-400 font-medium max-w-md mx-auto">Registra un invernadero con cultivos asignados para ver sus fichas técnicas aquí.</p>
                      {isLoggedIn && (
                        <button onClick={() => setCurrentView('invernadero')} className="px-10 py-4 bg-[#031c06] text-white rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-[#207b25] transition-all shadow-lg">
                          Ir a Invernaderos
                        </button>
                      )}
                    </div>
                  );
                }

                const plantData = uniquePlantNames.map(name => {
                  let cropInfo = Object.values(seasonCrops).flat().find(c => c.nombre.toLowerCase() === name.toLowerCase());

                  let cropImg = cropInfo?.img;
                  if (!cropImg) {
                    const ln = name.toLowerCase();
                    if (ln.includes('tomate')) cropImg = 'Tomate_Cherry';
                    else if (ln.includes('lechuga')) cropImg = 'lechuga_romana';
                    else if (ln.includes('zanahoria')) cropImg = 'cultivo2';
                    else if (ln.includes('brócoli') || ln.includes('brocoli')) cropImg = 'brocoli';
                    else cropImg = 'cultivo4';
                  }

                  let shortDesc = cropInfo?.desc || "Cultivo registrado en invernadero.";
                  let detailedDesc = "Este cultivo ha sido registrado en uno de sus invernaderos. Para obtener información detallada sobre su manejo, consulte la ficha técnica de la temporada correspondiente o el manual del cultivador.";

                  if (name.toLowerCase().includes("tomate cherry")) {
                    shortDesc = "Pequeños y dulces.";
                    detailedDesc = "El tomate cherry es una variedad de tomate de pequeño tamaño, conocido por su dulzura y versatilidad. Es ideal para cultivar en huertos caseros o macetas, requiriendo un buen soporte para su crecimiento vertical y una exposición solar abundante para un desarrollo óptimo de sus frutos.";
                  } else if (name.toLowerCase().includes("lechuga romana")) {
                    shortDesc = "Hojas crujientes y sabor suave.";
                    detailedDesc = "La lechuga romana es apreciada por sus hojas crujientes y alargadas. Es un cultivo de ciclo corto, ideal para climas templados. Requiere riegos constantes pero ligeros para evitar que las hojas se amarguen y un suelo bien drenado para prevenir enfermedades en la raíz.";
                  } else if (name.toLowerCase().includes("lechuga")) { // Información detallada para cualquier tipo de Lechuga
                    shortDesc = "Frescas y versátiles.";
                    detailedDesc = "Las lechugas son cultivos de hoja verde muy populares, apreciadas por su frescura y rápido crecimiento. Son ideales para huertos caseros y se adaptan bien a diferentes tipos de suelo, siempre que tengan buen drenaje. Requieren riego constante para mantener la humedad del suelo y evitar que las hojas se amarguen. Son susceptibles a plagas como pulgones y caracoles, y su ciclo de crecimiento es relativamente corto, permitiendo múltiples cosechas al año.";
                    cropImg = cropImg || 'lechuga_romana'; // Usar imagen de lechuga romana si no hay otra específica
                    // Actualizar las propiedades técnicas para lechugas genéricas
                    cropInfo = { ...cropInfo, diff: "Fácil", water: "Alto (constante)", pests: "Pulgones, Caracoles, Mildiu" };
                  } else if (cropInfo?.desc && cropInfo.desc !== "Cultivo registrado en invernadero.") {
                    // If cropInfo has a specific short description, use it as the detailed one too for now.
                    detailedDesc = cropInfo.desc;
                  }

                  return {
                    nombre: name,
                    desc: shortDesc,
                    detailedDesc: detailedDesc,
                    img: cropImg,
                    diff: cropInfo?.diff || "Media",
                    water: cropInfo?.water || "Moderado",
                    pests: cropInfo?.pests || "Pulgones, Trips"
                  };
                });

                return (
                  <div className="space-y-10">
                    <div className="flex items-end justify-between">
                      <div>
                        <span className="text-emerald-600 font-black uppercase text-[10px] tracking-[0.5em]">Tus Invernaderos</span>
                        <h3 className="text-4xl font-black text-gray-900 uppercase tracking-tighter italic mt-2">Cultivos Registrados</h3>
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-300 bg-gray-50 px-5 py-2 rounded-full">{plantData.length} cultivo{plantData.length !== 1 ? 's' : ''}</span>
                    </div>

                    <div className="grid gap-10">
                      {plantData.map((planta, idx) => (
                        <motion.div
                          key={planta.nombre}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          onClick={() => setSelectedCrop(planta)}
                          className="bg-white rounded-[3.5rem] overflow-hidden shadow-lg border border-gray-100 flex flex-col lg:flex-row group cursor-pointer hover:shadow-2xl hover:shadow-emerald-500/10 hover:border-emerald-200 transition-all duration-300"
                        >
                          <div className="lg:w-[380px] h-80 lg:h-auto overflow-hidden flex-shrink-0 relative">
                            <img src={`${API_BASE_URL}/api/asset/IMG/${planta.img}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={planta.nombre} />
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10 lg:block hidden"></div>
                            <div className="absolute top-5 left-5">
                              <span className="bg-[#031c06]/80 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-full">🌱 En producción</span>
                            </div>
                          </div>
                          <div className="p-10 lg:p-14 flex flex-col justify-center space-y-6 flex-grow">
                            <div>
                              <h4 className="text-3xl lg:text-4xl font-black text-gray-900 uppercase tracking-tighter group-hover:text-[#207b25] transition-colors">{planta.nombre}</h4>
                              <p className="text-gray-400 font-bold mt-1 uppercase text-[10px] tracking-widest italic">{planta.desc}</p>
                            </div>
                            <p className="text-gray-500 text-base font-medium leading-relaxed">{planta.detailedDesc}</p>
                            
                            {/* Ficha técnica y métricas del cultivo */}
                            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100 text-left">
                              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 group-hover:bg-emerald-100/60 transition-colors">
                                <span className="text-[10px] font-black uppercase text-emerald-600 block mb-1">Dificultad</span>
                                <span className="text-sm font-black text-stone-800">{planta.diff}</span>
                              </div>
                              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 group-hover:bg-blue-100/60 transition-colors">
                                <span className="text-[10px] font-black uppercase text-blue-600 block mb-1">Riego Técnico</span>
                                <span className="text-sm font-black text-stone-800">{planta.water}</span>
                              </div>
                              <div className="p-4 bg-red-50 rounded-2xl border border-red-100 group-hover:bg-red-100/60 transition-colors">
                                <span className="text-[10px] font-black uppercase text-red-600 block mb-1">Amenazas / Plagas</span>
                                <span className="text-xs font-bold text-stone-800 truncate block">{planta.pests}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                              <span className="text-[10px] font-black uppercase text-emerald-500 tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Ver ficha completa →</span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        );
}
