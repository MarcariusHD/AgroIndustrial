import { useEffect, useState } from 'react';
import { Wind, Droplet, Droplets, Sun, Activity } from 'lucide-react';
import { fetchGreenhouseReadings } from './api';
import { liveSensorCards } from './liveSensorData';

const icons = { 'Tanque de agua': Droplets, 'Humedad del suelo': Droplet, 'Luz Solar': Sun, 'Temp. Aire': Wind };

export default function LiveGreenhouseSensors({ greenhouseId, ambientOnly = false, compact = false }) {
  const [readings, setReadings] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now);

  useEffect(() => {
    let active = true;
    let timer;
    if (!greenhouseId) return;
    async function refresh() {
      try {
        const data = await fetchGreenhouseReadings(greenhouseId);
        if (!Array.isArray(data)) throw new Error('Respuesta inválida');
        if (active) { setReadings(data); setError(''); }
      } catch {
        if (active) setError('No se pudo actualizar. Se muestra la última lectura disponible.');
      } finally {
        if (active) { setLoading(false); timer = setTimeout(refresh, 10000); }
      }
    }
    refresh();
    const clock = setInterval(() => setNow(Date.now()), 1000);
    return () => { active = false; clearTimeout(timer); clearInterval(clock); };
  }, [greenhouseId]);

  const cards = liveSensorCards(readings, { ambientOnly });
  const visibleCards = compact
    ? ['Humedad del suelo', 'Temp. Aire', 'Humedad ambiente', 'Tanque de agua'].map(name => cards.find(card => card.nombre === name))
    : cards;

  return <section className={compact ? "space-y-4" : "bg-gray-50 p-5 rounded-3xl border border-gray-200"}>
    <h3 className="text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">{ambientOnly ? 'Temperatura y humedad del ambiente' : 'Sensores en vivo'}</h3>
    <p className="text-[10px] text-gray-500 mb-4">Lecturas del ESP32 · actualización cada 10 s</p>
    {error && <p role="status" className="text-xs text-amber-800 mb-3">{error}</p>}
    <div className={compact ? "grid grid-cols-2 md:grid-cols-4 gap-5" : "grid grid-cols-2 gap-3"}>
      {visibleCards.map(sensor => {
        const Icon = icons[sensor.nombre] || Activity;
        const age = now - Date.parse(sensor.recibido_en);
        const fresh = sensor.valor != null && Number.isFinite(age) && age >= -5000 && age <= 30000 && !error;
        return <div key={sensor.nombre} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-2 min-h-[100px]">
          <span className="text-[10px] uppercase text-gray-500 font-black tracking-tight flex items-center gap-1"><Icon size={12} className="shrink-0" />{sensor.nombre}</span>
          <span className="text-xl font-black text-gray-900 leading-none">
            {sensor.valor == null ? (greenhouseId && loading ? 'Cargando…' : 'Sin datos') : sensor.labels ? sensor.labels[Number(sensor.valor)] : `${sensor.valor.toLocaleString('es-BO', { maximumFractionDigits: 1 })} ${sensor.unidad}`}
          </span>
          {sensor.valor != null && <>
            <span className={`text-[10px] font-bold ${fresh ? 'text-emerald-700' : 'text-amber-700'}`}>{fresh ? 'En vivo' : 'Sin actualización reciente'}</span>
            <span className="text-[9px] text-gray-500">Dispositivo {sensor.deviceId} · {new Date(sensor.recibido_en).toLocaleString('es-BO')}</span>
          </>}
          {sensor.note && <p className="text-[10px] leading-relaxed text-gray-500">{sensor.note}</p>}
        </div>;
      })}
    </div>
  </section>;
}
