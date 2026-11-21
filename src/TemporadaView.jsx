import React from 'react';
import { slides, seasonCrops, API_BASE_URL } from './landingData';

const TemporadaView = ({ currentSlide, selectedSeason, setSelectedSeason, setSelectedCrop }) => (
  <div className="space-y-16 animate-fadeIn">
    <main className="relative h-[450px] overflow-hidden rounded-[2.5rem] shadow-2xl px-16 mt-6 mx-16">
      {slides.map((slide, index) => (
        <div 
          key={slide.id} 
          className={`absolute inset-0 transition-opacity duration-1000 flex items-center justify-center bg-cover bg-center ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
          style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${slide.img})` }}
        >
          <div className="text-center text-white px-4">
            <h1 className="text-5xl md:text-7xl font-black mb-4 uppercase tracking-tighter">{slide.title}</h1>
            <p className="text-xl md:text-2xl opacity-90 font-bold uppercase tracking-widest">{slide.text}</p>
          </div>
        </div>
      ))}
    </main>

    <section className="px-16 grid md:grid-cols-2 lg:grid-cols-4 gap-8">
      {[
        { name: "Primavera", color: "bg-emerald-50 text-emerald-700", icon: "🌸" },
        { name: "Verano", color: "bg-orange-50 text-orange-700", icon: "☀️" },
        { name: "Otoño", color: "bg-amber-50 text-amber-700", icon: "🍂" },
        { name: "Invierno", color: "bg-blue-50 text-blue-700", icon: "❄️" }
      ].map((season) => (
        <button 
          key={season.name} 
          onClick={() => setSelectedSeason(season.name)}
          className={`${season.color} ${selectedSeason === season.name ? 'ring-4 ring-[#207b25]/20 scale-105 shadow-xl' : 'opacity-70'} border p-8 rounded-[3rem] transition-all text-center`}
        >
          <span className="text-6xl mb-4 block">{season.icon}</span>
          <h3 className="text-xl font-black uppercase tracking-widest">{season.name}</h3>
        </button>
      ))}
    </section>

    <section className="px-16 pb-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
      {seasonCrops[selectedSeason]?.map((crop, idx) => (
        <div key={idx} onClick={() => setSelectedCrop(crop)} className="bg-white rounded-[3rem] overflow-hidden shadow-2xl border border-gray-100 group cursor-pointer hover:shadow-emerald-500/10 transition-shadow">
          <img src={`${API_BASE_URL}/api/asset/IMG/${crop.img}`} className="h-64 w-full object-cover group-hover:scale-110 transition-transform duration-700" alt={crop.nombre} />
          <div className="p-10">
            <h5 className="text-3xl font-black text-[#207b25] uppercase tracking-tight">{crop.nombre}</h5>
            <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-1 italic">{crop.desc}</p>
          </div>
        </div>
      ))}
    </section>
  </div>
);

export default TemporadaView;