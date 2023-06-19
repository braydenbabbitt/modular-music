import { INTERVAL_MAP } from './../constants';
import { showNotification } from '@mantine/notifications';
import { SupabaseClient } from '@supabase/supabase-js';
import { DatabaseModule } from '../../../pages/module/types';
import { Database } from '../types/database.types';
import { supabaseResponseHandler, supabaseSingleResponseHandler } from '../utils';
import { ModuleSourceOptions } from './sources.api';
import dayjs from 'dayjs';

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

type GetModuleOutputRequest = {
  supabaseClient: SupabaseClient<Database>;
  moduleId: string;
};

export const getModuleOutput = async ({ supabaseClient, moduleId }: GetModuleOutputRequest) => {
  const result = (await supabaseClient
    .from('module_outputs')
    .select()
    .eq('module_id', moduleId)
    .is('deleted_at', null)
    .maybeSingle()
    .then((response) =>
      supabaseSingleResponseHandler(response, "There was an issue fetching your module's output"),
    )) as FetchedModuleOutput | undefined;
  return result;
};

export type SaveModuleOutputRequest = {
  supabaseClient: SupabaseClient<Database>;
  moduleId: string;
  label: string;
  image_href: string;
  playlistId: string;
  playlist_href: string;
  limit: number;
  append?: boolean;
};

export const saveModuleOutput = async ({
  supabaseClient,
  moduleId,
  label,
  image_href,
  playlistId,
  playlist_href,
  limit,
  append,
}: SaveModuleOutputRequest) => {
  return await supabaseClient.from('module_outputs').upsert(
    {
      module_id: moduleId,
      label,
      image_href,
      playlist_id: playlistId,
      playlist_href: playlist_href,
      limit,
      append: append === undefined ? null : append,
    },
    {
      onConflict: 'module_id',
      ignoreDuplicates: false,
    },
  );
};

export const ModuleRepetitionIntervalValues = ['days', 'weeks', 'months', 'years'] as const;
export type ModuleRepetitionInterval = (typeof ModuleRepetitionIntervalValues)[number];

export type ModuleScheduleRepetition = {
  quantity: number;
  interval: ModuleRepetitionInterval;
  daysOfWeek?: number[];
  dayOfMonth?: number;
  dayOfWeekOfMonth?: {
    day: number;
    week: number;
  };
};

export type GetModuleScheduleRequest = {
  supabaseClient: SupabaseClient<Database>;
  moduleId: string;
};

export const getModuleSchedule = async ({ supabaseClient, moduleId }: GetModuleScheduleRequest) => {
  const result = (await supabaseClient
    .from('module_schedules')
    .select()
    .eq('id', moduleId)
    .is('deleted_at', null)
    .maybeSingle()
    .then((response) =>
      supabaseSingleResponseHandler(response, "There was an error fetching your module's schedule"),
    )) as FetchedModuleSchedule | undefined;
  return result;
};

export type SaveModuleScheduleRequest = {
  supabaseClient: SupabaseClient<Database>;
  moduleId: string;
  next_run: Date;
  repetition?: ModuleScheduleRepetition | null;
  endDate?: Date | null;
  timesToRepeat?: number | null;
};

export const saveModuleSchedule = async ({
  supabaseClient,
  moduleId,
  next_run,
  repetition,
  endDate,
  timesToRepeat,
}: SaveModuleScheduleRequest) => {
  await supabaseClient.from('module_schedules').upsert(
    {
      id: moduleId,
      edited_at: new Date().toISOString(),
      next_run: next_run.toISOString(),
      repetition_config: repetition,
      end_date: endDate === null ? null : endDate?.toISOString(),
      times_to_repeat: timesToRepeat === null ? null : timesToRepeat,
      deleted_at: null,
    },
    { onConflict: 'id' },
  );

  supabaseClient.functions.invoke('update-module-schedule', { body: `"${moduleId}"` });
};

export type DeleteModuleScheduleRequest = {
  supabaseClient: SupabaseClient<Database>;
  moduleId: string;
};

export const deleteModuleSchedule = async ({ supabaseClient, moduleId }: DeleteModuleScheduleRequest) => {
  await supabaseClient.from('module_schedules').update({ deleted_at: new Date().toISOString() }).eq('id', moduleId);
};

export const setModuleComplete = async (
  supabaseClient: SupabaseClient<Database>,
  moduleId: string,
  isComplete?: boolean,
) => {
  return await supabaseClient
    .from('modules')
    .update({ complete: isComplete || true })
    .eq('id', moduleId);
};

type GetModuleDataRequest = {
  supabaseClient: SupabaseClient<Database>;
  moduleId: string;
};

export type FetchedModuleSource = Omit<Database['public']['Tables']['module_sources']['Row'], 'options'> & {
  options: ModuleSourceOptions;
};

export type FetchedModuleAction = Database['public']['Tables']['module_actions']['Row'];

export type FetchedModuleOutput = Database['public']['Tables']['module_outputs']['Row'];

export type FetchedModuleSchedule = Omit<
  Database['public']['Tables']['module_schedules']['Row'],
  'repetition_config'
> & {
  repetition_config: ModuleScheduleRepetition | null;
};

export type GetModuleDataResponse = DatabaseModule & {
  sources: FetchedModuleSource[];
  actions: FetchedModuleAction[];
  output: FetchedModuleOutput | undefined;
  schedule: FetchedModuleSchedule | undefined;
};

export const getModuleData = async ({ supabaseClient, moduleId }: GetModuleDataRequest) => {
  const module = await getModule({ supabaseClient, moduleId });

  const sources = await getModuleSources({ supabaseClient, moduleId });
  const actions = await getModuleActions({ supabaseClient, moduleId });
  const output = await getModuleOutput({ supabaseClient, moduleId });
  const schedule = await getModuleSchedule({ supabaseClient, moduleId });

  return {
    ...module,
    sources,
    actions,
    output,
    schedule,
  } as GetModuleDataResponse;
};
