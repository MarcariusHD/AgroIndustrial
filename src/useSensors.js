import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchSensorData } from './api';

export const useSensors = (idInv = null) => {
  const [sensorData, setSensorData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const requestId = useRef(0);

  const getSensors = useCallback(async () => {
    const current = ++requestId.current;
    setLoading(true);
    setError(null);
    setSensorData([]);
    try {
      const data = await fetchSensorData(idInv);
      if (!Array.isArray(data)) throw new Error('Respuesta de sensores inválida');
      if (current === requestId.current) setSensorData(data);
    } catch (error) {
      if (current === requestId.current) setError(error);
    } finally {
      if (current === requestId.current) setLoading(false);
    }
  }, [idInv]);

  useEffect(() => {
    getSensors();
    return () => { requestId.current += 1; };
  }, [getSensors]);

  return { sensorData, getSensors, loading, error };
};
