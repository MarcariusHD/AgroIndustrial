export const getPlants = (desc) => {
  if (!desc) return [];
  try {
    const parsed = JSON.parse(desc);
    if (Array.isArray(parsed)) return parsed;
  } catch (e) {}
  if (typeof desc === 'string' && desc.includes(' - ')) {
    return desc.split(' - ').map(p => p.trim());
  }
  return desc ? [desc] : [];
};

export const getIconForPlant = (plantName, defaultIcon) => {
  if (!plantName) return defaultIcon;
  const p = String(plantName).toLowerCase();
  if (p.includes('tomate')) return '🍅';
  if (p.includes('lechuga')) return '🥬';
  if (p.includes('zanahoria')) return '🥕';
  if (p.includes('fresa')) return '🍓';
  if (p.includes('pimiento') || p.includes('morrón')) return '🫑';
  if (p.includes('brocoli')) return '🥦';
  if (p.includes('cilantro')) return '🌿';
  if (p.includes('raban') || p.includes('rában')) return '🌱';
  if (p.includes('espinaca')) return '🍃';
  return '🌱';
};