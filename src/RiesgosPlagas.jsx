import { useState } from 'react';
import GestorRiesgos from './GestorRiesgos';
import AlertasPlagas from './AlertasPlagas';

export default function RiesgosPlagas({ userId, userNames }) {
  const [activeTab, setActiveTab] = useState('riesgos');
  return <div className="space-y-6">
    <div role="tablist" aria-label="Riesgos y Plagas" className="flex flex-wrap gap-2 bg-white/80 rounded-2xl p-2 border border-gray-100">
      {[
        ['riesgos', 'Gestor de Riesgos'],
        ['plagas', 'Alertas de Plagas'],
      ].map(([id, label]) => <button
        key={id}
        id={`tab-${id}`}
        role="tab"
        aria-selected={activeTab === id}
        aria-controls={`panel-${id}`}
        onClick={() => setActiveTab(id)}
        className={`px-6 py-3 rounded-xl font-bold text-sm transition-colors ${activeTab === id ? 'bg-emerald-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
      >{label}</button>)}
    </div>
    <div id="panel-riesgos" role="tabpanel" aria-labelledby="tab-riesgos" hidden={activeTab !== 'riesgos'}>
      <GestorRiesgos userId={userId} userNames={userNames} />
    </div>
    <div id="panel-plagas" role="tabpanel" aria-labelledby="tab-plagas" hidden={activeTab !== 'plagas'}>
      <AlertasPlagas userId={userId} />
    </div>
  </div>;
}
