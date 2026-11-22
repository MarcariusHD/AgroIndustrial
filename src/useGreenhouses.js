import { useState, useEffect, useCallback } from 'react';

const API_BASE_URL = 'http://127.0.0.1:8000';

export const useGreenhouses = (userId) => {
  const [greenhouses, setGreenhouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getGreenhouses = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/invernaderos`);
      if (!response.ok) throw new Error('Error al conectar con la base de datos');
      const data = await response.json();
      setGreenhouses(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getGreenhouses();
  }, [getGreenhouses]);

  return { greenhouses, loading, error, getGreenhouses };
};