import { ReactNode, createContext, useContext } from 'react';
import { useSpotifyTokenQuery } from '../../hooks/use-spotify-token';
import { PageContainer } from '../../components/containers/page-container.component';
import { Center, Loader } from '@mantine/core';

type SpotifyTokenProviderProps = {
  children: ReactNode;
};

const SpotifyTokenContext = createContext<{ spotifyToken?: string } | undefined>(undefined);

export const SpotifyTokenProvider = ({ children }: SpotifyTokenProviderProps) => {
  const spotifyTokenQuery = useSpotifyTokenQuery();

  return (
    <SpotifyTokenContext.Provider value={{ spotifyToken: spotifyTokenQuery.data?.token }}>
      {spotifyTokenQuery.isLoading || !spotifyTokenQuery.isFetched ? (
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

  if (!context.spotifyToken) {
    throw new Error('Spotify token is not available');
  }

  return context.spotifyToken;
};
