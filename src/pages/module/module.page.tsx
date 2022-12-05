import { forwardRef, useEffect, useState } from 'react';
import {
  ActionIcon,
  Avatar,
  Button,
  Center,
  Flex,
  Group,
  Loader,
  Select,
  SelectItem,
  Text,
  TextInput,
  Title,
  useMantineTheme,
} from '@mantine/core';
import { useNavigate, useParams } from 'react-router-dom';
import { IconArrowLeft, IconPencil } from '@tabler/icons';
import { DatabaseModule } from './types';
import { editModule, getModule } from '../../services/supabase/modules/modules.api';
import { useSupabase } from '../../services/supabase/client/client';
import { useForm } from '@mantine/form';
import { useAuth, useSpotifyToken } from '../../services/auth/auth.provider';
import { getBaseSources } from '../../services/supabase/modules/sources.api';
import { getUserPlaylists } from '../../services/spotify/spotify.api';

const USER_PLAYLIST_SOURCE_ID = 'e6273f47-8dfc-485c-b594-0bb4dc80a1d3';

export const ModulePage = () => {
  const mantineTheme = useMantineTheme();
  const { moduleId } = useParams();
  const supabaseClient = useSupabase();
  const { user, session } = useAuth();
  const spotifyToken = useSpotifyToken();
  const navigate = useNavigate();
  const [moduleQuery, setModuleQuery] = useState<{
    module?: DatabaseModule;
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
  const [baseSource, setBaseSource] = useState<string | null>(null);
  const [sourceOptions, setSourceOptions] = useState<SelectItem[]>([]);
  const [userPlaylists, setUserPlaylists] = useState<any[]>([]);
  const [userPlaylistOptions, setUserPlaylistOptions] = useState<
    {
      image: string;
      label: string;
      value: string;
    }[]
  >([]);
  const [userPlaylistSelection, setUserPlaylistSelection] = useState<string | null>(null);

  useEffect(() => {
    if (moduleId) {
      getModule({ supabaseClient, moduleId }).then((module) => {
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

    getBaseSources({ supabaseClient }).then((sources) => {
      const options = sources?.map((source) => ({
        value: source.id,
        label: source.label,
      }));
      setSourceOptions(options ?? []);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nameForm.setValues, moduleId, supabaseClient, setSourceOptions]);

  useEffect(() => {
    if (baseSource === USER_PLAYLIST_SOURCE_ID && userPlaylists.length < 1) {
      if (spotifyToken) {
        getUserPlaylists(spotifyToken).then((playlists) => {
          console.log({ playlists });
          setUserPlaylists(playlists);
        });
      }
    }
  }, [baseSource, spotifyToken, userPlaylists.length]);

  useEffect(() => {
    const newOptions = userPlaylists.map((playlist) => ({
      image: playlist.images[0]?.url ?? 'playlist-icon@512.png',
      label: playlist.name,
      value: playlist.id,
    }));
    setUserPlaylistOptions(newOptions);
  }, [userPlaylists]);

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
              editModule({ supabaseClient, moduleId, name: values.name ?? '' }).then((newModule) => {
                if (newModule) {
                  setModuleQuery({
                    module: newModule,
                    isLoading: false,
                  });
                  setEditState((prev) => ({ ...prev, name: false }));
                }
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
      <Group>
        {sourceOptions && sourceOptions.length > 0 && (
          <Select
            placeholder='Select a source'
            data={sourceOptions}
            nothingFound='No sources found'
            value={baseSource}
            onChange={setBaseSource}
            searchable
            clearable
            filter={(value, item) => {
              if (value.length === 0) {
                return true;
              }
              return item.label?.toLowerCase().includes(value.toLowerCase().trim()) ?? false;
            }}
          />
        )}
        {baseSource === USER_PLAYLIST_SOURCE_ID && userPlaylistOptions.length > 0 && (
          <Select
            placeholder='Select a playlist'
            data={userPlaylistOptions}
            itemComponent={CustomSelectItem}
            nothingFound='No playlist found'
            value={userPlaylistSelection}
            onChange={setUserPlaylistSelection}
            searchable
            clearable
            filter={(value, item) => {
              if (value.length === 0) {
                return true;
              }
              return item.label?.toLowerCase().includes(value.toLowerCase().trim()) ?? false;
            }}
          />
        )}
      </Group>
    </>
  );
};

const CustomSelectItem = forwardRef<HTMLDivElement, { image: string; label: string; value: string }>(
  ({ image, label, value, ...others }: { image: string; label: string; value: string }, ref) => (
    <div ref={ref} {...others}>
      <Group noWrap>
        <Avatar src={image} />
        <Text size='sm'>{label}</Text>
      </Group>
    </div>
  ),
);
CustomSelectItem.displayName = 'SelectItem';
