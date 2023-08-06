import { ReactNode, createContext, useContext } from 'react';
import { useSpotifyTokenQuery } from '../../hooks/use-spotify-token-query';
import { PageContainer } from '../../components/containers/page-container.component';
import { Center, Loader } from '@mantine/core';
import { useAuth } from '../auth/auth.provider';

type SpotifyTokenProviderProps = {
  children: ReactNode;
};

const SpotifyTokenContext = createContext<{ spotifyToken?: string } | undefined>(undefined);

export const SpotifyTokenProvider = ({ children }: SpotifyTokenProviderProps) => {
  const { user } = useAuth();
  const spotifyTokenQuery = useSpotifyTokenQuery();
  const spotifyDataIsLoading = spotifyTokenQuery.isLoading || !spotifyTokenQuery.isFetched;
  const showLoader = user && spotifyDataIsLoading;

  return (
    <SpotifyTokenContext.Provider value={{ spotifyToken: spotifyTokenQuery.data?.token }}>
      {showLoader ? (
        <PageContainer dontAdjustForHeader>
          <Center css={{ height: '100%' }}>
            <Loader />
          </Center>
        </PageContainer>
      ) : (
        children
      )}
    </SpotifyTokenContext.Provider>
  );
};

export const useSpotifyToken = () => {
  const context = useContext(SpotifyTokenContext);
  if (context === undefined) {
    throw new Error('useSpotifyToken must be used within a SpotifyTokenProvider');
  }

  return context.spotifyToken ?? '';
};
