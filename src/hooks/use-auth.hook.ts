import { useState } from 'react';
import { redirectToAuthPage } from '../apis/spotify.api';
import { User } from '../services/auth/types';

type AuthData = {
  user?: User;
  token?: string;
};

export const useAuth = () => {
  // const tokenFromLocalStorage = localStorage.getItem('token');

  const [authData, setAuthData] = useState<AuthData>({});

  const login = () => {
    redirectToAuthPage();
  };

  const logout = () => {
    console.log('logout');
    setAuthData({});
  };

  return { authData, login, logout };
};
