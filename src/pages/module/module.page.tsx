import { useEffect, useState } from 'react';
import { ActionIcon, Button, Center, Flex, Loader, TextInput, Title, useMantineTheme, SimpleGrid } from '@mantine/core';
import { useNavigate, useParams } from 'react-router-dom';
import { IconArrowLeft, IconPencil } from '@tabler/icons';
import { editModule, getModuleData, GetModuleDataResponse } from '../../services/supabase/modules/modules.api';
import { useSupabase } from '../../services/supabase/client/client';
import { useForm } from '@mantine/form';
import { useAuth } from '../../services/auth/auth.provider';
import { SourceSelectorModal } from './components/source-selector-modal.component';
import { SourceItem } from './components/source-item.component';
import {
  addLikedTracksSourceToModule,
  addRecentlyPlayedSourceToModule,
  addUserPlaylistSourceToModule,
  deleteSourceFromModule,
  RecentlyPlayedOptions,
  UserPlaylistOptions,
  UsersLikedTracksOptions,
} from '../../services/supabase/modules/sources.api';
import { SOURCE_TYPE_IDS } from '../../services/supabase/constants';

export type AddSourceToModuleConfirmation = {
  type_id: string;
  options: {
    userLikedTracks?: UsersLikedTracksOptions;
    userPlaylist?: UserPlaylistOptions;
    userRecentlyPlayed?: RecentlyPlayedOptions;
  };
};

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
      <SimpleGrid
        cols={4}
        breakpoints={[
          { maxWidth: 'xl', cols: 3, spacing: 'md' },
          { maxWidth: 'lg', cols: 2, spacing: 'md' },
          { maxWidth: 'md', cols: 2, spacing: 'sm' },
          { maxWidth: 'sm', cols: 1, spacing: 'sm' },
        ]}
      >
        {moduleQuery.module?.sources.map((source) => {
          console.log({ source });
          return (
            <SourceItem
              key={source.id}
              imageHref={source.options['image_href'] || undefined}
              label={source.options.label ?? ''}
              handleDelete={() =>
                deleteSourceFromModule({ supabaseClient, moduleId: source.id }).then(() => refetchQuery())
              }
            />
          );
        })}
      </SimpleGrid>
      <Button onClick={() => setSourceSelectorModalIsOpen(true)}>Add Source</Button>
      <SourceSelectorModal
        open={sourceSelectorModalIsOpen}
        onClose={() => {
          setSourceSelectorModalIsOpen(false);
        }}
        onConfirm={({ type_id, options }: AddSourceToModuleConfirmation) => {
          if (moduleId) {
            switch (type_id) {
              case SOURCE_TYPE_IDS.USER_LIKED_TRACKS:
                if (options.userLikedTracks) {
                  addLikedTracksSourceToModule({
                    supabaseClient,
                    module_id: moduleId,
                    options: options.userLikedTracks,
                  }).then(() => refetchQuery());
                }
                break;
              case SOURCE_TYPE_IDS.USER_PLAYLIST:
                if (options.userPlaylist) {
                  addUserPlaylistSourceToModule({
                    supabaseClient,
                    module_id: moduleId,
                    options: options.userPlaylist,
                  }).then(() => refetchQuery());
                }
                break;
              case SOURCE_TYPE_IDS.USER_RECENTLY_LISTENED:
                if (options.userRecentlyPlayed) {
                  addRecentlyPlayedSourceToModule({
                    supabaseClient,
                    module_id: moduleId,
                    options: options.userRecentlyPlayed,
                  }).then(() => refetchQuery());
                }
                break;
            }
          }
        }}
      />
    </>
  );
};
