export const API_BASE_URL = 'http://127.0.0.1:8000';

export const slides = [
  { id: 1, title: "Cultiva el Futuro", text: "Innovación en cada semilla", img: `${API_BASE_URL}/api/asset/IMG/port1` },
  { id: 2, title: "Cosecha Inteligente", text: "Optimiza tu producción", img: `${API_BASE_URL}/api/asset/IMG/port2` },
  { id: 3, title: "Ecosistemas Verdes", text: "Sostenibilidad en cada paso", img: `${API_BASE_URL}/api/asset/IMG/port3` },
];

export const projectCrops = [
  { nombre: 'Lechuga de hoja', emoji: '🥬', img: 'lechuga', desc: 'Hortaliza de hoja para cosecha de hojas tiernas.', diff: 'Fácil', water: 'Humedad uniforme', planting: 'Según el ambiente del invernadero', harvestDiff: 'Corte de hojas', pests: 'Pulgones, Babosas' },
  { nombre: 'Rabanito', emoji: '🌱', img: 'rabanos', desc: 'Cultivo de raíz de ciclo corto para rotar con hortalizas de otras familias.', diff: 'Fácil', water: 'Humedad uniforme', planting: 'Según el ambiente del invernadero', harvestDiff: 'Extracción de la raíz', pests: 'Pulgones, Pulguilla' },
  { nombre: 'Espinaca', emoji: '🍃', img: 'espinacas', desc: 'Hortaliza de hoja adecuada para condiciones frescas.', diff: 'Fácil', water: 'Humedad uniforme', planting: 'Según el ambiente del invernadero', harvestDiff: 'Corte de hojas', pests: 'Pulgones, Minador de hojas' },
  { nombre: 'Cilantro', emoji: '🌿', img: null, desc: 'Hierba aromática para cosecha de hojas y siembras escalonadas.', diff: 'Fácil', water: 'Evitar encharcamiento', planting: 'Según el ambiente del invernadero', harvestDiff: 'Corte de hojas', pests: 'Pulgones' },
];

export const seasonCrops = Object.fromEntries(
  ['Primavera', 'Verano', 'Otoño', 'Invierno'].map(season => [season, projectCrops])
);

export const getPestImage = (pestName) => {
  const normalizedPestName = pestName.trim().toLowerCase();
  if (normalizedPestName.includes('pulgon') || normalizedPestName.includes('pulgón')) return `${API_BASE_URL}/api/asset/IMG/Pulgones`;
  if (normalizedPestName.includes('babosa') || normalizedPestName.includes('caracol')) return `${API_BASE_URL}/api/asset/IMG/Caracoles`;
  if (normalizedPestName.includes('mildiu') || normalizedPestName.includes('oídio') || normalizedPestName.includes('oidio')) return `${API_BASE_URL}/api/asset/IMG/Mildiu`;
  return `${API_BASE_URL}/api/asset/IMG/trips`;
};