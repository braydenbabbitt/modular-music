import { showNotification } from '@mantine/notifications';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

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
    .then((response) => {
      if (response.data) {
        return response.data;
      } else if (response.error) {
        console.error(response.error);
        showNotification({
          color: 'danger',
          title: 'Error',
          message: 'There was an issue loading your programs.',
        });
      }
    });
};

type CreateUserProgramRequest = {
  supabaseClient: SupabaseClient<Database>;
  userId: string;
  name: string;
  refetch?: boolean;
};

export const createUserProgram = async ({
  supabaseClient,
  userId,
  name,
  refetch = false,
}: CreateUserProgramRequest) => {
  await supabaseClient.from('programs').insert({
    name,
    user_id: userId,
  });

  if (refetch) {
    return await getUserPrograms({ supabaseClient, userId });
  }
};

type EditProgramRequest = {
  supabaseClient: SupabaseClient<Database>;
  userId: string;
  programId: string;
  name: string;
  refetch?: boolean;
};

export const editProgram = async ({ supabaseClient, userId, programId, name, refetch = false }: EditProgramRequest) => {
  await supabaseClient
    .from('programs')
    .update({
      name,
      edited_at: new Date().toISOString(),
    })
    .eq('id', programId);

  if (refetch) {
    return await getUserPrograms({ supabaseClient, userId });
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
