import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.13.1';
import { Database } from '../types/database.ts';

export const getActionSources = async (supabaseClient: SupabaseClient<Database>, actionId: string) => {
  const query = await supabaseClient.from('module_sources').select().eq('action_id', actionId).is('deleted_at', null);

  if (query.error) {
    throw new Error(
      JSON.stringify({
        message: 'Error fetching action sources',
        error: query.error,
      }),
    );
  }

  return query.data;
};
