import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { formatEnergy, summarizeEnergy } from './deviceEnergyUtils';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
export default function DeviceEnergyChart({ greenhouseId, selectedDeviceId, onSelectDevice }) {
  const [hours, setHours] = useState('24');
  const [revision, setRevision] = useState(0);
  const key = `${greenhouseId || ''}-${hours}`;
  const [state, setState] = useState({ key: '', rows: [], error: '', loading: true });
  useEffect(() => {
    if (!greenhouseId) return;
    const controller = new AbortController();
    async function load() {
      setState({ key, rows: [], error: '', loading: true });
      try {
        const response = await fetch(`${API_BASE}/dashboard/consumo-energia?id_inv=${greenhouseId}&horas=${hours}`, { signal: controller.signal });
        if (!response.ok) throw new Error('No se pudo cargar el consumo de energía. Pulsa Actualizar para reintentar.');
        const body = await response.json();
        if (!controller.signal.aborted) setState({ key, rows: body.dispositivos, error: '', loading: false });
      } catch (error) {
        if (!controller.signal.aborted) setState({ key, rows: [], error: error.message, loading: false });
      }
    }
    load();
    return () => controller.abort();
  }, [greenhouseId, hours, key, revision]);
  const data = state.key === key ? state : { rows: [], error: '', loading: Boolean(greenhouseId) };
  const { measured, missing, total } = summarizeEnergy(data.rows);
  const selected = data.rows.find(row => Number(row.id) === Number(selectedDeviceId));
  return <section className="col-span-1 md:col-span-2 bg-white/90 rounded-3xl shadow-sm border border-gray-100 p-5 sm:p-7 space-y-5">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div><h3 className="text-lg font-black text-gray-800 flex items-center gap-2"><span className="bg-amber-100 p-2 rounded-xl" aria-hidden="true">⚡</span>Consumo de energía</h3><p className="text-sm text-gray-500 mt-2">Compara la energía registrada por cada dispositivo del invernadero.</p></div>
      <div className="flex flex-wrap gap-2"><label className="text-xs font-bold text-gray-600">Periodo<select value={hours} onChange={e => setHours(e.target.value)} className="block mt-1 border border-gray-200 rounded-xl p-2.5 bg-white text-sm"><option value="24">Últimas 24 horas</option><option value="168">Últimos 7 días</option><option value="720">Últimos 30 días</option></select></label><button type="button" disabled={!greenhouseId || data.loading} onClick={() => setRevision(value => value + 1)} className="self-end border rounded-xl p-2.5 text-sm font-bold text-emerald-700 disabled:opacity-50">Actualizar</button></div>
    </div>
    {data.error ? <p role="alert" className="p-4 bg-red-50 text-red-700 rounded-xl">{data.error}</p> : data.loading ? <p role="status" className="p-10 text-center text-gray-500">Consultando consumo registrado…</p> : <>
      <div className="grid sm:grid-cols-3 gap-3">
        <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl"><p className="text-xs text-amber-800 font-bold">Total registrado</p><p className="text-2xl font-black text-gray-800 mt-1">{total == null ? 'Sin datos' : `${formatEnergy(total)} kWh`}</p><p className="text-xs text-gray-500 mt-1">Suma de los dispositivos con registros</p></div>
        <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl"><p className="text-xs text-gray-500 font-bold">Cobertura de datos</p><p className="text-2xl font-black text-gray-800 mt-1">{measured.length} / {data.rows.length}</p><p className="text-xs text-gray-500 mt-1">Dispositivos con consumo registrado</p></div>
        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl"><p className="text-xs text-emerald-800 font-bold">Dispositivo seleccionado</p><p className="text-2xl font-black text-gray-800 mt-1">{selected?.kwh == null ? 'Sin datos' : `${formatEnergy(selected.kwh)} kWh`}</p><p className="text-xs text-gray-500 mt-1">{selected?.nombre || 'Selecciona un dispositivo'}</p></div>
      </div>
      {measured.length > 0 ? <>
        <div className="flex flex-wrap gap-4 text-xs text-gray-600"><span>🟢 Dispositivo seleccionado</span><span>🟠 Otros dispositivos</span><span>Más largo = mayor consumo registrado</span></div>
        <div className="overflow-y-auto max-h-[520px] rounded-xl bg-gray-50/50 p-2" role="img" aria-label="Consumo registrado por dispositivo en kilovatios hora. Valores completos en la tabla inferior.">
          <div style={{ height: Math.max(240, measured.length * 48 + 65) }}><ResponsiveContainer width="100%" height="100%"><BarChart accessibilityLayer data={measured} layout="vertical" margin={{ top: 10, right: 85, bottom: 25, left: 5 }}><CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" /><XAxis type="number" tick={{ fontSize: 11 }} label={{ value: 'Energía registrada (kWh)', position: 'insideBottom', offset: -18 }} /><YAxis type="category" dataKey="label" width={125} tick={{ fontSize: 11 }} tickFormatter={name => name.length > 21 ? `${name.slice(0, 19)}…` : name} interval={0} /><Tooltip cursor={{ fill: '#fef3c7' }} formatter={value => [`${formatEnergy(value)} kWh`, 'Consumo registrado']} contentStyle={{ borderRadius: 12 }} /><Bar dataKey="kwh" radius={[0, 6, 6, 0]} maxBarSize={26} onClick={row => onSelectDevice(row.id)} cursor="pointer">{measured.map(row => <Cell key={row.id} fill={Number(row.id) === Number(selectedDeviceId) ? '#059669' : '#f59e0b'} />)}<LabelList dataKey="kwh" position="right" formatter={value => `${formatEnergy(value)} kWh`} style={{ fontSize: 11, fill: '#374151' }} /></Bar></BarChart></ResponsiveContainer></div>
        </div>
      </> : <div className="p-8 text-center border border-dashed border-amber-200 rounded-2xl bg-amber-50/40"><p className="text-3xl mb-3" aria-hidden="true">⚡</p><p className="font-bold text-gray-700">{data.rows.length ? 'Todavía no hay consumos registrados en este periodo' : 'No hay dispositivos para comparar'}</p><p className="text-sm text-gray-500 mt-2">{data.rows.length ? 'Prueba otro periodo. El gráfico aparecerá cuando se registren mediciones de energía.' : 'Selecciona un invernadero con dispositivos.'}</p></div>}
      {missing > 0 && <p className="text-xs text-amber-800">{missing} dispositivo(s) sin registros en este periodo. “Sin datos” no significa consumo cero.</p>}
      {data.rows.length > 0 && <details className="border border-gray-100 rounded-xl p-3"><summary className="cursor-pointer text-sm font-bold text-gray-700">Ver valores de todos los dispositivos ({data.rows.length})</summary><div className="overflow-x-auto mt-3"><table className="w-full text-sm text-left"><thead><tr className="bg-gray-50"><th className="p-3">Dispositivo</th><th className="p-3">Consumo</th><th className="p-3">Parte del total</th><th className="p-3">Registros</th></tr></thead><tbody>{data.rows.map(row => <tr key={row.id} className="border-t border-gray-100"><td className="p-3"><button onClick={() => onSelectDevice(row.id)} className="text-emerald-700 underline">{row.nombre} · #{row.id}</button></td><td className="p-3">{row.kwh == null ? 'Sin datos' : `${formatEnergy(row.kwh)} kWh`}</td><td className="p-3">{row.kwh != null && total > 0 ? `${(Number(row.kwh) / total * 100).toFixed(1)} %` : '—'}</td><td className="p-3">{row.registros}</td></tr>)}</tbody></table></div></details>}
      <p className="text-xs text-gray-500">kWh = kilovatio-hora, unidad de energía. Se suman los kWh guardados en el periodo; no es potencia instantánea en watts ni una estimación basada en el estado del dispositivo.</p>
    </>}
  </section>;
}
