import React, { createContext, useState, useEffect } from 'react';
import { loginUser, registerUser } from './api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('user');
  const [userId, setUserId] = useState(null);
  const [userNames, setUserNames] = useState('');
  const [status, setStatus] = useState({ message: '', type: '' });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const storedLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const storedUserRole = localStorage.getItem('userRole');
    const storedUserId = localStorage.getItem('userId');
    const storedUserNames = localStorage.getItem('userNames');
    if (storedLoggedIn && storedUserRole && storedUserId && storedUserNames) {
      setIsLoggedIn(storedLoggedIn);
      setUserRole(storedUserRole);
      setUserId(parseInt(storedUserId));
      setUserNames(storedUserNames);
    }
  }, []);

  const login = async (credentials) => {
    setIsSubmitting(true);
    try {
      const result = await loginUser(credentials);
      const normalizedRole = (result.rol || 'user').trim().toLowerCase();
      
      console.log("AuthContext: Login exitoso", { role: normalizedRole, id: result.id_usuario });

      setIsLoggedIn(true);
      setUserRole(normalizedRole);
      setUserId(result.id_usuario);
      const fullNames = `${result.nombres} ${result.apellidos}`;
      setUserNames(fullNames);

      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userRole', normalizedRole);
      localStorage.setItem('userId', String(result.id_usuario));
      localStorage.setItem('userNames', fullNames);
      setStatus({ message: "Sesión iniciada", type: "success" });
      return { success: true, role: result.rol, userId: result.id_usuario };
    } catch (err) {
      const errorMsg = Array.isArray(err.detail) ? err.detail.map(e => e.msg).join(", ") : (err.detail || "Error al iniciar sesión");
      return { success: false, error: errorMsg };
    } finally {
      setIsSubmitting(false);
    }
  };

  const register = async (userData) => {
    setIsSubmitting(true);
    try {
      await registerUser(userData);
      setStatus({ message: "Registro exitoso", type: "success" });
      return { success: true };
    } catch (err) {
      const errorMsg = Array.isArray(err.detail) ? err.detail.map(e => e.msg).join(", ") : (err.detail || "Error al registrar");
      return { success: false, error: errorMsg };
    } finally {
      setIsSubmitting(false);
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUserRole('user');
    setUserId(null);
    setUserNames('');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    localStorage.removeItem('userNames');
  };

  return (
    <AuthContext.Provider value={{ 
      isLoggedIn, userRole, userId, userNames, login, register, logout, 
      status, errors, isSubmitting, setErrors, setStatus, setIsSubmitting 
    }}>
      {children}
    </AuthContext.Provider>
  );
};