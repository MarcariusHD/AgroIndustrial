import { useState } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

// Mock data
const tempData = [
  { name: '00h', value: 18 }, { name: '04h', value: 16 },
  { name: '08h', value: 22 }, { name: '12h', value: 28 },
  { name: '16h', value: 30 }, { name: '20h', value: 24 }, { name: '23h', value: 19 },
];

const AlertasTemperatura = () => {
  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic">Monitor Termométrico</h2>
        <span className="px-4 py-2 bg-red-100 text-red-600 rounded-2xl text-[10px] font-black uppercase tracking-widest animate-pulse">2 Alertas Activas</span>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Gráfica de Tendencia */}
        <div className="col-span-2 bg-white p-8 rounded-[40px] border border-gray-100 shadow-xl">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-8">Fluctuación de Temperatura (Últimas 6h)</h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={tempData}>
                <defs>
                  <linearGradient id="colorAlert" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#fef2f2" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9ca3af'}} />
                <YAxis hide domain={['auto', 'auto']} />
                <Tooltip 
                  contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#ef4444', fontWeight: 'bold' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#ef4444" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorAlert)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between mt-6 text-[10px] font-black text-gray-300 uppercase">
            <span>10:00 AM</span><span>12:00 PM</span><span>02:00 PM</span><span>04:00 PM</span>
          </div>
        </div>

        {/* Stats Rápidos */}
        <div className="space-y-6">
          <div className="bg-red-600 text-white p-6 rounded-[32px] shadow-lg shadow-red-200">
            <p className="text-[10px] font-black uppercase opacity-60 tracking-widest">Pico Máximo</p>
            <p className="text-4xl font-black mt-1">34.5°C</p>
            <p className="text-[10px] font-bold mt-2 uppercase">Detectado en Sector A1</p>
          </div>
          <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Promedio Sala</p>
            <p className="text-4xl font-black text-gray-900 mt-1">26.2°C</p>
            <div className="h-1.5 w-full bg-gray-100 rounded-full mt-4 overflow-hidden">
              <div className="h-full bg-orange-500 w-[75%]"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Log de Alertas */}
      <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 bg-gray-50/50">
          <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Historial de Incidencias Térmicas</h4>
        </div>
        <div className="divide-y divide-gray-50">
          {[
            { time: '14:32', msg: 'Sobrecalentamiento Crítico', zone: 'Sector Norte', severity: 'High', temp: '34°C' },
            { time: '12:15', msg: 'Descenso Brusco Detectado', zone: 'Hidroponía', severity: 'Mid', temp: '18°C' },
            { time: '09:05', msg: 'Falla de Sensor Ambiente', zone: 'Zona Carga', severity: 'Low', temp: '--' }
          ].map((log, i) => (
            <div key={i} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <span className="text-xs font-black text-gray-300">{log.time}</span>
                <div className={`w-2 h-2 rounded-full ${log.severity === 'High' ? 'bg-red-500' : 'bg-orange-400'}`}></div>
                <span className="text-sm font-bold text-gray-800">{log.msg}</span>
              </div>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-100 px-3 py-1 rounded-full">{log.zone}</span>
              <span className="text-lg font-black text-red-600">{log.temp}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AlertasTemperatura;