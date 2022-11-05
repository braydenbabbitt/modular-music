import { SpotifyApiRefreshTokenRequest, SpotifyApiRefreshTokenResponse } from './../services/auth/types';
import { reduceUrlParams } from './../utils/reduce-url-params';
import { generateRandomString } from '../utils/generate-random-string';
import { generateCodeChallenge } from '../utils/generate-code-challenge';
import axios, { AxiosResponse } from 'axios';
import { SpotifyApiTokenRequest, SpotifyApiTokenResponse, User } from '../services/auth/types';

const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = import.meta.env.VITE_SPOTIFY_LOGIN_REDIRECT_URI;
const codeVerifierKey = 'code_verifier';

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

export const redirectToAuthPage = () => {
  const codeVerifier = generateRandomString(64);
  generateCodeChallenge(codeVerifier).then((code_challenge) => {
    localStorage.setItem(codeVerifierKey, codeVerifier);

    window.location.href =
      'https://accounts.spotify.com/authorize' +
      reduceUrlParams({
        response_type: 'code',
        client_id: CLIENT_ID,
        scope: scopes.join(' '),
        redirect_uri: REDIRECT_URI,
        code_challenge_method: 'S256',
        code_challenge,
      });
  });
};

export const exchangeToken = (authCode: string) => {
  const code_verifier = localStorage.getItem(codeVerifierKey);

  if (code_verifier) {
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code: authCode,
      redirect_uri: REDIRECT_URI,
      client_id: CLIENT_ID,
      code_verifier,
    });
    return axios
      .post<SpotifyApiTokenRequest, AxiosResponse<SpotifyApiTokenResponse>>(
        'https://accounts.spotify.com/api/token',
        body,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      )
      .then((response) => {
        const expires_at = Date.now() + response.data.expires_in * 1000;
        localStorage.removeItem(codeVerifierKey);
        return {
          access_token: response.data.access_token,
          refresh_token: response.data.refresh_token,
          expires_at,
        };
      })
      .catch((error) => {
        throw Error(error);
      });
  } else {
    console.error('No code verifier found');
  }

  localStorage.removeItem(codeVerifierKey);
  return undefined;
};

export const refreshToken = () => {
  const refresh_token = localStorage.getItem('refresh_token');

  if (refresh_token) {
    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: CLIENT_ID,
      refresh_token,
    });
    return axios
      .post<SpotifyApiRefreshTokenRequest, AxiosResponse<SpotifyApiRefreshTokenResponse>>(
        'https://accounts.spotify.com/api/token',
        body,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      )
      .then((response) => {
        const expires_at = Date.now() + response.data.expires_in * 1000;
        return {
          access_token: response.data.access_token,
          expires_at,
        };
      });
  } else {
    console.error('No refresh token found');
  }

  return undefined;
};

export const getUser = (access_token: string) => {
  return axios
    .get<User>('https://api.spotify.com/v1/me', {
      headers: {
        Authorization: 'Bearer ' + access_token,
      },
    })
    .then((response) => {
      if (response.status === 200) {
        return response.data;
      } else {
        console.error('Error getting user data');
      }
    });
};
