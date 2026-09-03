import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const registerUser = ({ name, nickname, email, password }) => {
    const newUser = {
      id: nickname.startsWith('@') ? nickname : `@${nickname}`,
      nickname: nickname.replace('@', ''),
      name,
      email,
      role: 'Gerente / Proprietário',
    };
    setUser(newUser);
    return true;
  };

  const loginUser = ({ email, password }) => {
    const loggedUser = {
      id: `@${email.split('@')[0]}`,
      nickname: email.split('@')[0],
      name: email.split('@')[0].toUpperCase(),
      email,
      role: 'Gerente',
    };
    setUser(loggedUser);
    return true;
  };

  const logout = () => setUser(null);
  const deleteAccount = () => {
    setUser(null);
    return true;
  };

  return (
    <AuthContext.Provider value={{ user, registerUser, loginUser, logout, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);