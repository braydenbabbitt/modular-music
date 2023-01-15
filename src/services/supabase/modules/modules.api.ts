import { showNotification } from '@mantine/notifications';
import { SupabaseClient } from '@supabase/supabase-js';
import { DatabaseModule } from '../../../pages/module/types';
import { Database } from '../types/database.types';
import { supabaseResponseHandler, supabaseSingleResponseHandler } from '../utils';
import { ModuleSourceOptions } from './sources.api';

type GetUserModulesRequest = {
  supabaseClient: SupabaseClient<Database>;
  userId: string;
};

export const getUserModules = async ({ supabaseClient, userId }: GetUserModulesRequest) => {
  return await supabaseClient
    .from('modules')
    .select()
    .eq('user_id', userId)
    .is('deleted_at', null)
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
    .is('deleted_at', null)
    .single()
    .then((response) => supabaseSingleResponseHandler(response, 'There was an issue fetching your module'));
};

export type EditModuleRequest = {
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
  await supabaseClient.from('modules').update({ deleted_at: new Date().toISOString() }).eq('id', moduleId);
  await supabaseClient
    .from('module_actions')
    .update({ deleted_at: new Date().toISOString() })
    .eq('module_id', moduleId);
  await supabaseClient
    .from('module_sources')
    .update({ deleted_at: new Date().toISOString() })
    .eq('module_id', moduleId);

  if (refetch) {
    return await getUserModules({ supabaseClient, userId });
  }
};

type GetModuleSourcesRequest = {
  supabaseClient: SupabaseClient<Database>;
  moduleId: string;
};

export const getModuleSources = async ({ supabaseClient, moduleId }: GetModuleSourcesRequest) => {
  return (await supabaseClient
    .from('module_sources')
    .select()
    .eq('module_id', moduleId)
    .is('deleted_at', null)
    .order('created_at')
    .then((response) =>
      supabaseResponseHandler(response, "There was an issue fetching your module's sources"),
    )) as FetchedModuleSource[];
};

type GetModuleActionsRequest = {
  supabaseClient: SupabaseClient<Database>;
  moduleId: string;
};

export const getModuleActions = async ({ supabaseClient, moduleId }: GetModuleActionsRequest) => {
  return (await supabaseClient
    .from('module_actions')
    .select()
    .eq('module_id', moduleId)
    .is('deleted_at', null)
    .order('order')
    .then((response) =>
      supabaseResponseHandler(response, "There was an issue fetching your module's actions"),
    )) as FetchedModuleAction[];
};

type GetModuleDataRequest = {
  supabaseClient: SupabaseClient<Database>;
  moduleId: string;
};

export type FetchedModuleSource = Omit<Database['public']['Tables']['module_sources']['Row'], 'options'> & {
  options: ModuleSourceOptions;
};

export type FetchedModuleAction = Database['public']['Tables']['module_actions']['Row'];

export type GetModuleDataResponse = DatabaseModule & { sources: FetchedModuleSource[]; actions: FetchedModuleAction[] };

export const getModuleData = async ({ supabaseClient, moduleId }: GetModuleDataRequest) => {
  const module = await getModule({ supabaseClient, moduleId });

  const sources = await getModuleSources({ supabaseClient, moduleId });
  const actions = await getModuleActions({ supabaseClient, moduleId });

  return {
    ...module,
    sources,
    actions,
  } as GetModuleDataResponse;
};
