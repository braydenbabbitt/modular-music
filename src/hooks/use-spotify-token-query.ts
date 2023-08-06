import { useQuery, useQueryClient } from 'react-query';
import { useAuth } from '../services/auth/auth.provider';

type SpotifyTokenData = {
  token: string;
  expiresAt: number;
};

export const useSpotifyTokenQuery = () => {
  const { user, supabaseClient } = useAuth();
  const queryKey = ['spotify-token', user?.id];
  const queryClient = useQueryClient();

  return useQuery({
    queryKey,
    queryFn: async () => {
      const functionResponse = await supabaseClient.functions.invoke<SpotifyTokenData>('get-spotify-token', {
        body: {
          userId: user?.id,
        },
      });
      if (functionResponse.error || !functionResponse.data) {
        throw new Error('Error getting spotify token');
      }

      return functionResponse.data;
    },
    enabled: !!user?.id,
    onSuccess: async (data) => {
      const msUntilExpiration = data.expiresAt - Date.now();
      if (msUntilExpiration < 0) {
        const forcedNewToken = await supabaseClient.functions.invoke<SpotifyTokenData>('get-spotify-token', {
          body: {
            userId: user?.id,
            forceRefetch: true,
          },
        });
        if (forcedNewToken.error || !forcedNewToken.data) {
          throw new Error('Error getting spotify token');
        }
        queryClient.setQueryData(queryKey, forcedNewToken.data);
      } else {
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey, exact: true });
          queryClient.refetchQueries({ queryKey, exact: true });
        }, msUntilExpiration);
      }
    },
    staleTime: Infinity,
  });
};
