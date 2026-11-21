import { projectCrops } from '../landingData';
import { useLanding } from './LandingContext';
import LiveGreenhouseSensors from '../LiveGreenhouseSensors';
import SectorTelemetryModal from './SectorTelemetryModal';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Eye, Sparkles } from 'lucide-react';

const LandingGreenhouse = () => {
  const {
    uniqueGreenhouses,
    selectedLandingInvId,
    lockedStatus,
    userRole,
    setIsSoilModalOpen,
    sectorCount,
    sectorAssignments,
    getIconForPlant,
    activeSector,
    setSelectedLandingInvId,
    setActiveSector,
    handleDeleteSector,
    updateSectorCountAndSave,
    setShowCropPicker,
    showCropPicker,
    updateSectorAssignmentsAndSave,
    setIsTelemetryModalOpen,
    isTelemetryModalOpen
  } = useLanding();

    const selectedInv = uniqueGreenhouses.find(g => g.id_invernadero === selectedLandingInvId);
    const isLocked = selectedLandingInvId && lockedStatus[selectedLandingInvId];

    if (isLocked) {
      return (
        <div className="px-16 py-32 text-center space-y-8 animate-fadeIn">
          <div className="text-9xl grayscale opacity-20">🏗️</div>
          <h3 className="text-5xl font-black text-gray-900 uppercase italic">Acceso Restringido</h3>
          <p className="text-gray-400 font-bold uppercase text-sm tracking-widest max-w-lg mx-auto">El plano técnico requiere el Balance Químico de Suelo para ser visualizado.</p>
          {(userRole === 'admin' || userRole === 'supervisor') && (
            <button onClick={() => setIsSoilModalOpen(true)} className="px-12 py-5 bg-[#031c06] text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-emerald-700 transition-all cursor-pointer">Registrar Análisis</button>
          )}
        </div>
      );
    }

    const currentSectors = Array.from({ length: sectorCount }, (_, i) => {
      const id = i + 1;
      const assignedPlant = sectorAssignments[id];
      const cropName = assignedPlant || (selectedLandingInvId ? 'Rotación de Cultivo' : projectCrops[i % projectCrops.length].nombre);
      
      return {
        id,
        crop: cropName,
        icon: getIconForPlant(cropName, '🌱'),
        description: selectedLandingInvId 
          ? `Módulo de producción dedicado a ${assignedPlant || 'la rotación de cultivos'} dentro de ${selectedInv?.nombre || 'este sector'}.` 
          : (id === 1 ? "Ubicado en el área de máxima exposición lumínica." : id === 2 ? "Zona protegida con mallas de sombreado." : "Camas de cultivo profundas con sustrato de drenaje rápido."),
        position: id % 2 === 0 ? "Sur - Protección Térmica" : "Norte - Exposición Solar Total"
      };
    });

    const activeSectorData = currentSectors.find(s => s.id === activeSector) || currentSectors[0];
    const cropOptions = projectCrops.map(crop => crop.nombre);

    return (
      <div className="px-16 py-20 space-y-20 animate-fadeIn">
        <div className="text-center space-y-4">
          <h2 className="text-7xl font-black text-gray-900 tracking-tighter uppercase italic">Control Maestro</h2>
          <p className="text-emerald-600 font-black uppercase text-[10px] tracking-[0.4em]">Gestión de Sectores de Producción</p>
        </div>

        <div className="flex flex-wrap gap-4 p-3 bg-white rounded-[2rem] border border-gray-100 w-fit mx-auto shadow-sm">
          {uniqueGreenhouses.map((inv) => (
            <button key={inv.id_invernadero} onClick={() => setSelectedLandingInvId(inv.id_invernadero)} className={`px-10 py-4 rounded-2xl text-[12px] font-black uppercase tracking-widest transition-all flex items-center gap-2 cursor-pointer ${selectedLandingInvId === inv.id_invernadero ? 'bg-[#207b25] text-white shadow-lg' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}>
              🌿 {inv.nombre}
              {lockedStatus[inv.id_invernadero] && <span className="text-amber-500">🔒</span>}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-10 items-stretch">
          {/* Blueprint - Contenedor de Sectores */}
          <div className="bg-[#031c06] rounded-[4rem] p-10 border-4 border-emerald-900/30 shadow-2xl relative flex flex-col overflow-hidden">
            {/* Cuadrícula técnica decorativa */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#71cc49 1.5px, transparent 1.5px)', backgroundSize: '40px 40px' }}></div>
            
            <div className="relative z-10 border-b border-white/10 pb-4 mb-6 flex justify-between items-center">
              <div>
                <span className="text-[9px] font-black text-[#71cc49] uppercase tracking-widest">Plano Técnico</span>
                <h4 className="text-white font-black text-lg uppercase tracking-tight">Esquema del Invernadero</h4>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-white/5 border border-white/10 px-3 py-1 rounded-full">DIM: 24m x 12m</span>
            </div>

            {/* Listado de Sectores en Rejilla de Plano */}
            <div className="relative z-10 grid grid-cols-2 gap-4 overflow-y-auto pr-2 custom-scrollbar flex-grow mb-6">
              {currentSectors.map((s) => {
                const isSelected = activeSector === s.id;
                
                return (
                  <div key={s.id} className="relative group">
                    <button 
                      onClick={() => setActiveSector(s.id)} 
                      className={`w-full relative rounded-[2.5rem] p-5 transition-all duration-300 flex flex-col items-center justify-between gap-3 border-2 min-h-[180px] cursor-pointer text-left ${
                        isSelected 
                          ? 'bg-emerald-950/60 border-emerald-500 shadow-[0_0_35px_rgba(113,204,73,0.3)]' 
                          : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-emerald-500/40'
                      }`}
                    >
                      {/* Technical sector label */}
                      <div className="w-full flex justify-between items-center border-b border-white/5 pb-2">
                        <span className="text-white font-black uppercase text-[9px] tracking-wider">SECTOR {s.id.toString().padStart(2, '0')}</span>
                      </div>

                      {/* Floating Crop Icon */}
                      <span className="text-5xl my-2 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">{s.icon}</span>
                      
                      <div className="text-center w-full">
                        <span className="text-[#71cc49] font-black uppercase text-[9px] tracking-wider truncate block max-w-full">{s.crop}</span>
                      </div>
                      
                      {isSelected && (
                        <motion.div layoutId="activeBlueprintIndicator" className="absolute -inset-1.5 border border-emerald-400 rounded-[3.2rem] pointer-events-none" />
                      )}
                    </button>
                    
                    {/* Delete Sector button */}
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDeleteSector(s.id); }} 
                      className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:bg-red-700 z-20 cursor-pointer font-bold text-xs"
                      title="Eliminar Sector"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}

              {/* Add New Sector button */}
              <button 
                disabled={sectorCount >= 4}
                onClick={() => updateSectorCountAndSave(sectorCount + 1)} 
                className="border-2 border-dashed border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 hover:border-emerald-500/50 hover:shadow-[0_0_20px_rgba(113,204,73,0.1)] transition-all duration-300 rounded-[2.5rem] p-5 flex flex-col items-center justify-center gap-3 min-h-[180px] cursor-pointer text-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Plus className="w-8 h-8 animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-widest">{sectorCount >= 4 ? 'Máximo 4 sectores' : 'Nuevo Sector'}</span>
              </button>
            </div>
            
            {/* Designar Cultivo Console */}
            <div className="relative z-10 border-t border-white/10 pt-6 mt-auto">
               <button 
                 onClick={() => setShowCropPicker(!showCropPicker)} 
                 className={`w-full py-5 rounded-[2.5rem] font-black uppercase text-xs shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                   showCropPicker 
                     ? 'bg-red-500 text-white hover:bg-red-600' 
                     : 'bg-emerald-500 text-[#031c06] hover:bg-white hover:shadow-emerald-400/20'
                 }`}
               >
                 <Sparkles className="w-4 h-4" /> Designar Cultivo
               </button>
               
               <AnimatePresence>
                 {showCropPicker && (
                   <motion.div 
                     initial={{ y: 20, opacity: 0 }} 
                     animate={{ y: 0, opacity: 1 }} 
                     exit={{ y: 20, opacity: 0 }} 
                     className="absolute bottom-full left-0 right-0 mb-4 bg-[#031c06] border-2 border-emerald-500/50 rounded-3xl p-6 shadow-2xl z-30 max-h-[300px] overflow-y-auto custom-scrollbar"
                   >
                      <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 border-b border-white/10 pb-2">Seleccione cultivo para Sector {activeSector}</h5>
                      <div className="grid grid-cols-2 gap-3">
                        {cropOptions.map(c => (
                          <button 
                            key={c} 
                            onClick={() => { 
                              const newAssignments = { ...sectorAssignments, [activeSector]: c };
                              updateSectorAssignmentsAndSave(newAssignments);
                              setShowCropPicker(false);
                            }} 
                            className="p-3 bg-white/5 hover:bg-emerald-500 hover:text-[#031c06] border border-white/10 hover:border-transparent rounded-2xl text-[10px] font-black uppercase text-white transition-all text-left flex items-center gap-2 cursor-pointer"
                          >
                            <span className="text-lg">{getIconForPlant(c)}</span>
                            <span className="truncate">{c}</span>
                          </button>
                        ))}
                      </div>
                   </motion.div>
                 )}
               </AnimatePresence>
            </div>
          </div>

          {/* Sector Details (Métricas y Control de Actuadores) */}
          <div className="space-y-8 flex flex-col">
            <motion.div 
              key={activeSector} 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              className="bg-white p-10 md:p-14 rounded-[4rem] shadow-2xl border border-gray-100 space-y-10"
            >
              {/* Encabezado del Sector */}
              <div className="flex items-center gap-8 border-b border-gray-50 pb-8">
                <span className="text-8xl p-4 bg-gray-50 rounded-[2.5rem] shadow-inner">{activeSectorData?.icon}</span>
                <div className="space-y-2">
                  <h4 className="text-6xl font-black text-gray-900 uppercase italic tracking-tighter leading-none">Sector {activeSector}</h4>
                  <p className="text-emerald-600 font-black uppercase text-xs tracking-[0.4em]">Detalle y Telemetría del Cultivo</p>
                </div>
              </div>

              <div className="space-y-4">
                <LiveGreenhouseSensors key={selectedLandingInvId ?? 'none'} greenhouseId={selectedLandingInvId} compact />
              </div>

              {/* Diagnósticos y Análisis */}
              <div className="space-y-6">
                <div className="flex justify-between items-center pt-8 border-t border-gray-50">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ubicación / Estado</p>
                    <p className="text-emerald-500 font-black text-lg uppercase tracking-tighter">{activeSectorData?.position}</p>
                  </div>
                  <button 
                    onClick={() => setIsTelemetryModalOpen(true)}
                    className="px-10 py-5 bg-[#031c06] text-white rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-[#207b25] hover:shadow-lg transition-all cursor-pointer flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" /> Ver Historial Técnico
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Cita Control Maestro */}
        <div className="bg-emerald-50 p-10 rounded-[4rem] border border-emerald-100 text-emerald-800 font-bold italic text-lg shadow-inner flex gap-8 items-center justify-center max-w-4xl mx-auto">
          <span className="text-5xl">💡</span>
          <p>Organiza hasta cuatro sectores y consulta las lecturas reales de los sensores conectados al invernadero.</p>
        </div>

        {/* Modal de Gráficos de Telemetría */}
        <SectorTelemetryModal 
          isOpen={isTelemetryModalOpen} 
          onClose={() => setIsTelemetryModalOpen(false)} 
          greenhouseId={selectedLandingInvId}
          sectorId={activeSector} 
          cropName={activeSectorData?.crop} 
        />
      </div>
    );
  };

export default LandingGreenhouse;
