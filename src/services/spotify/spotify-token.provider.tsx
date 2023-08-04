import { ReactNode, createContext, useContext } from 'react';
import { useSpotifyTokenQuery } from '../../hooks/use-spotify-token';

type SpotifyTokenProviderProps = {
  children: ReactNode;
};

const SpotifyTokenContext = createContext<{ spotifyToken?: string } | undefined>(undefined);

export const SpotifyTokenProvider = ({ children }: SpotifyTokenProviderProps) => {
  const spotifyTokenQuery = useSpotifyTokenQuery();

  return (
    <SpotifyTokenContext.Provider value={{ spotifyToken: spotifyTokenQuery.data?.token }}>
      {children}
    </SpotifyTokenContext.Provider>
  );
};

export const useSpotifyToken = () => {
  const context = useContext(SpotifyTokenContext);
  if (context === undefined) {
    throw new Error('useSpotifyToken must be used within a SpotifyTokenProvider');
  }
  return context.spotifyToken;
};
