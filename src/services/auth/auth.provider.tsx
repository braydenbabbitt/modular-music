import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { showNotification } from '@mantine/notifications';
import { useNavigate } from 'react-router-dom';
import { createClient, Session, SupabaseClient, User } from '@supabase/supabase-js';
import { Database } from '../supabase/types/database.types';
import { Center, Loader } from '@mantine/core';
import { PageContainer } from '../../components/containers/page-container.component';

type AuthProviderProps = {
  children: ReactNode;
};

type AuthProviderContextValue = {
  login: () => void;
  logout: () => void;
  session: Session | null;
  user: User | null;
  supabaseClient: SupabaseClient<Database>;
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

// const SUPABASE_REFERENCE_ID = import.meta.env.VITE_SUPABASE_REFERENCE_ID;
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
// const LOGIN_REDIRECT_URI = import.meta.env.VITE_SPOTIFY_LOGIN_REDIRECT_URI;

const AuthContext = createContext<AuthProviderContextValue | undefined>(undefined);
const supabaseClient = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  const login = async () => {
    const { data, error } = await supabaseClient.auth.signInWithOAuth({
      provider: 'spotify',
      options: {
        scopes: spotifyScopes.join(' '),
        redirectTo: '/',
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
    setSession(null);
    setUser(null);
    await supabaseClient.auth.signOut();
    navigate('/');
  };

  useEffect(() => {
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        supabaseClient.auth.getUser().then(({ data: { user } }) => setUser(user));
      }
    });

    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((_event, newSession) => {
      supabaseClient.auth.getUser().then(({ data: { user } }) => setUser(user));
      setSession(newSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  const context = {
    login,
    logout,
    session,
    user,
    supabaseClient,
  };

  return (
    <AuthContext.Provider value={context}>
      {(supabaseClient && context && children) || (
        <PageContainer>
          <Center>
            <Loader />
          </Center>
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
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw Error('useSpotifyToken must be used within SessionContextProvider');
  }

  return context.session?.provider_token;
};
