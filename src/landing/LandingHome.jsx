import CropImage from '../CropImage';
import { useLanding } from './LandingContext';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL, slides } from '../landingData';
import { Droplet, Check, Eye, Lightbulb } from 'lucide-react';

const LandingHome = () => {
  const {
    currentSlide,
    isLoggedIn,
    onOpenLoginRegister,
    setCurrentView,
    setCurrentSlide,
    homeStats,
    homeFeatures,
    homeSteps,
    activeShowcaseCrop,
    showcaseCrops,
    setActiveShowcaseCrop,
    relatoForm,
    userId,
    setRelatoForm,
    setFileInputKey,
    loadRelatos,
    fileInputKey,
    relatoIndex,
    relatos
  } = useLanding();

  return (<div className="space-y-0">
      {/* ══════════════════════════════════════════════════════════════
          SECCIÓN 1: HERO SLIDER MEJORADO
          ══════════════════════════════════════════════════════════════ */}
      <main className="relative h-[600px] overflow-hidden shadow-2xl">
        {slides.map((slide, index) => (
          <div key={slide.id} className={`absolute inset-0 transition-all duration-1000 flex items-end bg-cover bg-center ${index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`} style={{ backgroundImage: `linear-gradient(to top, rgba(3,28,6,0.95) 0%, rgba(3,28,6,0.4) 40%, rgba(0,0,0,0.2) 100%), url(${slide.img})` }}>
            <div className="w-full px-16 pb-20">
              <motion.div
                key={`text-${slide.id}-${currentSlide}`}
                initial={{ opacity: 0, y: 30 }}
                animate={index === currentSlide ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="max-w-3xl"
              >
                <span className="text-[#71cc49] font-black uppercase text-[11px] tracking-[0.5em] block mb-4">AgroIndustrial — Plataforma Inteligente</span>
                <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-white leading-[0.9]">{slide.title}</h1>
                <p className="text-xl md:text-2xl opacity-80 font-bold uppercase tracking-widest text-white mt-4">{slide.text}</p>
                <div className="flex gap-4 mt-8">
                  {!isLoggedIn && (
                    <button onClick={() => onOpenLoginRegister('register')} className="px-10 py-4 bg-emerald-500 text-[#031c06] rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-white hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-emerald-900/40">
                      Comenzar Gratis
                    </button>
                  )}
                  <button onClick={() => setCurrentView('temporada')} className="px-10 py-4 bg-white/10 backdrop-blur-sm text-white rounded-2xl font-black uppercase text-[11px] tracking-widest border border-white/20 hover:bg-white/20 transition-all">
                    Explorar Cultivos
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        ))}
        {/* Slide indicators */}
        <div className="absolute bottom-6 right-16 flex gap-3 z-10">
          {slides.map((_, i) => (
            <button key={i} onClick={() => setCurrentSlide(i)} className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer ${i === currentSlide ? 'w-12 bg-emerald-400' : 'w-6 bg-white/30 hover:bg-white/50'}`} />
          ))}
        </div>
      </main>

      {/* ══════════════════════════════════════════════════════════════
          SECCIÓN 2: BARRA DE ESTADÍSTICAS ANIMADAS
          ══════════════════════════════════════════════════════════════ */}
      <section className="bg-[#031c06] py-10 px-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 relative z-10 max-w-6xl mx-auto">
          {homeStats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="text-center group"
            >
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-5xl md:text-6xl font-black text-white group-hover:text-emerald-400 transition-colors">{stat.value}</span>
                <span className="text-2xl font-black text-emerald-400">{stat.suffix}</span>
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 mt-2">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECCIÓN 3: "¿POR QUÉ ELEGIRNOS?" — FEATURES GRID
          ══════════════════════════════════════════════════════════════ */}
      <section className="py-28 px-16 bg-gray-50">
        <div className="text-center mb-20 max-w-3xl mx-auto">
          <span className="text-emerald-600 font-black uppercase text-[10px] tracking-[0.5em]">Tecnología al Servicio del Campo</span>
          <h2 className="text-5xl md:text-6xl font-black text-gray-900 tracking-tighter uppercase italic mt-4">¿Por Qué Elegirnos?</h2>
          <p className="text-gray-400 text-lg font-medium leading-relaxed mt-6">Cada funcionalidad ha sido diseñada por ingenieros agrónomos y desarrolladores para resolver los desafíos reales de la producción moderna bajo invernadero.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {homeFeatures.map((feat, i) => {
            const colorMap = {
              blue: { bg: 'bg-blue-50', border: 'border-blue-100', icon: 'text-blue-500', hoverBg: 'hover:border-blue-300' },
              amber: { bg: 'bg-amber-50', border: 'border-amber-100', icon: 'text-amber-500', hoverBg: 'hover:border-amber-300' },
              red: { bg: 'bg-red-50', border: 'border-red-100', icon: 'text-red-500', hoverBg: 'hover:border-red-300' },
              emerald: { bg: 'bg-emerald-50', border: 'border-emerald-100', icon: 'text-emerald-600', hoverBg: 'hover:border-emerald-300' },
              purple: { bg: 'bg-purple-50', border: 'border-purple-100', icon: 'text-purple-500', hoverBg: 'hover:border-purple-300' },
              teal: { bg: 'bg-teal-50', border: 'border-teal-100', icon: 'text-teal-500', hoverBg: 'hover:border-teal-300' },
            };
            const c = colorMap[feat.color];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`p-10 rounded-[3rem] border ${c.border} ${c.hoverBg} bg-white transition-all group hover:shadow-xl cursor-default`}
              >
                <div className={`w-16 h-16 ${c.bg} rounded-2xl flex items-center justify-center ${c.icon} mb-6 group-hover:scale-110 transition-transform`}>
                  {feat.icon}
                </div>
                <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight mb-3">{feat.title}</h3>
                <p className="text-gray-500 font-medium leading-relaxed text-[15px]">{feat.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECCIÓN 4: "LEGADO DE LA TIERRA" — MISIÓN Y VISIÓN
          ══════════════════════════════════════════════════════════════ */}
      <section className="bg-white py-28 px-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <span className="text-emerald-600 font-black uppercase text-[10px] tracking-[0.5em]">Nuestra Estación</span>
            <h2 className="text-5xl md:text-6xl font-black text-gray-900 tracking-tighter uppercase italic leading-[0.95]">Legado de <br/>la Tierra</h2>
            <p className="text-gray-500 text-lg font-medium leading-relaxed">Conectamos la tecnología de precisión con el conocimiento ancestral para ofrecerte un ecosistema de producción inteligente y sostenible. Nacimos de la convicción de que la agricultura del futuro no se trata solo de rendimiento, sino de armonía con el entorno.</p>
            <div className="space-y-5 pt-4">
              <div className="flex items-start gap-5 group">
                <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                  <Lightbulb className="w-5 h-5 text-emerald-600 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <h4 className="font-black text-gray-900 uppercase text-sm tracking-wide">Innovación Agrícola</h4>
                  <p className="text-gray-400 text-sm font-medium mt-1">Integramos IoT, inteligencia artificial y datos satelitales para una toma de decisiones sin precedentes en el sector agrícola.</p>
                </div>
              </div>
              <div className="flex items-start gap-5 group">
                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500 group-hover:text-white transition-all">
                  <Droplet className="w-5 h-5 text-blue-600 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <h4 className="font-black text-gray-900 uppercase text-sm tracking-wide">Sostenibilidad Hídrica</h4>
                  <p className="text-gray-400 text-sm font-medium mt-1">Cada litro de agua cuenta. Nuestro sistema reduce el desperdicio hídrico hasta en un 40% frente a métodos tradicionales de riego.</p>
                </div>
              </div>
              <div className="flex items-start gap-5 group">
                <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-amber-500 group-hover:text-white transition-all">
                  <Eye className="w-5 h-5 text-amber-600 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <h4 className="font-black text-gray-900 uppercase text-sm tracking-wide">Transparencia Total</h4>
                  <p className="text-gray-400 text-sm font-medium mt-1">Datos abiertos y trazabilidad completa desde la semilla hasta tu mesa. Sabes exactamente qué, cómo y cuándo se cultiva.</p>
                </div>
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <img src={`${API_BASE_URL}/api/asset/IMG/cultivo1`} className="rounded-[4rem] h-[550px] w-full object-cover shadow-2xl border-8 border-gray-50" alt="Legado de la Tierra" />
            <div className="absolute -bottom-8 -left-8 bg-[#031c06] text-white p-8 rounded-[2.5rem] shadow-2xl max-w-[280px]">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400 mb-2">Desde 2024</p>
              <p className="text-lg font-black uppercase tracking-tight leading-tight">Transformando la agricultura con datos y pasión</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECCIÓN 5: "CÓMO FUNCIONA" — PASOS
          ══════════════════════════════════════════════════════════════ */}
      <section className="bg-[#f7faf5] py-28 px-16 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-emerald-100/40 rounded-full blur-[150px] -ml-48 -mt-48 pointer-events-none"></div>
        <div className="text-center mb-20 max-w-3xl mx-auto relative z-10">
          <span className="text-emerald-600 font-black uppercase text-[10px] tracking-[0.5em]">Tu Camino al Éxito</span>
          <h2 className="text-5xl md:text-6xl font-black text-gray-900 tracking-tighter uppercase italic mt-4">¿Cómo Funciona?</h2>
          <p className="text-gray-400 text-lg font-medium leading-relaxed mt-6">En cuatro pasos simples estarás gestionando tu producción como un profesional. Sin complicaciones, sin curvas de aprendizaje imposibles.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto relative z-10">
          {homeSteps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="relative group"
            >
              <div className="bg-white p-10 rounded-[3rem] border border-gray-100 hover:border-emerald-200 transition-all hover:shadow-xl h-full flex flex-col">
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-5xl">{step.icon}</span>
                  <span className="text-6xl font-black text-emerald-100 group-hover:text-emerald-200 transition-colors leading-none">{step.num}</span>
                </div>
                <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight mb-3">{step.title}</h3>
                <p className="text-gray-500 font-medium leading-relaxed text-[14px] flex-grow">{step.desc}</p>
              </div>
              {i < homeSteps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 w-8 text-emerald-200 z-20 -translate-y-1/2">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECCIÓN 6: CULTIVOS ESTRELLA — SHOWCASE INTERACTIVO
          ══════════════════════════════════════════════════════════════ */}
      <section className="bg-white py-28 px-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-emerald-600 font-black uppercase text-[10px] tracking-[0.5em]">Catálogo Agrícola</span>
            <h2 className="text-5xl md:text-6xl font-black text-gray-900 tracking-tighter uppercase italic mt-4">Cultivos Estrella</h2>
            <p className="text-gray-400 text-lg font-medium leading-relaxed mt-4 max-w-2xl mx-auto">Descubre los cultivos más populares de nuestra plataforma. Cada ficha incluye guías de siembra, riego y protección fitosanitaria.</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-stretch">
            {/* Showcase Image */}
            <motion.div
              key={activeShowcaseCrop}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="relative rounded-[4rem] overflow-hidden h-[500px] shadow-2xl border-4 border-gray-100 group"
            >
              <CropImage crop={showcaseCrops[activeShowcaseCrop]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#031c06]/90 via-transparent to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-10">
                <span className="bg-emerald-500/80 backdrop-blur-md text-[#031c06] font-black uppercase text-[10px] tracking-widest px-4 py-2 rounded-full">{showcaseCrops[activeShowcaseCrop].season}</span>
                <h3 className="text-4xl font-black text-white uppercase tracking-tighter mt-4">{showcaseCrops[activeShowcaseCrop].emoji} {showcaseCrops[activeShowcaseCrop].name}</h3>
                <p className="text-white/70 font-medium text-base mt-3 leading-relaxed max-w-md">{showcaseCrops[activeShowcaseCrop].desc}</p>
              </div>
            </motion.div>

            {/* Showcase Selector Cards */}
            <div className="grid grid-cols-2 gap-5">
              {showcaseCrops.map((crop, i) => (
                <button
                  key={i}
                  onClick={() => setActiveShowcaseCrop(i)}
                  className={`relative rounded-[2.5rem] overflow-hidden h-[235px] transition-all duration-300 cursor-pointer group border-4 ${
                    i === activeShowcaseCrop
                      ? 'border-emerald-500 shadow-xl shadow-emerald-500/20 scale-[1.02]'
                      : 'border-transparent hover:border-gray-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <CropImage crop={crop} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <span className="text-3xl">{crop.emoji}</span>
                    <p className="text-white font-black uppercase text-sm tracking-tight mt-1">{crop.name}</p>
                  </div>
                  {i === activeShowcaseCrop && (
                    <div className="absolute top-4 right-4 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="text-center mt-12">
            <button onClick={() => setCurrentView('temporada')} className="px-12 py-5 bg-[#031c06] text-white rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-[#207b25] transition-all shadow-lg active:scale-95">
              Ver Todos los Cultivos por Temporada →
            </button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECCIÓN 7: ECOS DEL HUERTO — COMUNIDAD
          ══════════════════════════════════════════════════════════════ */}
      <section className="bg-[#031c06] pt-20 pb-16 px-16 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-400/5 rounded-full blur-[100px] -ml-32 -mb-32"></div>
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 relative z-10">
            <span className="text-[#71cc49] font-black uppercase text-[11px] tracking-[0.5em] block">Comunidad Aflopha</span>
            <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tighter italic leading-none mt-4">Ecos del <span className="text-emerald-400">Huerto</span></h2>
            <p className="text-white/40 font-medium text-base mt-4 max-w-xl mx-auto">Un espacio donde los cultivadores comparten sus historias, descubrimientos y la magia de ver crecer algo con sus propias manos.</p>
          </div>

          <div className="flex flex-col lg:flex-row-reverse gap-16 items-start relative z-10">
            <div className="lg:w-1/2 space-y-8">
              {isLoggedIn ? (
                <form 
                  className="space-y-5 bg-white/5 p-10 rounded-[3.5rem] border border-white/10 backdrop-blur-md shadow-2xl" 
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const res = await fetch(`${API_BASE_URL}/relatos`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ ...relatoForm, id_usuario: parseInt(userId) })
                    });
                    if (res.ok) {
                      setRelatoForm({ nombre: '', mensaje: '', foto: '' });
                      setFileInputKey(Date.now());
                      loadRelatos();
                    }
                  }}
                >
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-emerald-400/60 ml-4 tracking-widest">Nombre Completo</label>
                    <input type="text" required value={relatoForm.nombre} onChange={(e) => setRelatoForm({...relatoForm, nombre: e.target.value})} placeholder="Ej. Juan Pérez" className="w-full p-5 bg-white/5 hover:bg-white/10 focus:bg-white/10 rounded-[1.8rem] border border-white/5 focus:border-emerald-500/50 outline-none text-white placeholder-white/20 font-bold transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-emerald-400/60 ml-4 tracking-widest">Tu Historia Botánica</label>
                    <textarea required value={relatoForm.mensaje} onChange={(e) => setRelatoForm({...relatoForm, mensaje: e.target.value})} placeholder="Cuéntanos tu experiencia con la tierra..." className="w-full p-5 bg-white/5 hover:bg-white/10 focus:bg-white/10 rounded-[1.8rem] border border-white/5 focus:border-emerald-500/50 outline-none text-white placeholder-white/20 font-bold h-32 transition-all resize-none" />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase text-emerald-400/60 ml-4 tracking-widest">Evidencia del Huerto</label>
                    <div className="flex items-center gap-4">
                      <div 
                        onClick={() => document.getElementById('relatoFile').click()}
                        className="flex-grow cursor-pointer p-4 border-2 border-dashed border-white/10 rounded-2xl flex items-center justify-center gap-3 hover:bg-white/5 hover:border-emerald-500/30 transition-all"
                      >
                        <span className="text-xl">📸</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-100/60">
                          {relatoForm.foto ? 'Imagen Seleccionada' : 'Subir Fotografía'}
                        </span>
                      </div>
                      {relatoForm.foto && (
                        <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-emerald-500 shadow-lg">
                          <img src={relatoForm.foto} className="w-full h-full object-cover" alt="Preview" />
                        </div>
                      )}
                      <input id="relatoFile" key={fileInputKey} type="file" accept="image/*" className="hidden" onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => setRelatoForm({...relatoForm, foto: reader.result});
                          reader.readAsDataURL(file);
                        }
                      }} />
                    </div>
                  </div>
                  <button type="submit" className="w-full py-5 bg-emerald-500 text-[#031c06] font-black uppercase tracking-[0.2em] rounded-[1.8rem] hover:bg-white hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-emerald-900/40 mt-4">Compartir Relato</button>
                </form>
              ) : (
                <div className="p-16 bg-white/5 backdrop-blur-md rounded-[4rem] text-center space-y-8 border border-white/10 shadow-3xl">
                  <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-4xl animate-bounce">🔐</div>
                  <div className="space-y-3">
                    <h4 className="text-2xl font-black uppercase tracking-tight">Acceso Privado</h4>
                    <p className="font-bold uppercase text-[10px] tracking-[0.3em] text-emerald-400/60 max-w-[250px] mx-auto leading-relaxed">Debes ser parte de nuestra red para compartir tu huella en la tierra.</p>
                  </div>
                  <button 
                    onClick={() => onOpenLoginRegister('login')} 
                    className="px-10 py-5 bg-white text-[#031c06] rounded-[1.8rem] font-black uppercase text-xs tracking-widest hover:bg-emerald-400 transition-all shadow-xl active:scale-95"
                  >
                    Unirse a la Comunidad
                  </button>
                </div>
              )}
            </div>
            <div className="lg:w-1/2 relative bg-white rounded-[5rem] p-5 text-[#031c06] shadow-3xl group">
              <AnimatePresence mode="wait">
                <motion.div key={relatoIndex} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                  <img src={relatos[relatoIndex]?.foto || `${API_BASE_URL}/api/asset/IMG/mision`} className="rounded-[4rem] h-[500px] w-full object-cover shadow-inner" alt="Relato" />
                  <div className="p-8">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="h-px bg-emerald-100 flex-grow"></div>
                      <p className="text-[#207b25] font-black uppercase text-sm tracking-widest whitespace-nowrap">— {relatos[relatoIndex]?.nombre || "Fundación Agro"}</p>
                    </div>
                    <p className="text-2xl font-bold italic text-gray-700 leading-relaxed text-center">
                      "{relatos[relatoIndex]?.mensaje || "La paciencia es la raíz más fuerte que se puede plantar en cualquier jardín."}"
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECCIÓN 8: CTA FINAL — LLAMADA A LA ACCIÓN
          ══════════════════════════════════════════════════════════════ */}
      {!isLoggedIn && (
        <section className="mx-16 my-16 relative overflow-hidden rounded-[4rem]">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${API_BASE_URL}/api/asset/IMG/slide2)` }}></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#031c06] via-[#031c06]/90 to-[#031c06]/60"></div>
          <div className="relative z-10 py-24 px-16 flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="space-y-6 max-w-2xl">
              <h2 className="text-5xl md:text-6xl font-black text-white uppercase tracking-tighter italic leading-[0.95]">Comienza a Cultivar el Futuro <span className="text-emerald-400">Hoy</span></h2>
              <p className="text-white/60 font-medium text-lg leading-relaxed">Únete a la comunidad de agricultores inteligentes. Registra tu primer invernadero, configura tus sensores y empieza a tomar decisiones basadas en datos reales. Es gratis.</p>
            </div>
            <div className="flex flex-col gap-4 flex-shrink-0">
              <button onClick={() => onOpenLoginRegister('register')} className="px-14 py-6 bg-emerald-500 text-[#031c06] rounded-2xl font-black uppercase text-[12px] tracking-widest hover:bg-white hover:scale-[1.03] active:scale-95 transition-all shadow-2xl shadow-emerald-900/40 whitespace-nowrap">
                Crear Cuenta Gratis
              </button>
              <button onClick={() => onOpenLoginRegister('login')} className="px-14 py-4 bg-transparent text-white rounded-2xl font-black uppercase text-[10px] tracking-widest border border-white/20 hover:bg-white/10 transition-all whitespace-nowrap">
                Ya tengo una cuenta
              </button>
            </div>
          </div>
        </section>
      )}
    </div>);
};

export default LandingHome;
