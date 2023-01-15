import { useSupabase } from './../client/client';
import { supabaseSingleResponseHandler } from './../utils';
import { useQuery } from 'react-query';
import { isDevEnvironment } from '../../../utils/is-dev-environment';

export const useFeatureFlag = (ffName: string, userId?: string) => {
  const supabaseClient = useSupabase();

  const ffQuery = useQuery(['feature-flag', ffName, userId], async () => {
    return isDevEnvironment()
      ? { enabled: true }
      : userId
      ? await supabaseClient
          .from('feature_flags')
          .select()
          .eq('name', ffName)
          .eq('user_id', userId)
          .single()
          .then((response) => {
            const data = supabaseSingleResponseHandler(
              response,
              `There was an issue fetching the ${ffName} feature flag for this user`,
            );
            if (data) {
              return data;
            }

            return supabaseClient
              .from('feature_flags')
              .select()
              .eq('name', ffName)
              .single()
              .then((defaultResponse) =>
                supabaseSingleResponseHandler(
                  defaultResponse,
                  `There was an issue fetching the ${ffName} feature flag`,
                ),
              );
          })
      : await supabaseClient
          .from('feature_flags')
          .select()
          .eq('name', ffName)
          .single()
          .then((defaultResponse) =>
            supabaseSingleResponseHandler(defaultResponse, `There was an issue fetching the ${ffName} feature flag`),
          );
  });

  return ffQuery.isFetched ? ffQuery.data?.enabled ?? false : false;
};
