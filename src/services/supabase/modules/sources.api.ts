import { supabaseResponseHandler } from '../utils';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

type GetBaseSourcesRequest = {
  supabaseClient: SupabaseClient<Database>;
};

export const getSourceTypes = async ({ supabaseClient }: GetBaseSourcesRequest) => {
  const result = await supabaseClient
    .from('source_types')
    .select()
    .order('label')
    .then((response) => supabaseResponseHandler(response, 'There was an issue fetching module sources'));
  return result;
};
