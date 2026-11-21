import { useState, useEffect, useCallback } from 'react';
import { fetchUsers } from './api';

export const useUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState(null);
  const [userStatuses, setUserStatuses] = useState(() => {
    return JSON.parse(localStorage.getItem('userStatuses')) || {};
  });

  const getUsers = useCallback(async () => {
    setLoadingUsers(true);
    setUsersError(null);
    try {
      const data = await fetchUsers();
      if (Array.isArray(data)) setUsers(data);
    } catch (err) {
      setUsersError(err.detail || "Error al cargar usuarios.");
      console.error("Error al obtener usuarios:", err);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  return { users, loadingUsers, usersError, getUsers, userStatuses, setUserStatuses };
};