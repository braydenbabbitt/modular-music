import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.13.1';
import { Database } from '../types/database.ts';

export const getModuleOutput = async (supabaseClient: SupabaseClient<Database>, moduleId: string) => {
  const query = await supabaseClient
    .from('module_outputs')
    .select()
    .eq('module_id', moduleId)
    .is('deleted_at', null)
    .single();

  if (query.error) {
    throw new Error(
      JSON.stringify({
        message: 'Error fetching module output',
        error: query.error,
      }),
    );
  }

  return query.data;
};
