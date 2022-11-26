import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { showNotification } from '@mantine/notifications';
import { useNavigate } from 'react-router-dom';
import { getUser } from '../../apis/spotify.api';
import { SpotifyUser } from './types';
import { useSupabase } from '../supabase/client/client';
import { User, UserResponse } from '@supabase/supabase-js';

type AuthProviderProps = {
  children: ReactNode;
};

type AuthProviderContextValue = {
  user?: User;
  spotifyUser?: SpotifyUser;
  login: () => void;
  logout: () => void;
};

const spotifyScopes = [
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

const AuthContext = createContext<AuthProviderContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const supabaseClient = useSupabase();
  const [user, setUser] = useState<User>();
  const [spotifyUser, setSpotifyUser] = useState<SpotifyUser>();
  const navigate = useNavigate();

  useEffect(() => {
    supabaseClient.auth.getSession().then((session) => {
      console.log(session);
      if (session) {
        supabaseClient.auth.getUser().then((user: UserResponse) => {
          if (user.data.user) {
            setUser(user.data.user);
          }
        });
        if (session.data.session?.provider_token) {
          getUser(session.data.session?.provider_token).then((userResponse) => {
            setSpotifyUser(userResponse);
          });
        }
      }
    });
  }, [supabaseClient.auth]);

  const login = async () => {
    const { data, error } = await supabaseClient.auth.signInWithOAuth({
      provider: 'spotify',
      options: {
        scopes: spotifyScopes.join(' '),
        redirectTo: '/dashboard',
      },
    });

    if (error) {
      if (!data) {
        showNotification({
          title: 'Authentication Error',
          message: 'Unable to log you in. Try again.',
          color: 'danger',
        });
      }
      console.error(error);
    }

    return { error };
  };

  const logout = () => {
    supabaseClient.auth.signOut().then(() => {
      if (spotifyUser) setSpotifyUser(undefined);
      navigate('/');
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        spotifyUser,
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
