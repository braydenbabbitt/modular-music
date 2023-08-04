import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { showNotification } from '@mantine/notifications';
import { useNavigate } from 'react-router-dom';
import { createClient, Session, SupabaseClient, User } from '@supabase/supabase-js';
import { Database } from '../supabase/types/database';
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

type AddProviderMetadataRequest = {
  session: Session;
  user?: User;
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

  const addProviderMetadata = async ({ user, session }: AddProviderMetadataRequest) => {
    if (user && session.provider_token && session.provider_refresh_token) {
      await supabaseClient.from('user_oauth_tokens').upsert(
        {
          user_id: user?.id,
          provider: 'spotify',
          provider_token: session.provider_token,
          provider_refresh_token: session.provider_refresh_token,
          provider_token_expires_at: new Date().getTime(),
        },
        {
          onConflict: 'user_id',
        },
      );
    }
  };

  useEffect(() => {
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        supabaseClient.auth.getUser().then(async ({ data: { user } }) => {
          setUser(user);
          await addProviderMetadata({
            user: user ?? undefined,
            session: session,
          });
        });
      }
    });

    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((_event, newSession) => {
      const shouldUpdateUserAndMetadata = !session && !!newSession;
      setSession(newSession);
      if (shouldUpdateUserAndMetadata) {
        supabaseClient.auth.getUser().then(({ data: { user } }) => {
          setUser(user);
          addProviderMetadata({
            user: user ?? undefined,
            session: newSession,
          });
        });
      } else if (!newSession) {
        setUser(null);
      }
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
