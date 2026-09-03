import React, { createContext, useState, useContext } from 'react';
import { api, setAuthToken } from '../services/api';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  const registerUser = async ({ name, nickname, email, password }) => {
    try {
      const response = await api.post('/auth/register', {
        name,
        nickname,
        email,
        password,
      });

      const { user: loggedUser, token: authToken } = response.data;
      setUser(loggedUser);
      setToken(authToken);
      setAuthToken(authToken);
      return { success: true };
    } catch (error) {
      const serverMessage = error.response?.data?.error;
      const statusText = error.response?.status ? ` (Status ${error.response.status})` : '';
      const fallbackMessage = error.message || 'Erro ao conectar ao servidor.';
      return {
        success: false,
        error: (serverMessage || fallbackMessage) + statusText,
      };
    }
  };

  const loginUser = async ({ email, password }, onStoreLoaded) => {
    try {
      const response = await api.post('/auth/login', {
        email,
        password,
      });

      const {
        user: loggedUser,
        token: authToken,
        store,
        role,
        membershipStatus,
      } = response.data;

      setUser(loggedUser);
      setToken(authToken);
      setAuthToken(authToken);

      // Repassa a loja encontrada no login para o StoreContext se o callback for fornecido
      if (typeof onStoreLoaded === 'function') {
        onStoreLoaded({ store, role, membershipStatus });
      }

      return {
        success: true,
        store,
        role,
        membershipStatus,
      };
    } catch (error) {
      const serverMessage = error.response?.data?.error;
      const statusText = error.response?.status ? ` (Status ${error.response.status})` : '';
      const fallbackMessage = error.message || 'Credenciais inválidas.';
      return {
        success: false,
        error: (serverMessage || fallbackMessage) + statusText,
      };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setAuthToken(null);
  };

  const deleteAccount = async () => {
    try {
      await api.delete('/auth/me');
      logout();
      return { success: true };
    } catch (error) {
      const serverMessage = error.response?.data?.error;
      const statusText = error.response?.status ? ` (Status ${error.response.status})` : '';
      const fallbackMessage = error.message || 'Erro ao excluir conta.';
      return {
        success: false,
        error: (serverMessage || fallbackMessage) + statusText,
      };
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, registerUser, loginUser, logout, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

export default AuthProvider;