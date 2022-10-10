import React from 'react';
import { useLocalStorage } from './useLocalStorage';
import { createContext, ReactNode, useContext } from 'react';

const clientId: string = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
// const clientSecret: string = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;
const redirectUri: string = import.meta.env.VITE_REDIRECT_URI;
const authEndpoint = 'https://accounts.spotify.com/authorize';
const AUTH_DATA_KEY = 'authData';
const scopes = [
  'ugc-image-upload',
  'user-read-recently-played',
  'user-top-read',
  'playlist-read-collaborative',
  'playlist-modify-public',
  'playlist-read-private',
  'playlist-modify-private',
  'user-read-email',
  'user-library-modify',
  'user-library-read',
];

export type User = {
  country: string;
  display_name: string;
  email: string;
  explicit_content: {
    filterEnabled: boolean;
    filterLocked: boolean;
  };
  external_urls: {
    spotify: string;
  };
  followers: {
    href: string;
    total: number;
  };
  href: string;
  id: string;
  images: [
    {
      url: string;
      height: string;
      width: string;
    },
  ];
  product: string;
  type: string;
  uri: string;
};
export type AuthData = {
  user?: User;
  token?: string;
};
interface AuthProviderProps {
  children?: ReactNode;
}

const AuthContext = createContext<AuthData | undefined>(undefined);
const UpdateAuthContext = createContext<React.Dispatch<React.SetStateAction<AuthData>> | undefined>(undefined);

export const useAuth = (): [AuthData, React.Dispatch<React.SetStateAction<AuthData>>] => {
  const authContext = useContext(AuthContext);
  const useAuthContext = useContext(UpdateAuthContext);
  if (authContext && useAuthContext) {
    return [authContext, useAuthContext];
  } else {
    throw new Error('useAuth must be used within AuthProvider');
  }
};

export const useUser = () => {
  return useContext(AuthContext)?.user;
};

export const AuthProvider = ({ children, ...props }: AuthProviderProps) => {
  const [authData, setAuthData] = useLocalStorage<AuthData>(AUTH_DATA_KEY, {});

  return (
    <AuthContext.Provider value={authData}>
      <UpdateAuthContext.Provider value={setAuthData}>{children}</UpdateAuthContext.Provider>
    </AuthContext.Provider>
  );
};

export const getAuthLink = (): string => {
  return `${authEndpoint}?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes.join(
    '%20',
  )}&response_type=token`;
};
