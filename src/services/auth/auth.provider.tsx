import { useDestructableLocalStorage } from 'den-ui';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { exchangeToken, getUser, redirectToAuthPage, refreshToken } from '../../apis/spotify.api';
import { AUTH_DATA_KEY } from '../../utils/constants';
import { User } from './types';

type AuthProviderProps = {
  children: ReactNode;
};

type AuthData = {
  access_token: string;
  expires_at: number;
  refresh_token?: string;
};

type AuthProviderContextValue = {
  authData?: AuthData;
  user?: User;
  login: () => void;
  logout: () => void;
};

const AuthContext = createContext<AuthProviderContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [authData, setAuthData] = useDestructableLocalStorage<AuthData | undefined>(AUTH_DATA_KEY, undefined, true);
  const [user, setUser] = useState<User>();
  const location = useLocation();
  const [urlParams, setUrlParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.pathname === '/spotify-login') {
      if (urlParams.get('error')) {
        console.error('Spofity access denied');
      } else {
        const authCode = urlParams.get('code');
        if (authCode) {
          exchangeToken(authCode)?.then((tokenExchangeResult) => {
            setAuthData((prev) => {
              return {
                ...prev,
                ...tokenExchangeResult,
              };
            });
            getUser(tokenExchangeResult.access_token).then((user) => {
              if (user) {
                setUser(user);
              } else {
                console.error('No user returned from Spotify');
              }
            });
          });
        } else {
          console.error('No access code found');
        }
      }
      setUrlParams('', {
        replace: true,
      });
      navigate('/');
    }
  }, [location, navigate, setAuthData, setUrlParams, urlParams]);

  useEffect(() => {
    if (authData) {
      if (authData.expires_at > Date.now()) {
        if (!user) {
          getUser(authData.access_token).then((user) => {
            if (user) {
              setUser(user);
            } else {
              console.error('No user returned from Spotify');
            }
          });
        }
      } else {
        refreshToken()?.then((newTokenData) => {
          setAuthData((prev) => ({
            ...prev,
            ...newTokenData,
          }));
        });
      }
    }
  }, [authData, location, setAuthData, user]);

  const login = () => {
    if (authData?.access_token && !user) {
      getUser(authData.access_token).then((user) => {
        setUser(user);
      });
    } else {
      redirectToAuthPage();
    }
  };

  const logout = () => {
    if (authData) setAuthData();
    if (user) setUser(undefined);
    navigate('/');
  };

  return (
    <AuthContext.Provider
      value={{
        authData,
        user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const auth = useContext(AuthContext);

  if (auth === undefined) {
    throw Error('useAuth must be used within AuthProvider');
  }

  return { ...auth };
};
