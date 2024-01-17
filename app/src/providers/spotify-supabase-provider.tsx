import { Database, GetSpotifyTokenResponse } from '@libs/supabase';
import { showNotification } from '@mantine/notifications';
import { useNavigate } from '@root/router';
import { SpotifyApi } from '@spotify/web-api-ts-sdk';
import { SupabaseClient, createClient, Session, OAuthResponse, User } from '@supabase/supabase-js';
import { ReactNode, createContext, useEffect, useState, useContext } from 'react';
import { useLocation } from 'react-router-dom';

const SPOTIFY_SCOPES = [
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
] as const;

type SpotifySupabaseProviderProps = {
  children: ReactNode;
};

type SupabaseContext = {
  supabaseClient: SupabaseClient<Database>;
  session?: Session;
  user?: User;
  login: () => Promise<OAuthResponse>;
  logout: () => Promise<void>;
  isLoggedIn: boolean;
};

type SpotifyContext = {
  spotifyClient?: SpotifyApi;
};

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const SPOTIFY_CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const SupabaseContext = createContext<SupabaseContext | null>(null);
const SpotifyContext = createContext<SpotifyContext | null>(null);
const supabaseClient = createClient<Database>(SUPABASE_URL, SUPABASE_KEY);

export const SpotifySupabaseProvider = ({ children }: SpotifySupabaseProviderProps) => {
  const navigate = useNavigate();
  const { pathname, hash } = useLocation();
  const [supabaseSession, setSupabaseSession] = useState<Session>();
  const [spotifyClient, setSpotifyClient] = useState<SpotifyApi>();
  const [currentRefreshTimeout, setCurrentRefreshTimeout] = useState<NodeJS.Timeout>();
  const baseUrl = window.location.origin;
  const user = supabaseSession?.user;
  const isLoggedIn = !!supabaseSession && !!supabaseSession.user;

  const login = async () => {
    const res = await supabaseClient.auth.signInWithOAuth({
      provider: 'spotify',
      options: {
        scopes: SPOTIFY_SCOPES.join(' '),
        redirectTo: `${baseUrl}/login`,
      },
    });

    if (res.error || !res.data) {
      showNotification({
        title: 'Authentication Error',
        message: 'Unable to log you in. Try again.',
        color: 'danger',
      });
      console.error(res.error ?? 'No data returned from oauth login');
    } else {
      createSpotifyClient();
    }

    return res;
  };

  const logout = async () => {
    await supabaseClient.auth.signOut();
    setSupabaseSession(undefined);
    setSpotifyClient(undefined);
    handleClearTimeout();
    navigate('/');
  };

  const createSpotifyClient = async () => {
    const sessionQuery = await supabaseClient.auth.getSession();
    setSupabaseSession(sessionQuery.data.session ?? undefined);
    const user = sessionQuery.data.session?.user;

    if (!user) return;

    const { data } = await supabaseClient.from('user_oauth_tokens').select().eq('user_id', user.id).maybeSingle();
    if (!data) return;

    const { provider_token, provider_refresh_token, provider_token_expires_at } = data;
    const spotifyClient = SpotifyApi.withAccessToken(
      SPOTIFY_CLIENT_ID,
      {
        token_type: 'Bearer',
        access_token: provider_token,
        refresh_token: provider_refresh_token,
        expires_in: provider_token_expires_at - new Date().getTime(),
      },
      {
        afterRequest: (_url, _options, response) => {
          if (response.status === 401) {
            setupTokenRefresh({ spotifyClient, userId: user.id, expirationTime: 0 });
          }
        },
      },
    );
    setSpotifyClient(spotifyClient);
    setupTokenRefresh({
      spotifyClient,
      userId: user.id,
      expirationTime: provider_token_expires_at,
    });
  };

  const handleClearTimeout = () => {
    if (!currentRefreshTimeout) return;

    clearTimeout(currentRefreshTimeout);
    setCurrentRefreshTimeout(undefined);
  };

  const refreshSpotifyToken = async ({ spotifyClient, userId }: { spotifyClient: SpotifyApi; userId: string }) => {
    const functionResponse = await supabaseClient.functions.invoke<GetSpotifyTokenResponse>('get-spotify-token', {
      body: {
        userId,
      },
    });
    if (functionResponse.error || !functionResponse.data) throw new Error('Error executing get-spotify-token function');

    const currentTokenData = await spotifyClient.getAccessToken();
    if (currentTokenData)
      setSpotifyClient(
        SpotifyApi.withAccessToken(SPOTIFY_CLIENT_ID, {
          ...currentTokenData,
          access_token: functionResponse.data.token,
          expires_in: functionResponse.data.expiresAt - new Date().getTime(),
        }),
      );
  };

  const setupTokenRefresh = ({
    spotifyClient,
    userId,
    expirationTime,
  }: {
    spotifyClient: SpotifyApi;
    userId: string;
    expirationTime: number;
  }) => {
    handleClearTimeout();

    const timeUntilRefresh = expirationTime - new Date().getTime();
    if (expirationTime) {
      const timeout = setTimeout(async () => {
        refreshSpotifyToken({ spotifyClient, userId });
      }, timeUntilRefresh);
      setCurrentRefreshTimeout(timeout);
    } else {
      refreshSpotifyToken({ spotifyClient, userId });
    }
  };

  useEffect(() => {
    if (supabaseClient) createSpotifyClient();
  }, [supabaseClient]);

  useEffect(() => {
    if (pathname !== '/' || hash !== '' || !isLoggedIn) return;
    navigate('/dashboard', { replace: true });
  }, [isLoggedIn]);

  return (
    <SupabaseContext.Provider
      value={{
        supabaseClient,
        session: supabaseSession,
        user,
        logout,
        login,
        isLoggedIn,
      }}
    >
      <SpotifyContext.Provider value={{ spotifyClient }}>{children}</SpotifyContext.Provider>
    </SupabaseContext.Provider>
  );
};

export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (!context) throw new Error('useSupabase must be used within a SupabaseProvider');

  return context;
};

export const useSpotify = () => {
  const context = useContext(SpotifyContext);
  if (!context) throw new Error('useSpotify must be used within a SpotifyProvider');

  return context;
};
