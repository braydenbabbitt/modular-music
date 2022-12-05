import { useEffect, useState } from 'react';
import {
  ActionIcon,
  Button,
  Card,
  Center,
  Flex,
  Loader,
  TextInput,
  Title,
  useMantineTheme,
  Stack,
} from '@mantine/core';
import { useNavigate, useParams } from 'react-router-dom';
import { IconArrowLeft, IconPencil } from '@tabler/icons';
import {
  editModule,
  getModuleData,
  GetModuleDataResponse,
  addSourceToModule,
  deleteSourceFromModule,
} from '../../services/supabase/modules/modules.api';
import { useSupabase } from '../../services/supabase/client/client';
import { useForm } from '@mantine/form';
import { useAuth } from '../../services/auth/auth.provider';
import { SourceSelectorModal } from './components/source-selector-modal.component';
import { SourceRow } from './components/source-row.component';

export const ModulePage = () => {
  const mantineTheme = useMantineTheme();
  const { moduleId } = useParams();
  const supabaseClient = useSupabase();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sourceSelectorModalIsOpen, setSourceSelectorModalIsOpen] = useState(false);
  const [moduleQuery, setModuleQuery] = useState<{
    module?: GetModuleDataResponse;
    isLoading: boolean;
  }>({
    isLoading: true,
  });
  const [editState, setEditState] = useState({
    name: false,
  });
  const nameForm = useForm({
    initialValues: {
      name: moduleQuery.module?.name,
    },
    validate: (values) => ({
      name: values.name ? null : 'Module name is required',
    }),
  });

  const refetchQuery = () => {
    if (moduleId) {
      getModuleData({ supabaseClient, moduleId }).then((newModule) => {
        setModuleQuery({
          module: newModule,
          isLoading: false,
        });
        setEditState((prev) => ({ ...prev, name: false }));
      });
    }
  };

  useEffect(() => {
    if (moduleId) {
      getModuleData({ supabaseClient, moduleId }).then((module) => {
        if (module) {
          setModuleQuery({
            module,
            isLoading: false,
          });
          nameForm.setValues({
            name: module.name,
          });
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nameForm.setValues, moduleId, supabaseClient]);

  if (moduleQuery.isLoading && !moduleQuery.module) {
    return (
      <Center>
        <Loader />
      </Center>
    );
  }

  return (
    <>
      <Button leftIcon={<IconArrowLeft />} variant='subtle' onClick={() => navigate(-1)} color='primary'>
        Back to Dashboard
      </Button>
      {editState.name ? (
        <form
          onSubmit={nameForm.onSubmit((values) => {
            setModuleQuery((prev) => ({
              ...prev,
              isLoading: true,
            }));
            if (user && moduleId) {
              editModule({ supabaseClient, moduleId, name: values.name ?? '', refetch: false }).then(() => {
                getModuleData({ supabaseClient, moduleId }).then((newModule) => {
                  setModuleQuery({
                    module: newModule,
                    isLoading: false,
                  });
                  setEditState((prev) => ({ ...prev, name: false }));
                });
              });
            } else {
              setEditState((prev) => ({ ...prev, name: false }));
            }
          })}
        >
          <Flex gap={mantineTheme.spacing.sm} align='center'>
            <TextInput {...nameForm.getInputProps('name')} placeholder='Unnamed module' autoFocus />
            <Button type='submit' loading={moduleQuery.isLoading}>
              Save
            </Button>
          </Flex>
        </form>
      ) : (
        <Flex gap={mantineTheme.spacing.sm} align='baseline'>
          <Title>{moduleQuery.module?.name ?? 'Unnamed module'}</Title>
          <ActionIcon onClick={() => setEditState((prev) => ({ ...prev, name: true }))}>
            <IconPencil />
          </ActionIcon>
        </Flex>
      )}
      <Title order={3}>Sources:</Title>
      <Button onClick={() => setSourceSelectorModalIsOpen(true)}>Add Source</Button>
      <Stack spacing='xs'>
        {moduleQuery.module?.sources.map((source) => (
          <Card key={source.id} shadow='sm' p='sm'>
            <SourceRow
              imageHref={source.image_href || undefined}
              label={source.label ?? ''}
              handleDelete={() =>
                deleteSourceFromModule({ supabaseClient, moduleId: source.id }).then(() => refetchQuery())
              }
            />
          </Card>
        ))}
      </Stack>
      <SourceSelectorModal
        open={sourceSelectorModalIsOpen}
        onClose={() => {
          setSourceSelectorModalIsOpen(false);
        }}
        onConfirm={(payload: { type_id: string; playlist_uri?: string }) => {
          if (moduleId) {
            addSourceToModule({
              supabaseClient,
              module_id: moduleId,
              ...payload,
            }).then(() => {
              refetchQuery();
            });
          }
        }}
      />
    </>
  );
};
