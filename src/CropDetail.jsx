import React from 'react';
import { API_BASE_URL, getPestImage } from './landingData';

export const SeasonCropDetailView = ({ crop, selectedSeason, onBack }) => (
  <div className="px-16 py-12 animate-fadeIn pb-32">
    <button 
      onClick={onBack}
      className="mb-10 flex items-center gap-3 px-8 py-4 bg-white text-[#207b25] rounded-2xl text-[12px] font-black uppercase tracking-widest hover:bg-[#031c06] hover:text-white transition-all shadow-xl active:scale-95 border border-emerald-50"
    >
      ← Volver a Temporadas
    </button>

    <div className="grid lg:grid-cols-2 gap-16 mb-20">
      <div className="rounded-[4rem] overflow-hidden shadow-3xl border-8 border-white relative h-full">
        <img src={`${API_BASE_URL}/api/asset/IMG/${crop.img}`} className="w-full h-full object-cover" alt={crop.nombre} />
      </div>
      <div className="space-y-12">
        <div className="space-y-4">
          <h2 className="text-6xl font-black text-[#031c06] tracking-tighter uppercase italic leading-none">{crop.nombre}</h2>
          <p className="text-lg font-bold text-gray-400 uppercase tracking-widest italic">{crop.desc}</p>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="p-8 bg-emerald-50 rounded-[3rem] border border-emerald-100 flex flex-col justify-between">
            <span className="text-[15px] font-black uppercase text-emerald-600 tracking-widest mb-4">Dificultad</span>
            <p className="text-2xl font-black text-[#031c06] uppercase">{crop.diff || "Media"}</p>
          </div>
          <div className="p-8 bg-blue-50 rounded-[3rem] border border-blue-100 flex flex-col justify-between">
            <span className="text-[15px] font-black uppercase text-blue-600 tracking-widest mb-4">Consumo Hídrico</span>
            <p className="text-2xl font-black text-[#031c06] uppercase">{crop.water || "Moderado"}</p>
          </div>
        </div>
        <div className="p-10 bg-red-50/50 rounded-[3rem] border border-red-100 space-y-6">
          <h4 className="text-xl font-black text-red-800 uppercase tracking-tight">Gestión de Plagas</h4>
          <div className="flex flex-wrap gap-4">
            {(crop.pests || "").split(',').map((pest, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-2 bg-white rounded-full border border-red-100 shadow-sm">
                <div className="w-8 h-8 rounded-full overflow-hidden">
                  <img src={getPestImage(pest)} className="w-full h-full object-cover" alt={pest} />
                </div>
                <span className="text-red-700 text-[10px] font-black uppercase tracking-widest">{pest.trim()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const CropDetailView = ({ crop, onBack }) => {
  const lifeCycleData = [
    { phase: "1. Germinación", icon: "🌱", desc: "El despertar de la vida. Las primeras raíces buscan estabilidad." },
    { phase: "2. Crecimiento", icon: "🌿", desc: "Desarrollo de la estructura principal. La planta expande su follaje." },
    { phase: "3. Floración", icon: "🌸", desc: "Momento crítico. Las flores determinan la cantidad de frutos." },
    { phase: "4. Sanidad", icon: "🛡️", desc: "Protección total contra amenazas biológicas." },
    { phase: "5. Cosecha", icon: "🧺", desc: "La culminación del esfuerzo. El fruto alcanza su máximo sabor." }
  ];

  return (
    <div className="px-6 pt-4 animate-fadeIn pb-32">
      <button onClick={onBack} className="mb-12 flex items-center gap-3 px-8 py-4 bg-emerald-50 text-emerald-700 rounded-2xl text-[14px] font-black uppercase tracking-widest shadow-sm">
        ← Volver al Catálogo
      </button>
      <div className="grid lg:grid-cols-2 gap-16 mb-24">
        <div className="rounded-[4rem] overflow-hidden shadow-3xl h-full border-8 border-white">
          <img src={`${API_BASE_URL}/api/asset/IMG/${crop.img}`} className="w-full h-full object-cover" alt={crop.nombre} />
        </div>
        <div className="space-y-10">
          <h2 className="text-6xl font-black text-[#207b25] tracking-tighter uppercase italic">{crop.nombre}</h2>
          <p className="text-lg font-bold text-gray-400 uppercase tracking-widest italic">{crop.desc}</p>
        </div>
      </div>
      <div className="space-y-12">
        {lifeCycleData.map((stage, i) => (
          <div key={i} className="bg-white p-10 rounded-[4rem] border border-gray-100 shadow-2xl flex gap-12 items-center">
            <span className="text-8xl">{stage.icon}</span>
            <div>
              <h4 className="text-4xl font-black text-[#207b25] uppercase tracking-tighter">{stage.phase}</h4>
              <p className="text-xl font-bold text-gray-400 italic mt-2">{stage.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};