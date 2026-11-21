const text = (name, label, extra = {}) => ({ name, label, ...extra });
const number = (name, label, max) => text(name, label, { type: 'number', min: 0, max });
const select = (name, label, options) => text(name, label, { options });

export const identificationFields = [
  text('numero_muestra', 'Número de muestra', { required: true, maxLength: 50 }),
  text('productor_finca', 'Productor / Finca'), text('lote_sector', 'Lote / Sector', { required: true, maxLength: 100 }),
  text('ubicacion', 'Ubicación'), text('geolocalizacion', 'Coordenadas (latitud, longitud)', { maxLength: 100 }),
  number('superficie_ha', 'Superficie representada (ha)'),
  text('fecha_muestreo', 'Fecha de muestreo', { type: 'date', required: true }),
  text('responsable_muestreo', 'Responsable del muestreo'),
  number('profundidad_desde', 'Profundidad desde (cm)'), number('profundidad_hasta', 'Profundidad hasta (cm)'),
  select('tipo_muestra', 'Tipo de muestra', ['Simple', 'Compuesta']),
  { ...number('numero_submuestras', 'Número de submuestras'), min: 1, step: 1 },
  text('cultivo', 'Cultivo actual', { required: true, maxLength: 100 }),
  select('sistema_produccion', 'Sistema de producción', ['Secano', 'Riego']),
  text('aplicaciones_recientes', 'Fertilizantes o enmiendas recientes (producto, dosis y fecha)', { multiline: true }),
];
export const physicalFields = [
  text('textura', 'Textura del suelo', { maxLength: 50 }),
  select('determinacion_textura', 'Determinación de textura', ['Laboratorio', 'Estimación en campo']),
  number('arena', 'Arena (%)', 100), number('limo', 'Limo (%)', 100), number('arcilla', 'Arcilla (%)', 100),
  select('humedad_campo', 'Humedad al muestrear', ['Seco', 'Húmedo', 'Saturado']),
  select('drenaje', 'Drenaje observado', ['Bueno', 'Moderado', 'Deficiente']),
  select('compactacion', 'Indicios de compactación', ['Sí', 'No', 'No evaluado']),
  select('erosion', 'Indicios de erosión', ['Sí', 'No', 'No evaluado']),
  text('observaciones_campo', 'Observaciones de campo', { multiline: true }),
];
export const labFields = [text('laboratorio', 'Laboratorio'), text('numero_informe', 'N.º de informe'), text('fecha_informe', 'Fecha del informe', { type: 'date' })];
export const laboratoryParameters = [
  ['ph', 'pH', 'Sin unidad', 14], ['ec', 'Conductividad eléctrica (CE)', 'dS/m'],
  ['mo', 'Materia orgánica', '%', 100], ['n_total', 'Nitrógeno total (si se analiza)', '%', 100],
  ['n_nitrato', 'Nitrógeno como nitrato (N–NO₃)', 'mg/kg'],
  ['n_amonio', 'Nitrógeno como amonio (N–NH₄, si se analiza)', 'mg/kg'],
  ['p', 'Fósforo extraíble', 'mg/kg'], ['k', 'Potasio intercambiable (K)', 'cmol(+)/kg'],
  ['ca', 'Calcio intercambiable (Ca)', 'cmol(+)/kg'], ['mg', 'Magnesio intercambiable (Mg)', 'cmol(+)/kg'],
  ['na', 'Sodio intercambiable (Na)', 'cmol(+)/kg'], ['al', 'Aluminio intercambiable (si corresponde)', 'cmol(+)/kg'],
];
export const exchangeParameters = [
  ['cic', 'Capacidad de intercambio catiónico (CIC)', 'cmol(+)/kg'],
  ['cic_efectiva', 'CIC efectiva (si se determina)', 'cmol(+)/kg'],
  ['sat_bases', 'Saturación de bases', '%', 100], ['sat_al', 'Saturación de aluminio', '%', 100],
  ['psi', 'Porcentaje de sodio intercambiable (PSI)', '%', 100],
];
export const interpretationFields = [
  text('referencia_interpretacion', 'Referencia utilizada para interpretar los resultados'),
  text('interpretacion_ph', 'pH para el cultivo actual'),
  select('nivel_mo', 'Materia orgánica', ['Baja', 'Adecuada', 'Alta', 'Sin interpretar']),
  select('nivel_p', 'Fósforo', ['Bajo', 'Adecuado', 'Alto', 'Sin interpretar']),
  select('nivel_k', 'Potasio', ['Bajo', 'Adecuado', 'Alto', 'Sin interpretar']),
  text('otros_nutrientes', 'Otros nutrientes'), text('salinidad', 'Salinidad (o No evaluada)'),
  text('sodicidad', 'Sodicidad (o No evaluada)'), text('limitantes_fisicas', 'Limitantes físicas'),
];
export const allFields = [...identificationFields, ...physicalFields, ...labFields, ...interpretationFields];
export const allParameters = [...laboratoryParameters, ...exchangeParameters];
export function emptySoilForm() {
  return { ...Object.fromEntries(allFields.map(f => [f.name, ''])), resultados: Object.fromEntries(allParameters.map(([key, , unidad]) => [key, { valor: '', unidad, metodo: '' }])) };
}
export function loadSoilForm(record) {
  const form = emptySoilForm();
  if (!record) return form;
  if (record.formulario) {
    for (const field of allFields) form[field.name] = record.formulario[field.name] ?? '';
    for (const [key] of allParameters) {
      const saved = record.formulario.resultados?.[key];
      if (saved) form.resultados[key] = { valor: saved.valor ?? '', unidad: saved.unidad ?? form.resultados[key].unidad, metodo: saved.metodo ?? '' };
    }
    return form;
  }
  form.numero_muestra = record.id_muestra ?? '';
  for (const key of ['fecha_muestreo', 'lote_sector', 'geolocalizacion', 'cultivo', 'textura']) form[key] = record[key] ?? '';
  const depth = record.profundidad?.match(/^\s*(\d+(?:\.\d+)?)\s*[-–]\s*(\d+(?:\.\d+)?)\s*(?:cm)?\s*$/i);
  if (depth) [form.profundidad_desde, form.profundidad_hasta] = depth.slice(1);
  for (const [key] of allParameters) if (record[key] != null) form.resultados[key].valor = record[key];
  // El antiguo N en ppm no identifica su forma: no convertirlo a N total (%).
  return form;
}
export function soilPayload(form) {
  const result = { ...form, resultados: {} };
  for (const field of allFields) {
    const value = form[field.name];
    result[field.name] = value === '' ? null : field.type === 'number' ? Number(value) : value;
  }
  for (const [key] of allParameters) {
    const reading = form.resultados[key];
    result.resultados[key] = { ...reading, valor: reading.valor === '' ? null : Number(reading.valor) };
  }
  return { formulario: result };
}
