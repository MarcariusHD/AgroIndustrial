import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { fetchGreenhouseReadings, fetchEsp32History } from '../api';

const metrics = [
  { field: 'humedad_suelo', name: 'Humedad del suelo', unit: '%', color: '#34d399' },
  { field: 'temperatura', name: 'Temperatura del aire', unit: '°C', color: '#f59e0b' },
  { field: 'humedad', name: 'Humedad del ambiente', unit: '%', color: '#38bdf8' },
];

export default function SectorTelemetryModal(props) {
  if (!props.isOpen) return null;
  return <History key={props.greenhouseId ?? 'none'} {...props} />;
}

function History({ onClose, greenhouseId, sectorId, cropName }) {
  const [field, setField] = useState('humedad_suelo');
  const [readings, setReadings] = useState([]);
  const [deviceId, setDeviceId] = useState(null);
  const [sources, setSources] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    let timer;
    async function load() {
      try {
        const latest = greenhouseId ? await fetchGreenhouseReadings(greenhouseId) : [];
        const id = latest.some(row => row.id_dispositivo === deviceId) ? deviceId : latest[0]?.id_dispositivo;
        const rows = id ? await fetchEsp32History(id) : [];
        if (active) {
          setSources(latest);
          setReadings(rows.filter(row => row.simulado === false));
          setError('');
        }
      } catch {
        if (active) setError('No se pudo actualizar el historial.');
      } finally {
        if (active) { setLoading(false); timer = setTimeout(load, 10000); }
      }
    }
    load();
    return () => { active = false; clearTimeout(timer); };
  }, [greenhouseId, deviceId]);
  const metric = metrics.find(item => item.field === field);
  const data = readings.filter(row => typeof row[field] === 'number' && Number.isFinite(row[field]))
    .slice().reverse().map(row => ({ time: new Date(row.recibido_en).toLocaleTimeString('es-BO'), valor: row[field] }));
  const values = data.map(row => row.valor);
  const summary = values.length ? [Math.min(...values), values.reduce((sum, value) => sum + value, 0) / values.length, Math.max(...values)] : [];
  return <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4" onClick={onClose}>
    <section role="dialog" aria-modal="true" aria-labelledby="sector-history-title" className="bg-[#031c06] text-white w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-[3rem] p-6 md:p-10 space-y-6" onClick={event => event.stopPropagation()}>
      <header className="flex justify-between items-start gap-4">
        <div><h3 id="sector-history-title" className="text-2xl font-black">Historial técnico · Sector {sectorId}</h3><p className="text-emerald-200 mt-2">{cropName}</p></div>
        <button type="button" onClick={onClose} aria-label="Cerrar historial" className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20">✕</button>
      </header>
      <div className="grid grid-cols-3 gap-3">{metrics.map(item => <button key={item.field} onClick={() => setField(item.field)} className={`p-4 rounded-2xl border text-sm font-bold ${field === item.field ? 'bg-[#207b25] border-emerald-400' : 'bg-white/5 border-white/10'}`}>{item.name}</button>)}</div>
      <label className="block text-sm">Dispositivo del invernadero
        <select value={deviceId ?? sources[0]?.id_dispositivo ?? ''} onChange={event => { setDeviceId(Number(event.target.value)); setReadings([]); setLoading(true); }} className="ml-3 bg-[#043b05] rounded-lg p-2">
          {!sources.length && <option value="">Sin datos</option>}
          {sources.map(row => <option key={row.id_dispositivo} value={row.id_dispositivo}>ESP32 {row.id_dispositivo}</option>)}
        </select>
      </label>
      {error && <p role="status" className="text-amber-300">{error}</p>}
      <div className="rounded-[2rem] bg-white/5 border border-white/10 p-5">
        <h4 className="font-bold mb-5">{metric.name} · últimas muestras guardadas</h4>
        {data.length ? <div className="h-64"><ResponsiveContainer width="100%" height="100%"><AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.1)" />
          <XAxis dataKey="time" stroke="#9ca3af" fontSize={10} /><YAxis stroke="#9ca3af" fontSize={10} />
          <Tooltip contentStyle={{ background: '#031c06', borderRadius: 12 }} formatter={value => [`${value} ${metric.unit}`, metric.name]} />
          <Area type="monotone" dataKey="valor" stroke={metric.color} fill={metric.color} fillOpacity={0.18} />
        </AreaChart></ResponsiveContainer></div> : <p className="py-16 text-center text-gray-400">{loading ? 'Cargando historial…' : 'Sin lecturas para esta variable.'}</p>}
      </div>
      <div className="grid grid-cols-3 gap-3">{['Mínimo', 'Promedio', 'Máximo'].map((label, index) => <div key={label} className="rounded-2xl bg-white/5 border border-white/10 p-4 text-center"><p className="text-xs text-emerald-200">{label}</p><strong className="block text-2xl mt-2">{summary.length ? `${summary[index].toFixed(1)} ${metric.unit}` : '—'}</strong></div>)}</div>
      <p className="text-xs text-gray-400">Lecturas compartidas del invernadero, actualizadas cada 10 segundos.</p>
    </section>
  </div>;
}
