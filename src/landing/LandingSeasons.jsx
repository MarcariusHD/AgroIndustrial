import CropImage from '../CropImage';
import SeasonCropDetailView from './SeasonCropDetailView';

import { motion } from 'framer-motion';
import { API_BASE_URL, slides, seasonCrops } from '../landingData';
import { useLanding } from './LandingContext';

export default function LandingSeasons() {
  const {
    selectedCrop,
    selectedSeason,
    setSelectedCrop,
    currentSlide,
    setSelectedSeason
  } = useLanding();
return selectedCrop ? (
          <SeasonCropDetailView crop={selectedCrop} selectedSeason={selectedSeason} onBack={() => setSelectedCrop(null)} />
        ) : (
          <div className="space-y-0 animate-fadeIn">
            {/* Hero de Temporada */}
            <div className="relative h-[400px] overflow-hidden">
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${slides[currentSlide]?.img})` }}></div>
              <div className="absolute inset-0 bg-gradient-to-b from-[#031c06]/80 via-[#031c06]/60 to-gray-100"></div>
              <div className="relative z-10 h-full flex flex-col justify-center px-16 max-w-4xl">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                  <span className="text-[#71cc49] font-black uppercase text-[11px] tracking-[0.5em] block mb-4">Calendario Agrícola</span>
                  <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-white leading-[0.9]">Cultivos por Temporada</h1>
                  <p className="text-white/50 font-medium text-lg mt-4 max-w-xl">Descubre qué cultivar en cada estación. Selecciona una temporada para explorar las variedades más productivas y sus fichas técnicas completas.</p>
                </motion.div>
              </div>
            </div>

            {/* Selector de Temporadas */}
            <section className="px-16 -mt-12 relative z-20">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
                {[
                  { name: "Primavera", icon: "🌸", color: "emerald", gradient: "from-emerald-400 to-green-500", desc: "Temporada de renacimiento y siembra abundante", count: seasonCrops["Primavera"]?.length || 0 },
                  { name: "Verano", icon: "☀️", color: "orange", gradient: "from-orange-400 to-amber-500", desc: "Calor intenso, cosechas generosas", count: seasonCrops["Verano"]?.length || 0 },
                  { name: "Otoño", icon: "🍂", color: "amber", gradient: "from-amber-500 to-orange-600", desc: "Colores cálidos y frutos de maduración", count: seasonCrops["Otoño"]?.length || 0 },
                  { name: "Invierno", icon: "❄️", color: "blue", gradient: "from-blue-400 to-indigo-500", desc: "Resistencia y cultivos de hoja verde", count: seasonCrops["Invierno"]?.length || 0 }
                ].map((season, i) => (
                  <motion.button
                    key={season.name}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    onClick={() => setSelectedSeason(season.name)}
                    className={`relative overflow-hidden rounded-[2.5rem] p-8 text-left transition-all duration-300 group cursor-pointer border-2 ${
                      selectedSeason === season.name
                        ? 'bg-white border-gray-200 shadow-2xl scale-[1.03]'
                        : 'bg-white/80 backdrop-blur-sm border-transparent hover:bg-white hover:shadow-xl hover:scale-[1.01]'
                    }`}
                  >
                    {selectedSeason === season.name && (
                      <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${season.gradient}`}></div>
                    )}
                    <div className="flex items-start justify-between mb-4">
                      <span className="text-5xl group-hover:scale-110 transition-transform duration-300 inline-block">{season.icon}</span>
                      <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${
                        selectedSeason === season.name
                          ? `bg-gradient-to-r ${season.gradient} text-white`
                          : 'bg-gray-100 text-gray-400'
                      }`}>{season.count} cultivos</span>
                    </div>
                    <h3 className={`text-xl font-black uppercase tracking-tight mb-1 ${selectedSeason === season.name ? 'text-gray-900' : 'text-gray-600'}`}>{season.name}</h3>
                    <p className="text-[12px] font-medium text-gray-400 leading-relaxed">{season.desc}</p>
                  </motion.button>
                ))}
              </div>
            </section>

            {/* Título de sección */}
            <div className="text-center pt-16 pb-8 px-16">
              <motion.div key={selectedSeason} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <h2 className="text-4xl font-black text-gray-900 tracking-tighter uppercase italic">Cultivos de {selectedSeason}</h2>
                <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.3em] mt-2">{seasonCrops[selectedSeason]?.length || 0} variedades disponibles — Haz clic para ver la ficha completa</p>
              </motion.div>
            </div>

            {/* Grid de Cultivos */}
            <section className="px-16 pb-24">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                {seasonCrops[selectedSeason]?.map((crop, idx) => (
                  <motion.div
                    key={`${selectedSeason}-${idx}`}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.06, duration: 0.4 }}
                    onClick={() => setSelectedCrop(crop)}
                    className="bg-white rounded-[2.5rem] overflow-hidden shadow-lg border border-gray-100 group cursor-pointer hover:shadow-2xl hover:shadow-emerald-500/10 hover:border-emerald-200 transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="relative h-56 overflow-hidden">
                      <CropImage crop={crop} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      {/* Hover overlay info */}
                      <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <div className="flex gap-2">
                          <span className="bg-white/90 backdrop-blur-sm text-gray-800 text-[9px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full">{crop.diff || "Media"}</span>
                          <span className="bg-emerald-500/90 backdrop-blur-sm text-white text-[9px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full">💧 {crop.water || "Moderado"}</span>
                        </div>
                      </div>
                      {/* Season badge */}
                      <div className="absolute top-4 right-4">
                        <span className="bg-white/90 backdrop-blur-sm text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full text-gray-600">{crop.planting || selectedSeason}</span>
                      </div>
                    </div>
                    <div className="p-8 space-y-3">
                      <h5 className="text-xl font-black text-gray-900 uppercase tracking-tight group-hover:text-[#207b25] transition-colors">{crop.nombre}</h5>
                      <p className="text-gray-400 font-medium text-sm leading-relaxed line-clamp-2">{crop.desc}</p>
                      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                        <div className="flex gap-1.5">
                          {(crop.pests || "").split(',').slice(0, 2).map((pest, pi) => (
                            <span key={pi} className="bg-red-50 text-red-500 text-[8px] font-black uppercase tracking-wider px-2 py-1 rounded-lg">{pest.trim()}</span>
                          ))}
                        </div>
                        <span className="text-[10px] font-black uppercase text-emerald-500 tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Ver ficha →</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          </div>
        );
}
