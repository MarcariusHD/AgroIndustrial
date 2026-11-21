export const API_BASE_URL = 'http://localhost:8000';

export const evidenciasRaw = [
  { pest: 'Araña Roja', conf: '99%', time: '14:20', date: '2023-04-10', cam: 1, img: `${API_BASE_URL}/static/evidencias/spider_red.jpg`, status: 'Crítico', greenhouseName: 'Invernadero A' },
  { pest: 'Pulgón Verde', conf: '94%', time: '13:55', date: '2023-04-10', cam: 2, img: `${API_BASE_URL}/static/evidencias/pulgon.jpg`, status: 'Alerta', greenhouseName: 'Invernadero A' },
  { pest: 'Mosca Blanca', conf: '88%', time: '12:10', date: '2023-04-09', cam: 3, img: `${API_BASE_URL}/static/evidencias/mosca_blanca.jpg`, status: 'Analizado', greenhouseName: 'Invernadero B' },
  { pest: 'Trips', conf: '91%', time: '10:30', date: '2023-04-08', cam: 1, img: `${API_BASE_URL}/static/evidencias/trips.jpg`, status: 'Crítico', greenhouseName: 'Invernadero C' },
  { pest: 'Araña Roja', conf: '96%', time: '09:15', date: '2023-04-11', cam: 4, img: `${API_BASE_URL}/static/evidencias/spider_red.jpg`, status: 'Alerta', greenhouseName: 'Achocalla' }
];

export const resoluciones = {
  'Araña Roja': 'Nebulización focal con aceite de neem y aumento sistemático de la humedad relativa para interrumpir el ciclo reproductivo.',
  'Pulgón Verde': 'Aplicación dirigida de jabón potásico al 2% y eliminación mecánica de hormigas asociadas que protegen la plaga.',
  'Mosca Blanca': 'Instalación masiva de trampas cromáticas amarillas y liberación de depredadores biológicos como Encarsia formosa.',
  'Trips': 'Colocación de mallas antitrips de alta densidad y uso de extractos de canela o piretrinas naturales en horas de baja luminosidad.'
};

export const pestImages = {
  'Araña Roja': `${API_BASE_URL}/static/evidencias/spider_red.jpg`,
  'Pulgón Verde': `${API_BASE_URL}/static/evidencias/pulgon.jpg`,
  'Mosca Blanca': `${API_BASE_URL}/static/evidencias/mosca_blanca.jpg`,
  'Trips': `${API_BASE_URL}/static/evidencias/trips.jpg`,
};

export const pestInfo = {
  'Araña Roja': {
    causas: 'Se origina principalmente por ambientes con baja humedad relativa e incremento excesivo de temperaturas (superiores a 27°C). Prolifera rápidamente en periodos de sequía.',
    sintomas: 'Micro-puntuaciones cloróticas en el haz, telarañas finas en el envés y debilitamiento del vigor fotosintético.',
    solucion: 'Nebulización focal con aceite de neem al 1% y aumento sistemático de la humedad relativa para interrumpir el ciclo reproductivo.',
    prevencion: 'Mantener niveles de humedad estables, evitar el exceso de nitrógeno y realizar inspecciones periódicas en el envés de las hojas.'
  },
  'Pulgón Verde': {
    causas: 'Aparece debido al exceso de abonado nitrogenado y temperaturas templadas constantes. La presencia de hormigas también favorece su estancia al protegerlos de depredadores.',
    sintomas: 'Deformación de ápices y brotes jóvenes, presencia de melaza pegajosa y riesgo de transmisión de virus vegetales.',
    solucion: 'Aplicación dirigida de jabón potásico al 2% y eliminación mecánica de colonias en focos iniciales.',
    prevencion: 'Fomentar la biodiversidad para atraer depredadores naturales (mariquitas) y controlar el riego para evitar estrés hídrico.'
  },
  'Mosca Blanca': {
    causas: 'Causada por la falta de ventilación adecuada y temperaturas cálidas constantes. Las plantas se vuelven vulnerables si están debilitadas o bajo estrés lumínico.',
    sintomas: 'Nubes de insectos al agitar la planta y aparición de hongo negrilla (Fumagina) sobre las secreciones de melaza.',
    solucion: 'Instalación masiva de trampas cromáticas amarillas y liberación de depredadores biológicos como Encarsia formosa.',
    prevencion: 'Uso de mallas anti-insectos en ventanas cenitales, limpieza de malezas perimetrales y podas de aireación constantes.'
  },
  'Trips': {
    causas: 'Se produce por entradas de aire sin filtrar y niveles bajos de humedad en el entorno. Los sustratos descuidados permiten que sus ciclos de vida se completen velozmente.',
    sintomas: 'Manchas plateadas necróticas con pequeños puntos negros (excrementos) y deformación severa de flores y frutos.',
    solucion: 'Colocación de mallas antitrips de alta densidad y uso de extractos de canela o piretrinas naturales en horas de baja luminosidad.',
    prevencion: 'Desinfección de herramientas, control de accesos al invernadero y mantenimiento de una capa de mantillo limpia.'
  }
};