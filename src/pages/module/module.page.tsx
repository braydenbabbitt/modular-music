import { useState } from 'react';
import { ActionIcon, Button, Center, Divider, Flex, Loader, TextInput, Title, useMantineTheme } from '@mantine/core';
import { useParams } from 'react-router-dom';
import { IconPencil } from '@tabler/icons';
import { editModule, EditModuleRequest, getModuleData } from '../../services/supabase/modules/modules.api';
import { useSupabase } from '../../services/supabase/client/client';
import { useForm } from '@mantine/form';
import { useAuth } from '../../services/auth/auth.provider';
import { SourceSection } from './components/sources/sources-section.component';
import { BackButton } from '../../components/buttons/back-button.component';
import { ActionsSection } from './components/actions/actions-section.component';
import { useMutation, useQuery, useQueryClient } from 'react-query';

export const ModulePage = () => {
  const mantineTheme = useMantineTheme();
  const { moduleId } = useParams();
  const supabaseClient = useSupabase();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data, isLoading, refetch } = useQuery([moduleId], () =>
    getModuleData({ supabaseClient, moduleId: moduleId ?? '' }),
  );
  const { mutate } = useMutation(
    [moduleId],
    (payload: EditModuleRequest) => {
      return editModule(payload).then(() => refetch());
    },
    {
      onMutate: () => queryClient.invalidateQueries([moduleId]),
    },
  );
  const [editState, setEditState] = useState({
    name: false,
  });
  const nameForm = useForm({
    initialValues: {
      name: data?.name,
    },
    validate: (values) => ({
      name: values.name ? null : 'Module name is required',
    }),
  });

  if (isLoading && !data) {
    return (
      <Center>
        <Loader />
      </Center>
    );
  }

  return (
    <>
      <BackButton label='Back to Dashboard' />
      {editState.name ? (
        <form
          onSubmit={nameForm.onSubmit((values) => {
            if (user && moduleId) {
              mutate({ supabaseClient, moduleId, name: values.name ?? '', refetch: false });
            }
            setEditState((prev) => ({ ...prev, name: false }));
          })}
        >
          <Flex gap={mantineTheme.spacing.sm} align='center'>
            <TextInput variant='unstyled' {...nameForm.getInputProps('name')} placeholder='Unnamed module' autoFocus />
            <Button type='submit' loading={isLoading}>
              Save
            </Button>
          </Flex>
        </form>
      ) : (
        <Flex gap={mantineTheme.spacing.sm} align='baseline'>
          <Title>{data?.name ?? 'Unnamed module'}</Title>
          <ActionIcon onClick={() => setEditState((prev) => ({ ...prev, name: true }))}>
            <IconPencil />
          </ActionIcon>
        </Flex>
      )}
      <SourceSection sources={data?.sources ?? []} refetchSources={refetch} moduleId={moduleId!} />
      <Divider my='md' />
      <ActionsSection actions={data?.actions ?? []} refetchActions={refetch} moduleId={moduleId!} />
    </>
  );
};
