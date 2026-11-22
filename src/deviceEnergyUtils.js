export const formatEnergy = value => Number(value).toLocaleString('es-BO', { minimumFractionDigits: 0, maximumFractionDigits: 3 });
export function summarizeEnergy(devices) {
  const measured = devices.filter(row => row.kwh !== null && row.kwh !== undefined && Number.isFinite(Number(row.kwh)))
    .map(row => ({ ...row, kwh: Number(row.kwh), label: `${row.nombre} · #${row.id}` })).sort((a, b) => b.kwh - a.kwh);
  return { measured, missing: devices.length - measured.length, total: measured.length ? measured.reduce((sum, row) => sum + row.kwh, 0) : null };
}
