import { showNotification } from '@mantine/notifications';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';
import { supabaseResponseHandler, supabaseSingleResponseHandler } from '../utils';

type GetUserModulesRequest = {
  supabaseClient: SupabaseClient<Database>;
  userId: string;
};

export const getUserModules = async ({ supabaseClient, userId }: GetUserModulesRequest) => {
  return await supabaseClient
    .from('modules')
    .select()
    .eq('user_id', userId)
    .order('created_at')
    .then((response) => supabaseResponseHandler(response, 'There was an issue loading your modules.'));
};

type CreateUserModuleRequest = {
  supabaseClient: SupabaseClient<Database>;
  userId: string;
  name: string;
};

export const createUserModule = async ({ supabaseClient, userId, name }: CreateUserModuleRequest) => {
  return await supabaseClient
    .from('modules')
    .insert({
      name,
      user_id: userId,
    })
    .select()
    .single()
    .then((response) => supabaseSingleResponseHandler(response, 'There was an issue creating your module.'));
};

type GetModuleRequest = {
  supabaseClient: SupabaseClient<Database>;
  moduleId: string;
};

export const getModule = async ({ supabaseClient, moduleId }: GetModuleRequest) => {
  return await supabaseClient
    .from('modules')
    .select()
    .eq('id', moduleId)
    .single()
    .then((response) => supabaseSingleResponseHandler(response, 'There was an issue fetching your module.'));
};

type EditModuleRequest = {
  supabaseClient: SupabaseClient<Database>;
  moduleId: string;
  name: string;
  refetch?: boolean;
};

export const editModule = async ({ supabaseClient, moduleId, name, refetch = true }: EditModuleRequest) => {
  if (refetch) {
    return await supabaseClient
      .from('modules')
      .update({
        name,
        edited_at: new Date().toISOString(),
      })
      .eq('id', moduleId)
      .select()
      .single()
      .then((response) => {
        if (response.data) {
          return response.data;
        } else if (response.error) {
          console.error(response.error);
          showNotification({
            color: 'danger',
            title: 'Error',
            message: 'There was an issue editing your module.',
          });
        }
      });
  } else {
    await supabaseClient
      .from('modules')
      .update({
        name,
        edited_at: new Date().toISOString(),
      })
      .eq('id', moduleId);
  }
};

type DeleteModuleRequest = {
  supabaseClient: SupabaseClient<Database>;
  userId: string;
  moduleId: string;
  refetch?: boolean;
};

export const deleteModule = async ({ supabaseClient, userId, moduleId, refetch = false }: DeleteModuleRequest) => {
  await supabaseClient.from('modules').delete().eq('id', moduleId);

  if (refetch) {
    return await getUserModules({ supabaseClient, userId });
  }
};
