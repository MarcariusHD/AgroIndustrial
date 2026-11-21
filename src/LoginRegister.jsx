import { useState } from 'react';
import { useAuth } from './useAuth';

const validateForm = (data, mode) => {
  const errors = {};

  // Validaciones de Correo (Tanto para Login como para Registro)
  if (!data.correo.trim()) {
    errors.correo = "El correo es obligatorio.";
  } else if (!data.correo.includes('@')) {
    errors.correo = "El correo debe incluir el carácter '@'.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.correo)) {
    errors.correo = "Formato de correo no válido (ej: usuario@gmail.com).";
  }

  // Validación de Contraseña (Básica para ambos)
  if (!data.password.trim()) {
    errors.password = "La contraseña es obligatoria.";
  }

  if (mode === 'register') {
    // Validaciones exclusivas de Registro
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    const vowelRegex = /[aeiouAEIOUáéíóúÁÉÍÓÚ]/;
    const consecutiveConsonantsRegex = /[^aeiouAEIOUáéíóúÁÉÍÓÚ\s\d]{5,}/;
    const repeatedCharsRegex = /(.)\1{2,}/;

    if (!data.nombres.trim()) {
      errors.nombres = "El nombre es obligatorio.";
    } else if (data.nombres.length > 30) {
      errors.nombres = "No puede superar los 30 caracteres.";
    } else if (/\d/.test(data.nombres)) {
      errors.nombres = "No se permiten números.";
    } else if (repeatedCharsRegex.test(data.nombres.toLowerCase())) {
      errors.nombres = "No se permiten tantas letras repetidas.";
    } else if (consecutiveConsonantsRegex.test(data.nombres)) {
      errors.nombres = "Nombre inválido (palabra irreconocible).";
    } else if (!nameRegex.test(data.nombres)) {
      errors.nombres = "Solo se permiten letras y espacios.";
    } else if (!vowelRegex.test(data.nombres)) {
      errors.nombres = "Nombre inválido (faltan vocales).";
    }

    if (!data.apellidos.trim()) {
      errors.apellidos = "El apellido es obligatorio.";
    } else if (data.apellidos.length > 35) {
      errors.apellidos = "No puede superar los 35 caracteres.";
    } else if (/\d/.test(data.apellidos)) {
      errors.apellidos = "No se permiten números.";
    } else if (repeatedCharsRegex.test(data.apellidos.toLowerCase())) {
      errors.apellidos = "No se permiten tantas letras repetidas.";
    } else if (consecutiveConsonantsRegex.test(data.apellidos)) {
      errors.apellidos = "Apellido inválido (palabra irreconocible).";
    } else if (!nameRegex.test(data.apellidos)) {
      errors.apellidos = "Solo se permiten letras y espacios.";
    } else if (!vowelRegex.test(data.apellidos)) {
      errors.apellidos = "Apellido inválido (faltan vocales).";
    }

    const celularRegex = /^[67]\d{6,7}$/;
    if (!data.celular.trim()) {
      errors.celular = "El celular es obligatorio.";
    } else if (!celularRegex.test(data.celular)) {
      errors.celular = "Debe tener entre 7 y 8 dígitos y empezar con 6 o 7.";
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{10,20}$/;
    if (data.password.trim() && !passwordRegex.test(data.password)) {
      errors.password = "Debe tener 10-20 caracteres, 1 mayúscula, 1 minúscula y 1 número.";
    }

    if (data.password !== data.confirmPassword) {
      errors.confirmPassword = "Las contraseñas no coinciden.";
    }
  }

  return errors;
};

const LoginRegister = ({ onAuthSuccess, initialMode = 'login' }) => {
  const { login, register, status, errors, isSubmitting, setErrors, setStatus, setIsSubmitting } = useAuth();
  const [modalMode, setModalMode] = useState(initialMode); // Ahora respeta la elección del usuario
  const [formData, setFormData] = useState({
    nombres: '', apellidos: '', correo: '', celular: '', password: '', confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ message: '', type: '' });
    setErrors({});

    const newErrors = validateForm(formData, modalMode);

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setStatus({ message: "Datos incorrectos. Por favor, revisa los motivos en cada campo resaltado.", type: "error" });
      return;
    }
    
    setIsSubmitting(true);
    try {
      let result;
      if (modalMode === 'login') {
        result = await login({ correo: formData.correo, password: formData.password });
      } else {
        const { confirmPassword, ...registrationData } = formData;
        result = await register(registrationData);
      }

      if (result.success) {
        if (modalMode === 'register') {
          // Si se registró con éxito, lo mandamos a login
          setStatus({ message: "¡Registro exitoso! Ahora puedes iniciar sesión.", type: "success" });
          setModalMode('login');
          return;
        }
        onAuthSuccess(result.role, result.userId);
      } else {
        setStatus({ message: result.error || "Error desconocido", type: "error" });
      }
    } catch (error) {
      console.error("Error en la autenticación:", error);
      setStatus({ message: error.detail || "No se pudo conectar con el servidor.", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">{modalMode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}</h2>
        
        {status.message && (
          <div className={`mb-4 p-3 rounded-md text-sm font-medium ${status.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {status.message}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          {modalMode === 'register' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-gray-600">Nombre(s)</label>
                  <input className={`px-3 py-2 border rounded-md outline-none transition-all ${errors.nombres ? 'border-red-500 focus:ring-2 focus:ring-red-200' : 'border-gray-300 focus:ring-2 focus:ring-green-500'}`} type="text" name="nombres" value={formData.nombres} onChange={handleChange} required placeholder="Juan" />
                  {errors.nombres && <span className="text-red-600 text-[10px] font-bold mt-1">{errors.nombres}</span>}
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-gray-600">Apellido(s)</label>
                  <input className={`px-3 py-2 border rounded-md outline-none transition-all ${errors.apellidos ? 'border-red-500 focus:ring-2 focus:ring-red-200' : 'border-gray-300 focus:ring-2 focus:ring-green-500'}`} type="text" name="apellidos" value={formData.apellidos} onChange={handleChange} required placeholder="Pérez" />
                  {errors.apellidos && <span className="text-red-600 text-[10px] font-bold mt-1">{errors.apellidos}</span>}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-600">Celular</label>
                <input className={`px-3 py-2 border rounded-md outline-none transition-all ${errors.celular ? 'border-red-500 focus:ring-2 focus:ring-red-200' : 'border-gray-300 focus:ring-2 focus:ring-green-500'}`} type="tel" name="celular" value={formData.celular} onChange={handleChange} required placeholder="3001234567" />
                {errors.celular && <span className="text-red-600 text-[10px] font-bold mt-1">{errors.celular}</span>}
              </div>
            </>
          )}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-600">{modalMode === 'login' ? 'Gmail' : 'Correo Electrónico'}</label>
            <input className={`px-3 py-2 border rounded-md outline-none transition-all ${errors.correo ? 'border-red-500 focus:ring-2 focus:ring-red-200' : 'border-gray-300 focus:ring-2 focus:ring-green-500'}`} type="email" name="correo" value={formData.correo} onChange={handleChange} required placeholder="usuario@gmail.com" />
            {errors.correo && <span className="text-red-600 text-[10px] font-bold mt-1">{errors.correo}</span>}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-600">Contraseña</label>
            <div className="relative">
              <input 
                className={`w-full px-3 py-2 border rounded-md outline-none transition-all ${errors.password ? 'border-red-500 focus:ring-2 focus:ring-red-200' : 'border-gray-300 focus:ring-2 focus:ring-green-500'}`}
                type={showPassword ? "text" : "password"} 
                name="password" 
                value={formData.password} 
                onChange={handleChange} 
                required 
              />
              <button 
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-green-700"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
                )}
              </button>
            </div>
            {errors.password && <span className="text-red-600 text-[10px] font-bold mt-1">{errors.password}</span>}
          </div>
          {modalMode === 'register' && (
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-600">Confirmar contraseña</label>
              <div className="relative">
                <input 
                  className={`w-full px-3 py-2 border rounded-md outline-none transition-all ${errors.confirmPassword ? 'border-red-500 focus:ring-2 focus:ring-red-200' : 'border-gray-300 focus:ring-2 focus:ring-[#207b25]'}`}
                  type={showConfirmPassword ? "text" : "password"} 
                  name="confirmPassword" 
                  value={formData.confirmPassword} 
                  onChange={handleChange} 
                  required 
                />
                <button 
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-green-700"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
                  )}
                </button>
              </div>
              {errors.confirmPassword && <span className="text-red-600 text-[10px] font-bold mt-1">{errors.confirmPassword}</span>}
            </div>
          )}
          <div className="flex flex-col gap-3 pt-4">
            <button type="submit" className="w-full py-3 bg-[#207b25] text-white rounded-lg font-bold hover:bg-[#031c06] transition-all disabled:opacity-50 shadow-lg" disabled={isSubmitting}>
              {isSubmitting ? 'Procesando...' : (modalMode === 'login' ? 'Iniciar Sesión' : 'Registrarse')}
            </button>
            
            <div className="text-center mt-2">
              {modalMode === 'login' ? (
                <p className="text-xs text-gray-500">
                  ¿No tienes una cuenta? {' '}
                  <button type="button" onClick={() => { setModalMode('register'); setErrors({}); }} className="text-[#207b25] font-bold hover:underline">
                    Regístrate aquí
                  </button>
                </p>
              ) : (
                <p className="text-xs text-gray-500">
                  ¿Ya tienes cuenta? {' '}
                  <button type="button" onClick={() => { setModalMode('login'); setErrors({}); }} className="text-[#207b25] font-bold hover:underline">
                    Inicia sesión
                  </button>
                </p>
              )}
            </div>

            <button type="button" className="w-full py-3 text-gray-500 font-medium hover:text-gray-700 transition-colors" onClick={() => onAuthSuccess(null, null)}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginRegister;