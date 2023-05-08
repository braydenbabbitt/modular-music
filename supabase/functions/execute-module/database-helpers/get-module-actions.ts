import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.13.1';
import { Database } from '../types/database.ts';

export const getModuleActions = async (supabaseClient: SupabaseClient<Database>, moduleId: string) => {
  const query = await supabaseClient.from('module_actions').select().eq('module_id', moduleId).is('deleted_at', null);

  if (query.error) {
    throw new Error(
      JSON.stringify({
        message: 'Error fetching module actions',
        error: query.error,
      }),
    );
  }

  return query.data;
};
