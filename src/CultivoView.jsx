import React from 'react';
import { API_BASE_URL } from './landingData';

const CultivoView = ({ setSelectedCrop, setShowGeneralSteps }) => (
  <div className="px-16 py-16 space-y-24 animate-fadeIn pb-24">
    <div className="text-center space-y-4">
      <h2 className="text-6xl font-black text-gray-900 tracking-tighter uppercase italic">Guía de Cultivo Profesional</h2>
      <p className="text-emerald-600 font-black uppercase text-[10px] tracking-[0.4em]">Tips y primeros pasos</p>
    </div>

    <section 
      onClick={() => setShowGeneralSteps(true)} 
      className="bg-white p-12 rounded-[4rem] border border-gray-100 shadow-2xl relative overflow-hidden cursor-pointer group hover:border-emerald-500 transition-all"
    >
      <h3 className="text-3xl font-black text-gray-800 uppercase tracking-tight mb-8">Primeros Pasos</h3>
      <div className="grid md:grid-cols-3 gap-12">
        {[
          { title: "Preparación del Suelo", text: "Asegúrate de que la tierra sea rica en nutrientes.", icon: "🌱" },
          { title: "Selección de Semillas", text: "Usa semillas certificadas.", icon: "✨" },
          { title: "Ubicación y Luz", text: "Mínimo 6 horas de sol directo.", icon: "☀️" }
        ].map((step, i) => (
          <div key={i} className="space-y-4">
            <div className="text-4xl">{step.icon}</div>
            <p className="font-black text-gray-900 uppercase text-xs tracking-widest">{step.title}</p>
            <p className="text-sm font-medium text-gray-500 leading-relaxed">{step.text}</p>
          </div>
        ))}
      </div>
    </section>

    <div className="grid gap-16">
      {[
        { nombre: "Tomate Cherry", desc: "Pequeños y dulces.", img: "Tomate_Cherry", steps: ["Sembrar", "Trasplantar", "Entutorar"] },
        { nombre: "Lechuga Romana", desc: "Crecimiento rápido.", img: "lechuga_romana", steps: ["Espaciar", "Frescura", "Cosechar"] }
      ].map((planta) => (
        <div key={planta.nombre} onClick={() => setSelectedCrop(planta)} className="bg-white rounded-[4rem] overflow-hidden shadow-2xl border border-gray-100 flex flex-col lg:flex-row group cursor-pointer">
          <div className="lg:w-1/3 h-80 lg:h-auto overflow-hidden">
            <img src={`${API_BASE_URL}/api/asset/IMG/${planta.img}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={planta.nombre} />
          </div>
          <div className="p-12 lg:p-16 flex flex-col justify-center space-y-8">
            <h4 className="text-4xl font-black text-[#207b25] uppercase tracking-tighter">{planta.nombre}</h4>
            <p className="text-gray-400 font-bold mt-2 uppercase text-xs tracking-widest">{planta.desc}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default CultivoView;