import { Loader } from '@mantine/core';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../services/auth/auth.provider';

export const SpotifyLoginPage = () => {
  const { supabaseClient } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const res = supabaseClient.auth.getSession();

    res.then((session) => {
      const validSession = session.data.session;

      if (!validSession) {
        localStorage.setItem('login-6', JSON.stringify(session));
        navigate('/', { replace: false });
        return;
      }

      if (validSession.provider_token && validSession.provider_refresh_token && validSession.expires_at) {
        supabaseClient
          .from('user_oauth_tokens')
          .upsert(
            {
              user_id: validSession.user.id,
              provider_token: validSession.provider_token,
              provider_refresh_token: validSession.provider_refresh_token,
              provider_token_expires_at: validSession.expires_at,
            },
            { onConflict: 'user_id' },
          )
          .then(() => {
            localStorage.setItem('login-7', 'true');
            navigate('/dashboard', { replace: false });
          });
      }
    });
  }, []);

  return <Loader />;
};
