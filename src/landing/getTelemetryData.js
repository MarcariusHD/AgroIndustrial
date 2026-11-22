const getTelemetryData = (metric, cropName) => {
  const isTomato = cropName?.toLowerCase().includes('tomate');
  const isLettuce = cropName?.toLowerCase().includes('lechuga');
  
  const baseTemp = isTomato ? 28 : (isLettuce ? 19 : 24);
  const baseHum = isTomato ? 65 : (isLettuce ? 82 : 60);
  const basePh = 6.4;

  const times = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'];
  return times.map((t, idx) => {
    let val;
    if (metric === 'humedad') {
      val = baseHum + Math.sin(idx * 0.8) * 4 + (idx % 2 === 0 ? 1 : -1) * 0.5;
    } else if (metric === 'temp') {
      val = baseTemp + Math.sin(idx * 0.6) * 3 + (idx % 2 === 0 ? 0.8 : -0.8) * 0.3;
    } else {
      val = basePh + Math.cos(idx * 0.5) * 0.2 + (idx % 2 === 0 ? 0.05 : -0.05) * 0.02;
    }
    return { time: t, valor: parseFloat(val.toFixed(1)) };
  });
};

export default getTelemetryData;
