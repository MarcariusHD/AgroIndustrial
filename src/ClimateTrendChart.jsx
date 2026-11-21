import { useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, LabelList,
} from 'recharts';

const colors = { Real: '#0891b2', Hoy: '#059669', Predicción: '#f59e0b' };
const format = value => Number(value).toLocaleString('es-BO', { maximumFractionDigits: 1 });

function TemperatureTooltip({ active, payload, unit, weekly }) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  return <div className="bg-white p-4 rounded-2xl shadow-xl border border-gray-100 space-y-1">
    <p className="text-xs font-bold text-gray-500">{weekly ? `Día: ${row.name}` : `Hora: ${row.name}`}</p>
    <p className="text-2xl font-black text-gray-800">{format(row.value)} °{unit}</p>
    <p className="text-xs text-gray-500">{row.type === 'Predicción' ? 'Proyección ilustrativa' : 'Muestra ilustrativa'}</p>
  </div>;
}

export default function ClimateTrendChart({ data, unit, period, onPeriodChange }) {
  const [selectedName, setSelectedName] = useState(null);
  const weekly = period === 'week';
  if (!data.length) return <section className="bg-white rounded-3xl p-8 text-gray-500">No hay datos para este periodo.</section>;
  const min = data.reduce((a, b) => a.value <= b.value ? a : b);
  const max = data.reduce((a, b) => a.value >= b.value ? a : b);
  const mean = data.reduce((sum, row) => sum + row.value, 0) / data.length;
  const selectedIndex = Math.max(0, data.findIndex(row => row.name === selectedName));
  const selected = data[selectedIndex];
  const previous = data[selectedIndex - 1];
  const change = previous ? selected.value - previous.value : null;
  const padding = Math.max(2, (max.value - min.value) * 0.3);
  const summary = [
    { label: 'Mínima', value: min.value, detail: min.name, icon: '↓', style: 'bg-sky-50 text-sky-800 border-sky-100' },
    { label: 'Promedio', value: mean, detail: `${data.length} muestras`, icon: '≈', style: 'bg-emerald-50 text-emerald-800 border-emerald-100' },
    { label: 'Máxima', value: max.value, detail: max.name, icon: '↑', style: 'bg-orange-50 text-orange-800 border-orange-100' },
  ];
  return <section className="bg-white/90 backdrop-blur-xl rounded-3xl p-5 sm:p-7 shadow-sm border border-gray-100 space-y-5">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div><p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">Tendencia térmica</p><h3 className="text-xl font-black text-gray-800">{weekly ? 'Una mirada a los 7 días' : 'Así cambia la temperatura en 24 horas'}</h3><p className="text-sm text-gray-500 mt-2">{weekly ? 'Compara los valores diarios y distingue la proyección ilustrativa.' : 'Identifica las horas más frescas y los picos de temperatura.'}</p></div>
      <div className="flex bg-gray-100 p-1 rounded-xl" aria-label="Periodo de la gráfica">{[['today', '24 horas'], ['week', '7 días']].map(([value, label]) => <button key={value} type="button" aria-pressed={period === value} onClick={() => { onPeriodChange(value); setSelectedName(null); }} className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${period === value ? 'bg-emerald-700 text-white shadow-sm' : 'text-gray-600 hover:bg-white'}`}>{label}</button>)}</div>
    </div>
    <p className="inline-flex items-center gap-2 text-xs text-amber-800 bg-amber-50 border border-amber-100 px-3 py-2 rounded-xl"><span aria-hidden="true">◈</span>Serie de ejemplo · datos y proyecciones simulados</p>
    <div className="grid grid-cols-3 gap-2 sm:gap-3">{summary.map(item => <div key={item.label} className={`p-3 sm:p-4 rounded-2xl border ${item.style}`}><p className="text-xs font-semibold"><span aria-hidden="true">{item.icon}</span> {item.label}</p><p className="text-xl sm:text-2xl font-black mt-2">{format(item.value)}<span className="text-xs sm:text-sm ml-1">°{unit}</span></p><p className="text-[11px] mt-1 opacity-80">{item.detail}</p></div>)}</div>
    <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-gray-600">
      {weekly ? <><span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-cyan-600" />Días anteriores</span><span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-emerald-600" />Día de referencia</span><span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-amber-500" />Proyección de ejemplo</span></> : <span className="flex items-center gap-2"><span className="w-5 h-1 rounded bg-emerald-500" />Temperatura por hora</span>}
      <span className="flex items-center gap-2"><span className="w-5 border-t-2 border-dashed border-slate-500" />Promedio de las muestras</span>
    </div>
    <div className="overflow-x-auto rounded-2xl bg-slate-50/60 border border-gray-100 p-2">
      <div className="h-80 min-w-[430px]" role="img" aria-label={`Temperatura en ${weekly ? '7 días' : '24 horas'}: mínima ${format(min.value)}, máxima ${format(max.value)}, promedio ${format(mean)} grados ${unit}. Datos de ejemplo. Tabla de valores disponible debajo.`}>
        <ResponsiveContainer width="100%" height="100%">
          {weekly ? <BarChart accessibilityLayer data={data} margin={{ top: 30, right: 18, left: 0, bottom: 24 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#475569' }} label={{ value: 'Día de la semana', position: 'insideBottom', offset: -18 }} />
            <YAxis domain={[Math.min(0, min.value - padding), max.value + padding]} tickFormatter={value => `${format(value)}°`} tick={{ fontSize: 11 }} width={48} />
            <Tooltip content={<TemperatureTooltip unit={unit} weekly />} cursor={{ fill: '#e2e8f0', opacity: 0.35 }} />
            <ReferenceLine y={mean} stroke="#64748b" strokeDasharray="5 5" />
            <Bar dataKey="value" maxBarSize={44} radius={[7, 7, 0, 0]} onClick={row => setSelectedName(row.name)} cursor="pointer">
              {data.map(row => <Cell key={row.name} fill={colors[row.type] || '#0891b2'} stroke={selected.name === row.name ? '#0f172a' : 'none'} strokeWidth={2} />)}
              <LabelList dataKey="value" position="top" formatter={value => `${format(value)}°${unit}`} style={{ fontSize: 11, fontWeight: 700, fill: '#334155' }} />
            </Bar>
          </BarChart> : <AreaChart accessibilityLayer data={data} margin={{ top: 32, right: 22, left: 0, bottom: 24 }}>
            <defs><linearGradient id="climateDailyTemperature" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" stopOpacity={0.35} /><stop offset="100%" stopColor="#10b981" stopOpacity={0.02} /></linearGradient></defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#475569' }} axisLine={false} tickLine={false} label={{ value: 'Hora del día', position: 'insideBottom', offset: -18 }} />
            <YAxis domain={[Math.floor(min.value - padding), Math.ceil(max.value + padding)]} tickFormatter={value => `${format(value)}°`} tick={{ fontSize: 11 }} width={48} />
            <Tooltip content={<TemperatureTooltip unit={unit} weekly={false} />} />
            <ReferenceLine y={mean} stroke="#64748b" strokeDasharray="5 5" />
            <Area type="linear" dataKey="value" stroke="#059669" strokeWidth={3} fill="url(#climateDailyTemperature)" dot={{ r: 5, fill: '#fff', strokeWidth: 2 }} activeDot={{ r: 7 }}>
              <LabelList dataKey="value" position="top" offset={12} formatter={value => `${format(value)}°`} style={{ fontSize: 11, fill: '#065f46', fontWeight: 700 }} />
            </Area>
          </AreaChart>}
        </ResponsiveContainer>
      </div>
    </div>
    <div><p className="text-xs font-bold text-gray-600 mb-2">Selecciona {weekly ? 'un día' : 'una hora'} para ver el detalle</p><div className="grid grid-cols-4 sm:grid-cols-7 gap-2">{data.map(row => <button type="button" key={row.name} onClick={() => setSelectedName(row.name)} aria-pressed={selected.name === row.name} className={`p-2 rounded-xl border text-center transition-colors ${selected.name === row.name ? 'border-emerald-600 bg-emerald-50 ring-1 ring-emerald-600' : 'border-gray-200 hover:bg-gray-50'}`}><span className="block text-xs text-gray-500">{row.name}</span><span className="block text-sm font-bold text-gray-800 mt-1">{format(row.value)}°</span>{weekly && row.type === 'Predicción' && <span className="block text-[9px] text-amber-700">Proyección</span>}</button>)}</div></div>
    <div aria-live="polite" className="flex flex-wrap justify-between gap-3 bg-emerald-50/70 border border-emerald-100 p-4 rounded-2xl"><div><p className="text-xs font-semibold text-emerald-800">{selected.name} · {selected.type === 'Predicción' ? 'Proyección de ejemplo' : 'Muestra de ejemplo'}</p><p className="text-2xl font-black text-gray-800 mt-1">{format(selected.value)} °{unit}</p></div><p className="text-sm text-gray-600 self-center">{change == null ? 'Primera muestra del periodo.' : `${change > 0 ? '↑ Sube' : change < 0 ? '↓ Baja' : '→ Sin cambio'}${change !== 0 ? ` ${format(Math.abs(change))} °${unit}` : ''} respecto a ${previous.name}.`}</p></div>
    <p className="text-xs leading-relaxed text-gray-500">Rango entre mínima y máxima: <strong>{format(max.value - min.value)} °{unit}</strong>. El promedio corresponde a las {data.length} muestras mostradas{weekly ? ', incluidas las proyecciones de ejemplo' : ', no a un promedio ponderado de todas las horas'}. {weekly ? 'La referencia “Hoy” de la serie original es el jueves; no representa la fecha actual ni un pronóstico meteorológico conectado.' : 'La línea une las muestras disponibles; los intervalos de la serie son ilustrativos.'}</p>
    <details className="border-t border-gray-100 pt-3"><summary className="cursor-pointer text-sm font-bold text-emerald-700">Ver tabla de valores</summary><table className="w-full text-sm text-left mt-3"><thead><tr className="bg-gray-50"><th className="p-2">{weekly ? 'Día' : 'Hora'}</th><th className="p-2">Temperatura (°{unit})</th><th className="p-2">Serie</th></tr></thead><tbody>{data.map(row => <tr key={row.name} className="border-t border-gray-100"><td className="p-2">{row.name}</td><td className="p-2 font-semibold">{format(row.value)}</td><td className="p-2">{row.type === 'Predicción' ? 'Proyección de ejemplo' : 'Muestra de ejemplo'}</td></tr>)}</tbody></table></details>
  </section>;
}
