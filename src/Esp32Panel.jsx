import { useEffect, useState } from 'react';
import { Activity, Cpu, Droplets, Sprout, Power, Clock3, Info, Wifi, WifiOff, AlertTriangle, ChevronDown, History } from 'lucide-react';
import { fetchDashboardDevices, fetchEsp32Latest, fetchEsp32History } from './api';
import { irrigationStatus } from './irrigationStatus';
import './Esp32Panel.css';

const adc = value => value == null ? 'Sin lectura' : `${value} ADC`;
const soil = r => r.humedad_suelo != null ? `${r.humedad_suelo} %` : r.suelo_seco != null ? (r.suelo_seco ? 'Seco' : 'Húmedo') : adc(r.suelo_adc);
const water = r => r.agua_detectada == null ? 'Sin calibrar' : r.agua_detectada ? 'Contacto detectado' : 'Sin contacto';
const relay = r => r.rele_activado == null ? 'Sin informar' : r.rele_activado ? 'Encendida' : 'Apagada';
const date = value => new Date(value).toLocaleString();
const fanViews = [
  { key: 'fan1', name: 'Ventilador 1 · relé 2 · P25', fields: ['ventilador1_activado'] },
  { key: 'fan2', name: 'Ventilador 2 · relé 4 · P26', fields: ['ventilador2_activado'] },
];
const sensorViews = [
  ...fanViews,
  { key: 'interior', name: 'DHT22 interior', fields: ['temperatura', 'humedad'] },
  { key: 'exterior', name: 'DHT22 exterior', fields: ['temperatura_exterior', 'humedad_exterior'] },
  { key: 'soil2', name: 'Sustrato maceta 2', fields: ['suelo2_adc'] },
  { key: 'rain', name: 'Gotas de lluvia', fields: ['lluvia_detectada'] },

  { key: 'soil', name: 'Sensor de suelo', fields: ['suelo_adc', 'humedad_suelo', 'suelo_seco'] },
  { key: 'water', name: 'Sensor de agua', fields: ['agua_adc', 'agua_detectada'] },
  { key: 'pump', name: 'Bomba de riego', fields: ['rele_activado', 'estado_riego'] },
];
const hasReading = (reading, view) => view.fields.some(field => reading?.[field] != null);
const describeDevice = (name = '') => {
  const normalized = name.toLowerCase();
  if (/fc-28|suelo/.test(normalized)) return 'El sensor de humedad del suelo ayuda a conocer cuándo el cultivo necesita agua. Su lectura se interpreta según la calibración de suelo seco y húmedo.';
  if (/sensor de agua/.test(normalized)) return 'El sensor de agua detecta el contacto de agua con sus pistas. Ayuda a identificar su presencia, pero no mide el nivel ni los litros del depósito.';
  if (/relé|rele/.test(normalized)) return 'El relé funciona como un interruptor: recibe la orden del ESP32 para encender o apagar la bomba. La orden registrada no confirma que esté circulando agua.';
  if (/bomba/.test(normalized)) return 'La bomba impulsa el agua hacia el cultivo. El sistema controla su encendido mediante un relé para atender las necesidades de riego.';
  if (/temperatura/.test(normalized)) return 'Este dispositivo ayuda a supervisar la temperatura del cultivo y aporta información para el control de las condiciones del invernadero.';
  if (/esp32/.test(normalized)) return 'El ESP32 es el cerebro del sistema: recoge las lecturas de los sensores, las envía a esta pantalla y controla el relé de la bomba según la lógica de riego. Así puedes consultar la humedad del suelo, la detección de agua y las órdenes de riego desde un solo lugar.';
  return 'Este dispositivo aporta lecturas al monitoreo del cultivo. Debajo puedes consultar su última información recibida y el historial disponible.';
};

export default function Esp32Panel({ greenhouseId }) {
  return <TelemetryPanel key={greenhouseId || 'none'} greenhouseId={greenhouseId} />;
}

function TelemetryPanel({ greenhouseId }) {
  const [devices, setDevices] = useState([]);
  const [selection, setSelection] = useState(null);
  const effectiveSelection = selection ?? (devices.length ? String(devices[0].id) + ':all' : '');
  const [deviceId, view = 'all'] = effectiveSelection.split(':');
  const [latest, setLatest] = useState(null);
  const [history, setHistory] = useState([]);
  const [deviceError, setDeviceError] = useState('');
  const [devicesLoading, setDevicesLoading] = useState(Boolean(greenhouseId));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    let active = true;
    let timer;
    if (!greenhouseId) return;
    async function refreshDevices() {
      try {
        const data = await fetchDashboardDevices(greenhouseId);
        const results = await Promise.allSettled(data.map(d => fetchEsp32Latest(d.id)));
        if (!active) return;
        setDevices(previous => data.flatMap((d, index) => {
          const result = results[index];
          if (result.status === 'fulfilled') return result.value ? [{ ...d, reading: result.value }] : [];
          const cached = previous.find(item => item.id === d.id);
          return cached ? [cached] : [];
        }));
        setDeviceError(results.some(result => result.status === 'rejected')
          ? 'No se pudo comprobar la información de algunos dispositivos. Se reintentará automáticamente.' : '');
      } catch {
        if (active) setDeviceError('No se pudieron cargar los dispositivos. Se reintentará automáticamente.');
      } finally {
        if (active) { setDevicesLoading(false); timer = setTimeout(refreshDevices, 10000); }
      }
    }
    refreshDevices();
    return () => { active = false; clearTimeout(timer); };
  }, [greenhouseId]);
  useEffect(() => {
    let active = true;
    let timer;
    if (!deviceId) return;
    async function refresh() {
      try {
        const [reading, rows] = await Promise.all([fetchEsp32Latest(deviceId), fetchEsp32History(deviceId)]);
        if (active) { setLatest(reading); setHistory(rows); setError(''); }
      } catch { if (active) setError('No se pudo actualizar. Se conserva la última lectura recibida.'); }
      finally { if (active) { setLoading(false); timer = setTimeout(refresh, 10000); } }
    }
    refresh();
    return () => { active = false; clearTimeout(timer); };
  }, [deviceId]);
  const status = irrigationStatus(latest, now);
  const timestamp = latest ? Date.parse(latest.recibido_en) : NaN;
  const fresh = Boolean(latest) && Number.isFinite(timestamp) && now - timestamp <= 30000 && !error;
  const percent = latest?.humedad_suelo;
  const hasLegacy = history.some(r => r.temperatura != null || r.humedad != null || r.luz_adc != null);
  const ConnectionIcon = fresh ? Wifi : WifiOff;
  const StatusIcon = status?.warning ? AlertTriangle : Activity;
  const selectedDevice = devices.find(d => String(d.id) === deviceId);
  const selectedView = sensorViews.find(item => item.key === view);
  const visibleHistory = selectedView ? history.filter(r => hasReading(r, selectedView)) : history;
  const showSoil = view === 'all' || view === 'soil';
  const showWater = view === 'all' || view === 'water';
  const showPump = view === 'all' || view === 'pump';
  const showLegacy = view === 'all' && hasLegacy;
  const historyTitle = selectedView ? `Seguimiento · ${selectedView.name}` : 'Historial de lecturas';
  return <section className="esp-panel" aria-label="Monitoreo de suelo y riego">
    <header className="esp-header">
      <div className="esp-heading"><span className="esp-brand-icon"><Sprout size={25} aria-hidden="true" /></span><div>
        <p className="esp-eyebrow">MONITOREO · ESP32</p>
        <h3>Tu cultivo, conectado</h3>
        <p className="esp-subtitle">Humedad del suelo, detección de agua y estado del riego en un solo lugar.</p>
      </div></div>
      <span className={`esp-connection ${fresh ? 'is-fresh' : ''}`}><ConnectionIcon size={15} aria-hidden="true" />{fresh ? (latest.simulado ? 'Simulación reciente' : 'Datos recientes') : latest ? 'Sin datos recientes' : 'Esperando datos'}</span>
    </header>
    <div className="esp-toolbar">
      <label className="esp-device"><span><Cpu size={15} aria-hidden="true" /> Dispositivo</span><div className="esp-select-wrap">
        <select aria-label="Dispositivo ESP32" aria-describedby="esp-device-description" value={selectedDevice ? effectiveSelection : ''} disabled={!greenhouseId || devicesLoading || !devices.length} onChange={e => {
          const nextSelection = e.target.value;
          if (nextSelection.split(':')[0] !== deviceId) {
            setLatest(null); setHistory([]); setError(''); setLoading(Boolean(nextSelection));
          }
          setSelection(nextSelection);
        }}>
          <option value="">{!greenhouseId ? 'Selecciona un invernadero' : devicesLoading ? 'Buscando dispositivos con información…' : !devices.length ? 'Sin dispositivos con información' : 'Selecciona un dispositivo'}</option>
          {devices.map(d => <optgroup key={d.id} label={d.nombre}>
            <option value={`${d.id}:all`}>{d.nombre}</option>
            {sensorViews.filter(item => item.key.startsWith('fan') || hasReading(d.reading, item)).map(item =>
              <option key={item.key} value={`${d.id}:${item.key}`}>{item.name}{devices.length > 1 ? ` · ${d.nombre}` : ''}</option>
            )}
          </optgroup>)}
        </select><ChevronDown size={16} aria-hidden="true" /></div>
      </label>
      <div className="esp-update"><Clock3 size={16} aria-hidden="true" /><div><strong>Actualización cada 10 s</strong><span>{latest ? `Última recepción: ${date(latest.recibido_en)}` : 'Las lecturas aparecerán al conectar tu dispositivo'}</span></div></div>
    </div>
    <p id="esp-device-description" className="esp-device-description" aria-live="polite">{selectedDevice
      ? <>{describeDevice(selectedView?.name || selectedDevice.nombre)}{selectedView && <> Las lecturas de este apartado llegan a través de {selectedDevice.nombre}.</>}</>
      : 'Solo aparecen dispositivos con lecturas guardadas. Selecciona uno para consultar su información y conocer su función en el sistema.'}</p>
    {(deviceError || error) && <p role="alert" className="esp-notice is-warning"><AlertTriangle size={19} aria-hidden="true" />{deviceError || error}</p>}
    {!latest && <div className="esp-empty"><Cpu size={30} aria-hidden="true" /><h4>{loading ? 'Consultando tu dispositivo…' : deviceId ? 'Esperando la primera lectura' : 'Conecta con tu cultivo'}</h4><p>{deviceId ? 'Cuando el ESP32 envíe una muestra, verás aquí tus sensores.' : 'Elige un dispositivo del invernadero para consultar su actividad.'}</p></div>}
    {latest && <>
      <div className={`esp-notice ${status.warning ? 'is-warning' : ''}`} role={status.warning ? 'alert' : 'status'}><StatusIcon size={20} aria-hidden="true" /><span>{status.text}</span><span className="esp-origin">{latest.simulado ? 'Simulado' : 'Sensor real'}</span></div>
      {!fresh && <p className="esp-old">Los valores siguientes corresponden a la última muestra; no confirman el estado actual.</p>}
      <div className="esp-metrics" style={selectedView ? { gridTemplateColumns: 'minmax(0, 1fr)' } : undefined}>
        {sensorViews.filter(item => ['interior', 'exterior', 'soil2', 'rain'].includes(item.key) && (view === 'all' || view === item.key)).map(item => <article key={item.key} className="esp-metric"><h4>{item.name}</h4>{item.fields.map(field => <p key={field}>{field.replaceAll('_', ' ')}: <strong>{latest[field] == null ? 'Sin lectura' : typeof latest[field] === 'boolean' ? (latest[field] ? 'Detectada' : 'Sin gotas') : latest[field]}{latest[field] != null && (field.startsWith('temperatura') ? ' °C' : field.startsWith('humedad') ? ' %' : field.endsWith('_adc') ? ' ADC' : '')}</strong></p>)}</article>)}
        {fanViews.filter(item => view === 'all' || view === item.key).map(item => <article key={item.key} className="esp-metric">
          <h4>{item.name}</h4>
          <p className="esp-value esp-state-value">{latest[item.fields[0]] == null ? 'Sin informar' : latest[item.fields[0]] ? 'Encendido' : 'Apagado'}</p>
          <p className="esp-metric-note">Última orden reportada por el ESP32.</p>
        </article>)}
        {showSoil && <article className="esp-metric esp-soil"><div className="esp-metric-label"><span>Humedad del suelo</span><Sprout size={21} aria-hidden="true" /></div>
          <p className="esp-value">{percent != null ? <>{percent}<span>%</span></> : soil(latest)}</p>
          <p className="esp-metric-note">{percent != null ? 'Escala relativa a tu calibración' : 'Pendiente de calibración analógica'}</p>
          {percent != null && <div className="esp-meter" role="meter" aria-label="Humedad relativa del suelo" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}><div style={{ width: `${Math.min(100, Math.max(0, percent))}%` }} /></div>}
          <div className="esp-metric-footer"><span>Lectura del sensor</span><strong>{adc(latest.suelo_adc)}</strong></div>
        </article>}
        {showWater && <article className="esp-metric esp-water"><div className="esp-metric-label"><span>Sensor de agua</span><Droplets size={21} aria-hidden="true" /></div>
          <p className="esp-value esp-state-value">{water(latest)}</p><p className="esp-metric-note">Detecta humedad en las pistas, no el nivel del depósito.</p>
          <div className="esp-metric-footer"><span>Lectura del sensor</span><strong>{adc(latest.agua_adc)}</strong></div>
        </article>}
        {showPump && <article className="esp-metric esp-pump"><div className="esp-metric-label"><span>Bomba de riego</span><Power size={21} aria-hidden="true" /></div>
          <p className="esp-value esp-state-value">{relay(latest)}</p><p className="esp-metric-note">Última orden enviada al relé. No confirma flujo de agua.</p>
          <div className="esp-metric-footer"><span className={`esp-dot ${latest.rele_activado ? 'is-on' : ''}`} /><span>{latest.rele_activado == null ? 'Sin orden registrada' : 'Orden registrada por el ESP32'}</span></div>
        </article>}
      </div>
      <details key={view} className="esp-history" open><summary><span><History size={18} aria-hidden="true" /> {historyTitle} <span className="esp-count">{visibleHistory.length}</span></span><ChevronDown size={17} aria-hidden="true" /></summary>
        <div className="esp-table-scroll" tabIndex={0} role="region" aria-label={historyTitle}><table><caption className="esp-sr-only">{historyTitle}: muestras disponibles entre las últimas 20 lecturas, más recientes primero</caption><thead><tr><th>Recepción</th>{showSoil && <><th>Suelo</th>{view === 'soil' && <th>Lectura del sensor</th>}</>}{showWater && <><th>Agua</th>{view === 'water' && <th>Lectura del sensor</th>}</>}{showPump && <th>Bomba · orden</th>}{fanViews.filter(item => view === 'all' || view === item.key).map(item => <th key={item.key}>{item.name}</th>)}<th>Origen</th>{showLegacy && <><th>Temperatura</th><th>Humedad ambiente</th><th>Luz</th></>}</tr></thead>
          <tbody>{visibleHistory.map(r => <tr key={r.id}>
            <td className="esp-time">{date(r.recibido_en)}</td>
            {showSoil && <><td><strong>{soil(r)}</strong></td>{view === 'soil' && <td>{adc(r.suelo_adc)}</td>}</>}
            {showWater && <><td>{r.agua_detectada == null ? (view === 'water' ? 'Sin calibrar' : adc(r.agua_adc)) : water(r)}{view === 'all' && r.agua_detectada != null && <small>{adc(r.agua_adc)}</small>}</td>{view === 'water' && <td>{adc(r.agua_adc)}</td>}</>}
            {showPump && <td>{relay(r)}{r.estado_riego && <small>{irrigationStatus(r, Date.parse(r.recibido_en)).text}</small>}</td>}
            {fanViews.filter(item => view === 'all' || view === item.key).map(item => <td key={item.key}>{r[item.fields[0]] == null ? 'Sin informar' : r[item.fields[0]] ? 'Encendido' : 'Apagado'}</td>)}
            <td><span className="esp-table-origin">{r.simulado ? 'Simulado' : 'Real'}</span></td>
            {showLegacy && <><td>{r.temperatura == null ? '—' : `${r.temperatura} °C`}</td><td>{r.humedad == null ? '—' : `${r.humedad} %`}</td><td>{adc(r.luz_adc)}</td></>}
          </tr>)}</tbody>
        </table></div>
        {!visibleHistory.length && <p className="esp-device-description">No hay lecturas de este apartado entre las últimas muestras recibidas.</p>}
      </details>
    </>}
    <details className="esp-help"><summary><Info size={16} aria-hidden="true" /> Cómo interpretar las lecturas</summary><p>ADC es la señal del sensor sin convertir, de 0 a 4095. El porcentaje de suelo es relativo a tus referencias seca y húmeda. El sensor de agua indica contacto en sus pistas: no mide litros ni porcentaje del depósito y puede seguir detectando gotas después de retirarlo.</p></details>
  </section>;
}
