import CropImage from '../CropImage';
import { API_BASE_URL, getPestImage } from '../landingData';

const SeasonCropDetailView = ({ crop, selectedSeason, onBack }) => (
  <div className="px-16 py-12 animate-fadeIn pb-32">
    <button 
      onClick={onBack}
      className="mb-10 flex items-center gap-3 px-8 py-4 bg-white text-[#207b25] rounded-2xl text-[12px] font-black uppercase tracking-widest hover:bg-[#031c06] hover:text-white transition-all shadow-xl active:scale-95 border border-emerald-50"
    >
      ← Volver a Temporadas
    </button>

    <div className="grid lg:grid-cols-2 gap-16 mb-20">
      <div className="rounded-[4rem] overflow-hidden shadow-3xl border-8 border-white relative h-full">
        <CropImage crop={crop} className="w-full h-full object-cover" />
        <div className="absolute bottom-10 left-10 right-10 p-8 bg-white/10 backdrop-blur-xl rounded-[3rem] border border-white/20 text-white">
           <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-80 mb-2">Entorno Recomendado</p>
           <p className="text-xl font-bold italic">Un rincón donde el sol acaricie las hojas y la tierra respire vida natural.</p>
        </div>
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
          <div className="p-8 bg-orange-50 rounded-[3rem] border border-orange-100 flex flex-col justify-between">
            <span className="text-[15px] font-black uppercase text-orange-600 tracking-widest mb-4">Época de Siembra</span>
            <p className="text-xl font-black text-[#031c06] uppercase">{crop.planting || selectedSeason}</p>
          </div>
          <div className="p-8 bg-amber-50 rounded-[3rem] border border-amber-100 flex flex-col justify-between">
            <span className="text-[15px] font-black uppercase text-amber-600 tracking-widest mb-4">Cosecha</span>
            <p className="text-xl font-black text-[#031c06] uppercase">{crop.harvestDiff || "Manual"}</p>
          </div>
        </div>
        
        <div className="p-10 bg-red-50/50 rounded-[3rem] border border-red-100 space-y-6">
          <h4 className="text-xl font-black text-red-800 uppercase tracking-tight flex items-center gap-3">
            <span className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center text-lg">⚠️</span>
            Gestión de Plagas y Amenazas
          </h4>
          <div className="flex flex-wrap gap-4">
            {(crop.pests || "Pulgones, Oídio").split(',').map((pest, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-2 bg-white rounded-full border border-red-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-red-50">
                  <img src={getPestImage(pest)} className="w-full h-full object-cover" alt={pest} />
                </div>
                <span className="text-red-700 text-[10px] font-black uppercase tracking-widest">{pest.trim()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>

    <div className="space-y-16">
      <div className="space-y-10 px-8 lg:px-12">
        <h4 className="text-4xl font-black text-[#031c06] uppercase tracking-tighter flex items-center gap-5">
          <span className="w-16 h-16 bg-emerald-100 rounded-[1.8rem] flex items-center justify-center text-3xl">🌿</span>
          Crecimiento y Estructura
        </h4>
        <div className="space-y-8">
          <div className="space-y-3">
            <p className="text-gray-600 text-lg font-medium leading-relaxed">
              El desarrollo biológico y morfológico del cultivo. Comprende la arquitectura radicular para la absorción de nutrientes y la consolidación del dosel foliar para la captura eficiente de energía lumínica. Esta fase es crucial, ya que una estructura vegetal robusta y bien formada es la base para una producción de alta calidad y un rendimiento óptimo. Se monitorea la elongación del tallo, la expansión de las hojas y el desarrollo de la biomasa aérea y subterránea.
            </p>
          </div>
          <div className="space-y-3">
            <p className="text-[#207b25] font-black uppercase text-[12px] tracking-[0.3em]">¿Cómo se hace?</p>
            <p className="text-gray-600 text-lg font-medium leading-relaxed">
              {crop.growth || "Desarrollo natural monitoreado"}. Se fomenta mediante la gestión de nutrientes según la etapa fenológica, ajustando los ratios de N-P-K para favorecer el crecimiento vegetativo. Además, se realizan podas de formación para optimizar la entrada de luz y la ventilación, reduciendo la competencia entre órganos y previniendo enfermedades.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default SeasonCropDetailView;
