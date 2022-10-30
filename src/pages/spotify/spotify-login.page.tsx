import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { exchangeToken } from '../../apis/spotify.api';

export const SpotifyLoginPage = () => {
  const [urlParams, setUrlParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (urlParams.get('error')) {
      console.error('Spotify access denied');
    } else if (urlParams.get('code')) {
      const authCode = urlParams.get('code');
      if (authCode) {
        exchangeToken(authCode);
        navigate('/');
      } else {
        console.error('No access code found');
      }
    } else {
      setUrlParams('', {
        replace: true,
      });
      navigate('/');
    }
  }, [navigate, setUrlParams, urlParams]);

  return <h1>Spotify Login Page</h1>;
};
