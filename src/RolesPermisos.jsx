import { useState } from 'react';

const RolesPermisos = () => {
  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-gray-900 tracking-tighter uppercase">Matriz de Seguridad</h2>
          <p className="text-[10px] font-bold text-[#207b25] uppercase tracking-[0.3em] mt-1">Configuración de niveles de autoridad</p>
        </div>
        <button className="px-6 py-3 bg-[#031c06] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:scale-105 transition-transform">
          + Definir Nuevo Rol
        </button>
      </div>

      <div className="grid grid-cols-3 gap-8">
        {[
          { title: 'Súper Admin', color: 'border-red-500', desc: 'Acceso total a la infraestructura, bases de datos y finanzas.', perms: ['Full Access', 'HW Management', 'DB Root', 'User Control'], active: true },
          { title: 'Operador Técnico', color: 'border-[#207b25]', desc: 'Gestión de sensores y actuadores. Sin acceso a usuarios.', perms: ['Dashboard', 'HW Control', 'Alerts Sync'], active: true },
          { title: 'Analista Data', color: 'border-blue-500', desc: 'Solo lectura de estadísticas y reportes de producción.', perms: ['Read Stats', 'Export PDF', 'View Maps'], active: false }
        ].map((rol, i) => (
          <div key={i} className={`bg-white rounded-[48px] p-10 border-t-[12px] shadow-2xl transition-all hover:-translate-y-2 ${rol.color}`}>
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-2xl font-black text-gray-900 leading-tight uppercase">{rol.title}</h3>
              <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase ${rol.active ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                {rol.active ? 'Habilitado' : 'Draft'}
              </span>
            </div>
            <p className="text-xs font-medium text-gray-400 mb-8 leading-relaxed">{rol.desc}</p>
            <div className="space-y-3">
              <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-4">Privilegios de Sistema</p>
              {rol.perms.map(p => (
                <div key={p} className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-[#71cc49] rounded-full shadow-[0_0_8px_#71cc49]"></div>
                  <span className="text-[10px] font-black text-gray-700 uppercase tracking-tighter">{p}</span>
                </div>
              ))}
            </div>
            <button className="w-full mt-10 py-4 bg-gray-50 border border-gray-100 rounded-3xl text-[10px] font-black uppercase text-gray-400 hover:bg-gray-900 hover:text-white transition-all">
              Configurar Permisos
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RolesPermisos;