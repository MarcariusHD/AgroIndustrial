import { allFields, allParameters } from './soilForm.js';

export const fieldExamples = {
  numero_muestra: 'M-001', productor_finca: 'Finca Los Pinos', lote_sector: 'Sector Norte 2',
  ubicacion: 'Achocalla, La Paz', geolocalizacion: '-16.5520, -68.1650', superficie_ha: '1.5',
  fecha_muestreo: '2026-10-06', responsable_muestreo: 'María Pérez', profundidad_desde: '0', profundidad_hasta: '20',
  tipo_muestra: 'Compuesta', numero_submuestras: '15', cultivo: 'Tomate cherry', sistema_produccion: 'Riego',
  aplicaciones_recientes: 'Compost, 2 t/ha, aplicado el 15/09/2026', textura: 'Franca', determinacion_textura: 'Laboratorio',
  arena: '40', limo: '40', arcilla: '20', humedad_campo: 'Húmedo', drenaje: 'Moderado', compactacion: 'No', erosion: 'No evaluado',
  observaciones_campo: 'Encharcamiento en el extremo sur del lote', laboratorio: 'Laboratorio Agro Suelos', numero_informe: 'LAB-2026-018',
  fecha_informe: '2026-10-10', referencia_interpretacion: 'Informe LAB-2026-018, criterios para tomate',
  interpretacion_ph: 'Adecuado según el informe del laboratorio', nivel_mo: 'Adecuada', nivel_p: 'Bajo', nivel_k: 'Adecuado',
  otros_nutrientes: 'Magnesio bajo según el informe', salinidad: 'No evaluada', sodicidad: 'No evaluada', limitantes_fisicas: 'Drenaje deficiente',
};
export const resultExamples = { ph: '6.5', ec: '0.8', mo: '3.2', n_total: '0.15', n_nitrato: '25', n_amonio: '8', p: '18', k: '0.45', ca: '8.2', mg: '2.1', na: '0.12', al: '0.2', cic: '15', cic_efectiva: '12', sat_bases: '70', sat_al: '5', psi: '2' };
export const methodExamples = { ph: 'Agua 1:1', ec: 'Extracto de pasta saturada', mo: 'Walkley-Black', n_total: 'Kjeldahl', n_nitrato: 'Extracción con KCl', n_amonio: 'Extracción con KCl', p: 'Olsen', k: 'Acetato de amonio', ca: 'Acetato de amonio', mg: 'Acetato de amonio', na: 'Acetato de amonio', al: 'KCl 1 M', cic: 'Acetato de amonio a pH 7', cic_efectiva: 'Suma de cationes y acidez intercambiable', sat_bases: 'Suma de bases / CIC × 100', sat_al: 'Al / CIC efectiva × 100', psi: 'Na intercambiable / CIC × 100' };
export function allowedUnits(key) {
  if (key === 'ph') return ['Sin unidad'];
  if (key === 'ec') return ['dS/m', 'mS/cm', 'µS/cm'];
  if (['mo', 'n_total', 'sat_bases', 'sat_al', 'psi'].includes(key)) return ['%'];
  if (['n_nitrato', 'n_amonio', 'p'].includes(key)) return ['mg/kg', 'ppm'];
  if (['cic', 'cic_efectiva'].includes(key)) return ['cmol(+)/kg', 'meq/100g'];
  return ['cmol(+)/kg', 'meq/100g', 'mg/kg', 'ppm'];
}
export const isDecimalInput = value => /^\d*(?:[.,]\d*)?$/.test(value);
const isBlank = value => value == null || String(value).trim() === '';
const textError = value => /[<>\p{Cc}]/u.test(value.replace(/[\n\r\t]/g, '')) ? 'Escribe texto sin etiquetas HTML ni caracteres de control.' : '';
export function validateSoilForm(form) {
  const errors = {};
  for (const field of allFields) {
    const value = form[field.name];
    if (isBlank(value)) {
      if (field.required) errors[field.name] = 'Completa este campo.';
      continue;
    }
    if (field.options && !field.options.includes(value)) errors[field.name] = 'Selecciona una opción de la lista.';
    else if (field.type === 'number') {
      if (!/^\d+(?:\.\d+)?$/.test(String(value)) || !Number.isFinite(Number(value))) errors[field.name] = 'Escribe un número válido, sin letras ni símbolos.';
      else if (Number(value) < (field.min ?? 0) || (field.max != null && Number(value) > field.max)) errors[field.name] = `Usa un valor ${field.max != null ? `entre ${field.min ?? 0} y ${field.max}` : `mayor o igual que ${field.min ?? 0}`}.`;
      else if (field.step === 1 && !Number.isInteger(Number(value))) errors[field.name] = 'Usa un número entero, por ejemplo 15.';
    } else if (field.type === 'date') {
      const date = new Date(`${value}T00:00:00Z`);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) errors[field.name] = 'Selecciona una fecha válida.';
    } else {
      if (String(value).length > (field.maxLength || (field.multiline ? 2000 : 500))) errors[field.name] = 'El texto supera la longitud permitida.';
      else if (textError(value)) errors[field.name] = textError(value);
    }
  }
  for (const key of ['numero_muestra', 'numero_informe']) if (!isBlank(form[key]) && !/^[\p{L}\p{N}][\p{L}\p{N} ._/-]*$/u.test(form[key])) errors[key] = 'Usa letras, números, espacios, guiones, punto o barra. Ejemplo: M-001.';
  for (const key of ['productor_finca', 'responsable_muestreo', 'cultivo', 'laboratorio']) if (!isBlank(form[key]) && !/\p{L}/u.test(form[key])) errors[key] = 'Escribe un nombre que contenga letras.';
  if (!isBlank(form.geolocalizacion)) {
    const match = /^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/.exec(form.geolocalizacion);
    if (!match || Math.abs(Number(match[1])) > 90 || Math.abs(Number(match[2])) > 180) errors.geolocalizacion = 'Usa latitud (-90 a 90), longitud (-180 a 180). Ejemplo: -16.5520, -68.1650.';
  }
  if (!isBlank(form.profundidad_desde) && !isBlank(form.profundidad_hasta) && Number(form.profundidad_hasta) < Number(form.profundidad_desde)) errors.profundidad_hasta = 'Debe ser mayor o igual que la profundidad desde.';
  if (['arena', 'limo', 'arcilla'].every(key => !isBlank(form[key])) && Math.abs(Number(form.arena) + Number(form.limo) + Number(form.arcilla) - 100) > 0.5) errors.arcilla = 'Arena, limo y arcilla deben sumar 100 % (tolerancia de 0,5 por redondeo).';
  if (form.fecha_informe && form.fecha_muestreo && form.fecha_informe < form.fecha_muestreo) errors.fecha_informe = 'La fecha del informe no puede ser anterior al muestreo.';
  for (const [key] of allParameters) {
    const reading = form.resultados[key];
    const prefix = `resultados.${key}`;
    if (!allowedUnits(key).includes(reading.unidad)) errors[`${prefix}.unidad`] = 'Selecciona una unidad compatible con este parámetro.';
    if (!isBlank(reading.valor)) {
      const max = key === 'ph' ? 14 : reading.unidad === '%' ? 100 : null;
      if (!/^\d+(?:\.\d+)?$/.test(String(reading.valor)) || !Number.isFinite(Number(reading.valor))) errors[`${prefix}.valor`] = 'Escribe un número válido y no negativo.';
      else if (max != null && Number(reading.valor) > max) errors[`${prefix}.valor`] = `El valor debe estar entre 0 y ${max}.`;
      if (isBlank(reading.metodo)) errors[`${prefix}.metodo`] = 'Indica el método del informe para este resultado.';
    }
    if (reading.metodo.length > 500 || textError(reading.metodo)) errors[`${prefix}.metodo`] = 'Usa texto válido de hasta 500 caracteres.';
  }
  return errors;
}
