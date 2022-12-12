import { SOURCE_TYPE_IDS } from './../constants';
import { supabaseResponseHandler } from '../utils';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';
import { CreateDatabaseModuleSource } from '../../../pages/module/types';

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

type CustomAddSourceToModuleRequest = { supabaseClient: SupabaseClient<Database> } & Omit<
  CreateDatabaseModuleSource,
  'options' | 'created_at' | 'id' | 'deleted_at' | 'type_id'
>;

type ModuleSourceBaseOptions = {
  label: string;
  image_href?: string;
};

export type UsersLikedTracksOptions = ModuleSourceBaseOptions;

export const addLikedTracksSourceToModule = (
  payload: CustomAddSourceToModuleRequest & {
    options: UsersLikedTracksOptions;
  },
) => {
  return addSourceToModule({
    type_id: SOURCE_TYPE_IDS.USER_LIKED_TRACKS,
    ...payload,
  });
};

export type UserPlaylistOptions = ModuleSourceBaseOptions & {
  playlist_id: string;
  playlist_href: string;
};

export const addUserPlaylistSourceToModule = (
  payload: CustomAddSourceToModuleRequest & {
    options: UserPlaylistOptions;
  },
) => {
  return addSourceToModule({
    type_id: SOURCE_TYPE_IDS.USER_PLAYLIST,
    ...payload,
  });
};

export type RecentlyPlayedOptions = ModuleSourceBaseOptions & {
  quantity: number;
  interval: number;
};

export const addRecentlyPlayedSourceToModule = (
  payload: CustomAddSourceToModuleRequest & {
    options: RecentlyPlayedOptions;
  },
) => {
  return addSourceToModule({
    type_id: SOURCE_TYPE_IDS.USER_RECENTLY_LISTENED,
    ...payload,
  });
};

export type ModuleSourceOptions = ModuleSourceBaseOptions &
  (UsersLikedTracksOptions | UserPlaylistOptions | RecentlyPlayedOptions);

type AddSourceToModuleRequest = {
  supabaseClient: SupabaseClient<Database>;
} & CreateDatabaseModuleSource;

const addSourceToModule = async ({ supabaseClient, ...payload }: AddSourceToModuleRequest) => {
  await supabaseClient.from('module_sources').insert({
    ...payload,
  });
};

type DeleteSourceFromModuleRequest = {
  supabaseClient: SupabaseClient<Database>;
  moduleId: string;
};

export const deleteSourceFromModule = async ({ supabaseClient, moduleId }: DeleteSourceFromModuleRequest) => {
  await supabaseClient.from('module_sources').update({ deleted_at: new Date().toISOString() }).eq('id', moduleId);
};
