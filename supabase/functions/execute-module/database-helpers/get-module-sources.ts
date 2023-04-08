import { SupabaseClient } from 'https://esm.sh/v113/@supabase/supabase-js@2.13.1/dist/module/index.js';
import { Database } from '../types/database.ts';
export const getModuleSources = async (supabaseClient: SupabaseClient<Database>, moduleId: string) => {
  return await supabaseClient.from('module_sources').select().eq('module_id', moduleId).is('deleted_at', null);
};
