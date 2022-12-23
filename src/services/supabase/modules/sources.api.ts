import { SOURCE_TYPE_IDS } from './../constants';
import { supabaseResponseHandler } from '../utils';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';
import { CreateDatabaseModuleSource } from '../../../pages/module/types';

type GetSourceTypesRequest = {
  supabaseClient: SupabaseClient<Database>;
};

export type SourceType = Database['public']['Tables']['source_types']['Row'];

export const getSourceTypes = async ({ supabaseClient }: GetSourceTypesRequest): Promise<SourceType[]> => {
  const result = await supabaseClient
    .from('source_types')
    .select()
    .is('deleted_at', null)
    .order('label')
    .then((response) => supabaseResponseHandler(response, 'There was an issue fetching source types'));
  return result ?? Promise.resolve([]);
};

type CustomAddSourceRequest = { supabaseClient: SupabaseClient<Database> } & Omit<
  CreateDatabaseModuleSource,
  'options' | 'type_id'
>;

export type UserLikedTracksOptions = undefined;

export const addLikedTracksSource = (payload: CustomAddSourceRequest) => {
  return addSource({
    type_id: SOURCE_TYPE_IDS.USER_LIKED_TRACKS,
    ...payload,
  });
};

export type UserPlaylistOptions = {
  playlist_id: string;
  playlist_href: string;
};

export const addUserPlaylistSource = (
  payload: CustomAddSourceRequest & {
    options: UserPlaylistOptions;
  },
) => {
  return addSource({
    type_id: SOURCE_TYPE_IDS.USER_PLAYLIST,
    ...payload,
  });
};

export type RecentlyListenedOptions = {
  quantity: number;
  interval: number;
};

export const addRecentlyListenedSource = (
  payload: CustomAddSourceRequest & {
    options: RecentlyListenedOptions;
  },
) => {
  return addSource({
    type_id: SOURCE_TYPE_IDS.USER_RECENTLY_LISTENED,
    ...payload,
  });
};

export type ModuleSourceOptions = Partial<UserPlaylistOptions & RecentlyListenedOptions>;

type AddSourceRequest = {
  supabaseClient: SupabaseClient<Database>;
} & CreateDatabaseModuleSource;

const addSource = async ({ supabaseClient, ...payload }: AddSourceRequest) => {
  await supabaseClient.from('module_sources').insert({
    ...payload,
  });
};

type DeleteSourceRequest = {
  supabaseClient: SupabaseClient<Database>;
  sourceId: string;
};

export const deleteSourceFromModule = async ({ supabaseClient, sourceId }: DeleteSourceRequest) => {
  await supabaseClient.from('module_sources').update({ deleted_at: new Date().toISOString() }).eq('id', sourceId);
};
