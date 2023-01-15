import { useEffect, useState } from 'react';
import {
  ActionIcon,
  Button,
  Center,
  Divider,
  Flex,
  Loader,
  Space,
  Stepper,
  TextInput,
  Title,
  useMantineTheme,
} from '@mantine/core';
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { IconPencil } from '@tabler/icons';
import { editModule, EditModuleRequest, getModuleData } from '../../services/supabase/modules/modules.api';
import { useForm } from '@mantine/form';
import { SourceSection } from './components/sources/sources-section.component';
import { BackButton } from '../../components/buttons/back-button.component';
import { ActionsSection } from './components/actions/actions-section.component';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { OutputSection } from './components/output/output-section.component';
import { useSession } from '@supabase/auth-helpers-react';
import { useSupabase } from '../../services/supabase/client/client';
import { CreateModuleModal } from './views/create.page';

export const ModulePage = () => {
  const mantineTheme = useMantineTheme();
  const { moduleId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const session = useSession();
  const supabaseClient = useSupabase();
  const queryClient = useQueryClient();
  const { data, isLoading, refetch } = useQuery([moduleId], () =>
    getModuleData({ supabaseClient, moduleId: moduleId ?? '' }),
  );
  const { mutate, isLoading: mutationLoading } = useMutation(
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
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (data?.name && !nameForm.values.name) {
      nameForm.setFieldValue('name', data.name);
    }
  }, [data?.name]);

  useEffect(() => {
    if (data) {
      if (data.actions) {
        setStep(2);
      } else if (data.sources) {
        setStep(1);
      }
    }
  }, []);

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
            if (session?.user && moduleId) {
              mutate(
                { supabaseClient, moduleId, name: values.name ?? '', refetch: false },
                {
                  onSettled: () => {
                    setEditState((prev) => ({ ...prev, name: false }));
                  },
                },
              );
            } else {
              setEditState((prev) => ({ ...prev, name: false }));
            }
          })}
        >
          <Flex gap={mantineTheme.spacing.sm} align='center'>
            <TextInput
              variant='unstyled'
              {...nameForm.getInputProps('name')}
              placeholder='Unnamed module'
              autoFocus
              size='xl'
            />
            <Button type='submit' loading={isLoading || mutationLoading} disabled={!nameForm.isDirty()}>
              Save
            </Button>
            {isLoading || mutationLoading || (
              <Button
                disabled={isLoading || mutationLoading}
                variant='outline'
                color='neutral'
                onClick={() => {
                  nameForm.reset();
                  setEditState((prev) => ({ ...prev, name: false }));
                }}
              >
                Cancel
              </Button>
            )}
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
      {(isLoading && (
        <Center>
          <Loader />
        </Center>
      )) || (
        <Stepper active={step} onStepClick={setStep} css={{ marginTop: mantineTheme.spacing.lg }}>
          <Stepper.Step label='Select sources'>
            <SourceSection sources={data?.sources ?? []} refetchSources={refetch} moduleId={moduleId!} />
          </Stepper.Step>
          <Stepper.Step label='Configure actions'>
            <ActionsSection actions={data?.actions ?? []} refetchActions={refetch} moduleId={moduleId!} />
          </Stepper.Step>
          <Stepper.Step label='Set up output'>
            <OutputSection />
          </Stepper.Step>
        </Stepper>
      )}
      {moduleId && (
        <CreateModuleModal
          open={searchParams.get('create') === 'true'}
          onClose={() => navigate('/dashboard', { replace: true })}
          data={data}
          refetch={refetch}
          moduleId={moduleId}
          initialValues={{ name: data?.name }}
        />
      )}
    </>
  );
};
