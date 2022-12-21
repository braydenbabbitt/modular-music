import { supabaseResponseHandler } from './../utils';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';
type GetActionTypesRequest = {
  supabaseClient: SupabaseClient<Database>;
};

export const getActionTypes = async ({ supabaseClient }: GetActionTypesRequest) => {
  return await supabaseClient
    .from('action_types')
    .select()
    .order('label')
    .then((response) => supabaseResponseHandler(response, 'There was an issue fetching action types'));
};

type DeleteActionFromModuleRequest = {
  supabaseClient: SupabaseClient<Database>;
  actionId: string;
};

export const deleteActionFromModule = async ({ supabaseClient, actionId }: DeleteActionFromModuleRequest) => {
  await supabaseClient.from('module_actions').update({ deleted_at: new Date().toISOString() }).eq('id', actionId);
};

type ModuleActionBaseOptions = { label?: string };

type FilterOptions = ModuleActionBaseOptions & {
  playlists?: string[];
  recentlyListened?: {
    quantity: number;
    interval: number;
  };
  likedTracks?: boolean;
};

export type ModuleActionOptions = FilterOptions;
