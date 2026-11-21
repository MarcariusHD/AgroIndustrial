import { useState } from 'react';
import { useGreenhouses } from './useGreenhouses';
import ElectronicSummary from './ElectronicSummary';
import DeviceEnergyChart from './DeviceEnergyChart';
import Esp32Panel from './Esp32Panel';

export default function DispositivosActivos({ userId }) {
  const { greenhouses = [] } = useGreenhouses(userId);
  const [chosen, setChosen] = useState('');
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const items = [...new Map(greenhouses.map(g => [g.id_invernadero ?? g.id, g])).values()];
  const greenhouseId = items.some(g => String(g.id_invernadero ?? g.id) === String(chosen))
    ? chosen : (items[0]?.id_invernadero ?? items[0]?.id);
  return <div className="space-y-6">
    <div className="flex flex-wrap gap-3 rounded-2xl border bg-white p-4">{items.map(g => {
      const id = g.id_invernadero ?? g.id;
      return <button key={id} onClick={() => { setChosen(id); setSelectedDeviceId(null); }} className={`px-4 py-2 rounded-xl font-semibold text-sm ${String(id) === String(greenhouseId) ? 'bg-emerald-700 text-white' : 'bg-gray-100 text-gray-700'}`}>{g.nombre}</button>;
    })}{!items.length && <p>No hay invernaderos disponibles.</p>}</div>
    <ElectronicSummary greenhouseId={greenhouseId} />
    <Esp32Panel greenhouseId={greenhouseId} />
    <DeviceEnergyChart greenhouseId={greenhouseId} selectedDeviceId={selectedDeviceId} onSelectDevice={setSelectedDeviceId} />
  </div>;
}
