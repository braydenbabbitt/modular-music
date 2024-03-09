import { useSupabase } from '@root/providers';
import { useQuery } from '@tanstack/react-query';

export const queryKeys = {
  baseKey: ['supabase', 'modules'],
  userModules: (userId: string) => [...queryKeys.baseKey, 'user-modules', { userId }],
};

export const useUserModules = () => {
  const { user, supabaseClient } = useSupabase();

  return useQuery({
    queryKey: queryKeys.userModules(user?.id ?? ''),
    queryFn: async () =>
      (
        await supabaseClient
          .from('modules')
          .select('*')
          .eq('user_id', user?.id ?? '')
          .is('deleted_at', null)
          .throwOnError()
          .order('created_at')
      ).data,
    enabled: !!user,
  });
};
