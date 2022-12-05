import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { showNotification } from '@mantine/notifications';
import { useNavigate } from 'react-router-dom';
import { useSupabase } from '../supabase/client/client';
import { Session, User, UserMetadata, UserResponse } from '@supabase/supabase-js';
import { Loader } from '@mantine/core';
import { PageContainer } from '../../components/containers/page-container.component';

type AuthProviderProps = {
  children: ReactNode;
};

type AuthProviderContextValue = {
  user?: User;
  session?: Session;
  spotifyUser?: UserMetadata;
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
  const [session, setSession] = useState<Session>();
  const [spotifyUser, setSpotifyUser] = useState<UserMetadata>();
  const navigate = useNavigate();
  const [attemptedLogin, setAttemptedLogin] = useState(false);

  useEffect(() => {
    supabaseClient.auth.getSession().then((session) => {
      if (session.data.session) {
        setSession(session.data.session);
        supabaseClient.auth.getUser().then((user: UserResponse) => {
          if (user.data.user) {
            setUser(user.data.user);
          }
        });
        if (session.data.session.provider_token) {
          const userMetadata = session.data.session.user.user_metadata;
          setSpotifyUser(userMetadata);
        } else {
          supabaseClient.auth.signInWithOAuth({
            provider: 'spotify',
            options: {
              scopes: spotifyScopes.join(' '),
              redirectTo: '/dashboard',
            },
          });
        }
        setAttemptedLogin(true);
      } else {
        setAttemptedLogin(true);
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
      if (user) setUser(undefined);
      if (spotifyUser) setSpotifyUser(undefined);
      if (session) setSession(undefined);
      navigate('/');
    });
  };

  console.log({ attemptedLogin });

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        spotifyUser,
        login,
        logout,
      }}
    >
      {(attemptedLogin && children) || (
        <PageContainer>
          <Loader />
        </PageContainer>
      )}
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

export const useSpotifyToken = () => {
  const auth = useContext(AuthContext);

  if (auth === undefined) {
    throw Error('useSpotifyToken must be used within AuthProvider');
  }

  return auth.session?.provider_token;
};
