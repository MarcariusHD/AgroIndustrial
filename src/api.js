const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export const fetchEsp32Latest = (id) => callApi(`/api/esp32/dispositivos/${id}/ultima`);
export const fetchGreenhouseReadings = (id) => callApi(`/api/esp32/invernaderos/${id}/lecturas`);
export const fetchEsp32History = (id) => callApi(`/api/esp32/dispositivos/${id}/historial?limite=20`);

const callApi = async (endpoint, method = 'GET', data = null) => {
  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  let result;
  try {
    const text = await response.text();
    result = text ? JSON.parse(text) : {};
  } catch (e) {
    result = { detail: "El servidor devolvió una respuesta inesperada o vacía." };
  }

  if (!response.ok) {
    throw result; // FastAPI devuelve errores en 'detail'
  }
  return result;
};

// --- Auth Endpoints ---
export const loginUser = (credentials) => callApi('/login', 'POST', credentials);
export const registerUser = (userData) => callApi('/registro', 'POST', userData);
export const fetchUsers = () => callApi('/usuario');

// --- Dashboard Endpoints ---
export const uploadGreenhousePhoto = async (idInv, file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`${API_BASE_URL}/api/invernaderos/${idInv || 'default'}/foto`, {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) throw await response.json();
  return await response.json();
};
export const fetchSensorData = (idInv = null) => callApi(`/dashboard/mediciones${idInv ? `?id_inv=${idInv}` : ''}`);
export const fetchDashboardDevices = (idInv = null) => callApi(`/dashboard/dispositivos${idInv ? `?id_inv=${idInv}` : ''}`);
export const fetchDashboardAlerts = (idInv = null) => callApi(`/dashboard/alertas${idInv ? `?id_inv=${idInv}` : ''}`);

// --- Greenhouse Endpoints ---
export const fetchGreenhouses = (userId = null) => {
  const query = userId ? `?id_usuario=${userId}` : '';
  return callApi(`/invernaderos${query}`);
};
export const createGreenhouse = (greenhouseData) => callApi('/invernaderos', 'POST', greenhouseData);
export const updateGreenhouse = (id, greenhouseData) => callApi(`/invernaderos/${id}`, 'PUT', greenhouseData);
export const deleteGreenhouse = (id) => callApi(`/invernaderos/${id}`, 'DELETE');

// --- Device Endpoints ---
export const createDevice = (deviceData) => callApi('/dispositivos', 'POST', deviceData);
export const updateDevice = (id, deviceData) => callApi(`/dispositivos/${id}`, 'PUT', deviceData);
export const deleteDevice = (id) => callApi(`/dispositivos/${id}`, 'DELETE');

// --- Validation Utility ---
export const validateForm = (data, mode) => {
  const errors = {};
  // ... (la lógica de validación se moverá aquí)
  return errors;
};
