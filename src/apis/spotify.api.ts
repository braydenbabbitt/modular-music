import { reduceUrlParams } from './../utils/reduce-url-params';
import { generateRandomString } from '../utils/generate-random-string';

const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = import.meta.env.VITE_SPOTIFY_LOGIN_REDIRECT_URI;

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
  const state = generateRandomString(16);

  window.location.href =
    'https://accounts.spotify.com/authorize' +
    reduceUrlParams({
      response_type: 'code',
      client_id: CLIENT_ID,
      scope: scopes,
      redirect_uri: REDIRECT_URI,
      state: state,
    });
};
