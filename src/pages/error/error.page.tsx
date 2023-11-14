import { useLocation } from 'react-router-dom';
import { SPOTIFY_UNVERIFIED_DATA } from '../../utils/constants';
import { UnverifiedEmailError } from './unverified-email-error';
import { Center } from '@mantine/core';

export const ErrorPage = () => {
  const { search } = useLocation();
  const searchParams = new URLSearchParams(search);
  const { error, error_code, error_description } = Object.fromEntries(searchParams);
  console.log('brayden-test', { error_code });
  const isUnverifiedSpotifyEmailError =
    error === SPOTIFY_UNVERIFIED_DATA.error &&
    error_code === SPOTIFY_UNVERIFIED_DATA.error_code &&
    error_description.toLowerCase().includes('spotify') &&
    error_description.toLowerCase().includes('email') &&
    error_description.toLowerCase().includes('verif');

  if (isUnverifiedSpotifyEmailError) {
    return (
      <Center css={{ paddingTop: 100 }}>
        <UnverifiedEmailError />
      </Center>
    );
  }
  return null;
};
