import { useEffect, useState } from 'react';
const API = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
const number = value => Number(value).toLocaleString('es-BO', { maximumFractionDigits: 6 });
function valueLabel(row) {
  if (row.valor == null) return 'Sin lectura asociada';
  if (row.configuracion.metrica === 'humedad_suelo') return `${row.valor} % relativo`;
  if (row.configuracion.metrica === 'agua_detectada') return row.valor ? 'Contacto con agua' : 'Sin contacto con agua';
  return row.valor ? 'Orden: encendido' : 'Orden: apagado';
}
export default function ElectronicSummary({ greenhouseId }) {
  const [hours, setHours] = useState('24');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const key = `${greenhouseId}-${hours}`;
  useEffect(() => {
    if (!greenhouseId) return;
    const controller = new AbortController();
    let timer;
    async function load() {
      try {
        const response = await fetch(`${API}/dashboard/componentes-telemetria?id_inv=${greenhouseId}&horas=${hours}`, { signal: controller.signal });
        if (!response.ok) throw new Error('No se pudo consultar el inventario y la estimación. Revisa que el backend esté actualizado.');
        const data = await response.json();
        if (!controller.signal.aborted) { setResult({ key, ...data }); setError(''); }
      } catch (e) { if (!controller.signal.aborted) setError(e.message); }
      finally { if (!controller.signal.aborted) timer = setTimeout(load, 15000); }
    }
    load();
    return () => { controller.abort(); clearTimeout(timer); };
  }, [greenhouseId, hours, key]);
  const data = result?.key === key ? result : null;
  const rows = data?.componentes || [];
  const estimated = rows.filter(r => r.kwh_estimados != null);
  const sources = [...new Set(rows.filter(r => r.ultima_lectura).map(r => r.fuente_esp32))];
  const sensorCount = sources.reduce((sum, id) => sum + rows.find(r => r.fuente_esp32 === id).sensores_reportados.length, 0);
  return <section className="rounded-3xl border border-emerald-100 bg-white p-5 sm:p-7 space-y-5">
    <div className="flex flex-wrap justify-between gap-4"><div><p className="text-xs font-bold text-emerald-700 uppercase tracking-widest">Inventario conectado</p><h3 className="text-xl font-bold text-gray-800 mt-1">Componentes, sensores y energía estimada</h3><p className="text-sm text-gray-500 mt-2">Configura cada equipo desde Gestión → Componentes electrónicos → Añadir o Editar.</p></div><label className="text-sm">Periodo<select className="block border rounded-lg p-2 mt-1" value={hours} onChange={e => setHours(e.target.value)}><option value="24">24 horas</option><option value="168">7 días</option><option value="720">30 días</option></select></label></div>
    {error && <p role="alert" className="p-3 rounded-xl bg-red-50 text-red-800">{error} Los valores anteriores pueden estar desactualizados.</p>}
    {!data ? <p role="status">{greenhouseId ? 'Consultando componentes…' : 'Selecciona un invernadero.'}</p> : <>
      <div className="grid sm:grid-cols-3 gap-3">
        <div className="rounded-2xl bg-emerald-50 p-4"><p className="text-sm text-gray-600">Componentes registrados</p><strong className="text-3xl">{rows.length}</strong><p className="text-xs mt-2">{sources.length} ESP32 con lecturas reales</p></div>
        <div className="rounded-2xl bg-sky-50 p-4"><p className="text-sm text-gray-600">Canales de sensores reportados</p><strong className="text-3xl">{sensorCount}</strong><p className="text-xs mt-2">Según la última lectura; consulta su fecha en la tabla.</p></div>
        <div className="rounded-2xl bg-amber-50 p-4"><p className="text-sm text-gray-600">Energía estimada · parcial</p><strong className="text-2xl">{estimated.length ? `${number(estimated.reduce((sum, r) => sum + r.kwh_estimados, 0))} kWh` : 'Falta configuración'}</strong><p className="text-xs mt-2">{estimated.length} de {rows.length} componentes calculables. No es medición eléctrica.</p></div>
      </div>
      <div className="overflow-x-auto"><table className="w-full text-sm text-left"><thead className="bg-gray-50"><tr>{['Componente', 'Última lectura del origen', 'Dato asociado', 'Potencia', 'Tiempo estimado', 'Energía estimada'].map(h => <th key={h} className="p-3">{h}</th>)}</tr></thead><tbody>{rows.map(row => <tr key={row.id} className="border-b border-gray-100"><td className="p-3"><strong>{row.nombre}</strong><small className="block text-gray-500">{row.tipo} · #{row.id}{row.configuracion.pin != null ? ` · P${row.configuracion.pin}` : ''}</small></td><td className="p-3"><span className={row.reciente && !error ? 'text-emerald-700' : 'text-amber-700'}>{row.reciente && !error ? 'Reciente' : 'Sin datos recientes'}</span><small className="block text-gray-500">{row.ultima_lectura ? new Date(row.ultima_lectura).toLocaleString() : 'Sin registros'}</small></td><td className="p-3">{valueLabel(row)}</td><td className="p-3">{row.potencia_w == null ? 'Sin configurar' : `${number(row.potencia_w)} W`}</td><td className="p-3">{row.segundos_estimados == null ? '—' : `${number(row.segundos_estimados)} s`}<small className="block text-gray-500">Cobertura: {number(row.cobertura_segundos / 3600)} h / {hours} h</small></td><td className="p-3">{row.kwh_estimados == null ? row.motivo : `${number(row.kwh_estimados)} kWh`}</td></tr>)}</tbody></table></div>
      {!rows.length && <p className="text-gray-500">Añade componentes al invernadero para comenzar.</p>}
    </>}
  </section>;
}
