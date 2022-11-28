import { showNotification } from '@mantine/notifications';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';
import { supabaseResponseHandler, supabaseSingleResponseHandler } from '../utils';

type GetUserProgramsRequest = {
  supabaseClient: SupabaseClient<Database>;
  userId: string;
};

export const getUserPrograms = async ({ supabaseClient, userId }: GetUserProgramsRequest) => {
  return await supabaseClient
    .from('programs')
    .select()
    .eq('user_id', userId)
    .order('created_at')
    .then((response) => supabaseResponseHandler(response, 'There was an issue loading your programs.'));
};

type CreateUserProgramRequest = {
  supabaseClient: SupabaseClient<Database>;
  userId: string;
  name: string;
};

export const createUserProgram = async ({ supabaseClient, userId, name }: CreateUserProgramRequest) => {
  return await supabaseClient
    .from('programs')
    .insert({
      name,
      user_id: userId,
    })
    .select()
    .single()
    .then((response) => supabaseSingleResponseHandler(response, 'There was an issue creating your program.'));
};

type GetProgramRequest = {
  supabaseClient: SupabaseClient<Database>;
  programId: string;
};

export const getProgram = async ({ supabaseClient, programId }: GetProgramRequest) => {
  return await supabaseClient
    .from('programs')
    .select()
    .eq('id', programId)
    .single()
    .then((response) => supabaseSingleResponseHandler(response, 'There was an issue fetching your program.'));
};

type EditProgramRequest = {
  supabaseClient: SupabaseClient<Database>;
  programId: string;
  name: string;
  refetch?: boolean;
};

export const editProgram = async ({ supabaseClient, programId, name, refetch = true }: EditProgramRequest) => {
  if (refetch) {
    return await supabaseClient
      .from('programs')
      .update({
        name,
        edited_at: new Date().toISOString(),
      })
      .eq('id', programId)
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
            message: 'There was an issue editing your program.',
          });
        }
      });
  } else {
    await supabaseClient
      .from('programs')
      .update({
        name,
        edited_at: new Date().toISOString(),
      })
      .eq('id', programId);
  }
};

type DeleteProgramRequest = {
  supabaseClient: SupabaseClient<Database>;
  userId: string;
  programId: string;
  refetch?: boolean;
};

export const deleteProgram = async ({ supabaseClient, userId, programId, refetch = false }: DeleteProgramRequest) => {
  await supabaseClient.from('programs').delete().eq('id', programId);

  if (refetch) {
    return await getUserPrograms({ supabaseClient, userId });
  }
};
