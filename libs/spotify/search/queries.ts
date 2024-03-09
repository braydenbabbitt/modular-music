import { useSpotify } from '@root/providers';
import { ItemTypes } from '@spotify/web-api-ts-sdk';
import { useQuery } from '@tanstack/react-query';

export const queryKeys = {
  search: (req: UseSpotifySearchArgs) => ['spotify', 'search', { ...req }],
};

type UseSpotifySearchArgs = {
  query: string;
  types: ItemTypes[];
};

export const useSpotifySearch = ({ query, types }: UseSpotifySearchArgs) => {
  const { spotifyClient } = useSpotify();

  return useQuery({
    queryKey: queryKeys.search({ query, types }),
    queryFn: () => spotifyClient!.search(query, types),
    enabled: !!spotifyClient && query.length > 0,
  });
};
