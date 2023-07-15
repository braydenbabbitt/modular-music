import { SupabaseClient } from 'supabase-js';
import { Database } from '../types/database.ts';

type GetLastUserSavedTrackRequest = {
  serviceRoleClient: SupabaseClient<Database>;
  userId: string;
};

export const getLastUserSavedTrack = async ({
  serviceRoleClient,
  userId,
}: GetLastUserSavedTrackRequest): Promise<Database['public']['Tables']['users_saved_tracks']['Row'] | null> => {
  const dbQuery = await serviceRoleClient
    .from('users_saved_tracks')
    .select()
    .eq('user_id', userId)
    .order('added_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  return dbQuery.data;
};
