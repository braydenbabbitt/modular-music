import { CreateDatabaseModuleAction } from './../../../pages/module/types';
import { ACTION_TYPE_IDS, SOURCE_TYPE_IDS } from './../constants';
import { supabaseResponseHandler } from './../utils';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';
import {
  addLikedTracksSource,
  addRecentlyListenedSource,
  addUserPlaylistSource,
  RecentlyListenedOptions,
  UserPlaylistOptions,
} from './sources.api';
import { showNotification } from '@mantine/notifications';

export type ActionType = Database['public']['Tables']['action_types']['Row'];

type GetActionTypesRequest = {
  supabaseClient: SupabaseClient<Database>;
};

export const getActionTypes = async ({ supabaseClient }: GetActionTypesRequest) => {
  return await supabaseClient
    .from('action_types')
    .select()
    .is('deleted_at', null)
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

type AddActionToModuleRequest = {
  supabaseClient: SupabaseClient<Database>;
} & CreateDatabaseModuleAction;

export const addActionToModule = async ({ supabaseClient, sources, ...payload }: AddActionToModuleRequest) => {
  const newAction = await supabaseClient
    .from('module_actions')
    .insert({ ...payload })
    .select()
    .single();

  if (payload.type_id === ACTION_TYPE_IDS.FILTER) {
    if (newAction.data) {
      sources?.forEach(async (source) => {
        switch (source.type_id) {
          case SOURCE_TYPE_IDS.USER_LIKED_TRACKS:
            await addLikedTracksSource({
              supabaseClient,
              action_id: newAction.data.id,
              label: source.label,
              image_href: source.image_href,
            });
            break;
          case SOURCE_TYPE_IDS.USER_PLAYLIST:
            await addUserPlaylistSource({
              supabaseClient,
              action_id: newAction.data.id,
              label: source.label,
              image_href: source.image_href,
              options: source.options as UserPlaylistOptions,
            });
            break;
          case SOURCE_TYPE_IDS.USER_RECENTLY_LISTENED:
            await addRecentlyListenedSource({
              supabaseClient,
              action_id: newAction.data.id,
              label: source.label,
              image_href: source.image_href,
              options: source.options as RecentlyListenedOptions,
            });
            break;
        }
      });
    } else {
      showNotification({
        color: 'danger',
        title: 'Error',
        message: 'Problem creating action or using new action id',
      });
    }
  }
};
