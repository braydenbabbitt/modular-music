import { createContext, ReactNode, useContext, useEffect } from 'react';
import { showNotification } from '@mantine/notifications';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { SessionContextProvider, useSession } from '@supabase/auth-helpers-react';
import { Database } from '../supabase/types/database.types';
import { Center, Loader } from '@mantine/core';
import { PageContainer } from '../../components/containers/page-container.component';

type AuthProviderProps = {
  children: ReactNode;
};

type AuthProviderContextValue = {
  login: () => void;
  logout: () => void;
};

export type SpotifyTokenData = {
  getSpotifyToken: () => string;
  expires_at: number;
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

const SUPABASE_REFERENCE_ID = import.meta.env.VITE_SUPABASE_REFERENCE_ID;
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const AuthContext = createContext<AuthProviderContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const supabaseClient = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
  const navigate = useNavigate();

  supabaseClient.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
      location.replace('/');
    }

    if (event === 'SIGNED_IN' && location.pathname === '/') {
      navigate('/spotify-login');
    }
  });

  const login = async () => {
    const { data, error } = await supabaseClient.auth.signInWithOAuth({
      provider: 'spotify',
      options: {
        scopes: spotifyScopes.join(' '),
        redirectTo: `${location.origin}/spotify-login`,
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

  const logout = async () => {
    await supabaseClient.auth.signOut();
  };

  useEffect(() => {
    if (location.pathname !== '/' || localStorage.getItem(`sb-${SUPABASE_REFERENCE_ID}-auth-token`)) {
      supabaseClient.auth.getSession().then(async (session) => {
        if (!session.data.session?.provider_token) {
          await supabaseClient.auth.signInWithOAuth({
            provider: 'spotify',
            options: {
              scopes: spotifyScopes.join(' '),
              redirectTo: `${location.origin}/spotify-login`,
            },
          });
        }
      });
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        login,
        logout,
      }}
    >
      <SessionContextProvider supabaseClient={supabaseClient}>
        {(supabaseClient && children) || (
          <PageContainer>
            <Center>
              <Loader />
            </Center>
          </PageContainer>
        )}
      </SessionContextProvider>
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
  const session = useSession();

  if (session === undefined) {
    throw Error('useSpotifyToken must be used within SessionContextProvider');
  }

  return session?.provider_token;
};
