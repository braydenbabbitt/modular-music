import { supabaseResponseHandler } from './../utils';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

type GetBaseSourcesRequest = {
  supabaseClient: SupabaseClient<Database>;
};

export const getBaseSources = async ({ supabaseClient }: GetBaseSourcesRequest) => {
  return await supabaseClient
    .from('sources')
    .select()
    .order('label')
    .then((response) => supabaseResponseHandler(response, 'There was an issue fetching program sources'));
};
