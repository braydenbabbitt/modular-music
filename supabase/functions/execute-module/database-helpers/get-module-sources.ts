import { SupabaseClient } from 'supabase-js';
import { Database } from '../types/database.ts';

export const getModuleSources = async (supabaseClient: SupabaseClient<Database>, moduleId: string) => {
  const query = await supabaseClient.from('module_sources').select().eq('module_id', moduleId).is('deleted_at', null);

  if (query.error) {
    throw new Error(
      JSON.stringify({
        message: 'Error fetching module sources',
        error: query.error,
      }),
    );
  }

  return query.data;
};
