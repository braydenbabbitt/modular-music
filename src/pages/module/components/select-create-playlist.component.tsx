import { Avatar, Button, FileButton, Group, Loader, Stack, Text, Textarea, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconPlus } from '@tabler/icons';
import { useEffect, useRef, useState } from 'react';
import { createPlaylist } from '../../../services/spotify/spotify.api';
import imageCompression from 'browser-image-compression';
import { useSpotifyToken } from '../../../services/spotify/spotify-token.provider';

type SelectCreatePlaylistProps = {
  onCreate: (playlistId: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
};

export const SelectCreatePlaylist = ({ onCreate, onCancel, isLoading }: SelectCreatePlaylistProps) => {
  const spotifyToken = useSpotifyToken();
  const resetRef = useRef<() => void>(null);
  const [showLoader, setShowLoader] = useState(isLoading ?? false);
  const form = useForm<{
    name: string;
    description: string;
    imageFile: File | null;
  }>({
    initialValues: {
      name: '',
      description: '',
      imageFile: null,
    },
    validate: {
      name: (value) => (value ? null : 'Playlist name is required'),
    },
  });

  const [imagePayload, setImagePayload] = useState<string>();
  const imageReader = new FileReader();
  imageReader.onload = () => {
    setImagePayload(imageReader.result?.toString().replace('data:image/jpeg;base64,', ''));
  };

  const handleImageChange = async (payload: File | null) => {
    form.setValues({ imageFile: payload });
    if (payload && payload.size / 1000 > 186) {
      imageReader.readAsDataURL(await imageCompression(payload, { maxSizeMB: 0.2 }));
    } else {
      if (payload) {
        imageReader.readAsDataURL(payload);
      }
    }
  };

  useEffect(() => {
    if (isLoading !== undefined) setShowLoader(isLoading);
  }, [isLoading]);

  if (showLoader) {
    return (
      <Stack align='center'>
        <Loader />
        <Text>Creating playlist...</Text>
      </Stack>
    );
  }

  return (
    <Stack>
      <Text>Create a Playlist</Text>
      <Group noWrap css={{ height: 125 }}>
        <FileButton onChange={handleImageChange} accept='image/jpeg' resetRef={resetRef}>
          {(props) => (
            <Avatar
              {...props}
              radius='md'
              css={{
                cursor: 'pointer',
                height: 125,
                width: 125,
              }}
              src={form.values.imageFile ? URL.createObjectURL(form.values.imageFile) : undefined}
            >
              <IconPlus />
            </Avatar>
          )}
        </FileButton>
        <Stack css={{ height: '100%', flexGrow: 1, padding: 0, margin: 0 }}>
          <TextInput {...form.getInputProps('name')} placeholder='Playlist Name' withAsterisk required />
          <Textarea
            {...form.getInputProps('description')}
            placeholder='Playlist description'
            css={{ flexGrow: 1, marginBottom: 0 }}
          />
        </Stack>
      </Group>
      <Group position='right'>
        <Button color='neutral' variant='outline' onClick={() => onCancel()}>
          Cancel
        </Button>
        <Button
          disabled={!form.values.name}
          onClick={async () => {
            setShowLoader(true);
            const createRes = await createPlaylist(spotifyToken, {
              playlistName: form.values.name,
              playlistDescription: form.values.description,
              playlistImage: imagePayload,
            });
            if (createRes?.data) {
              onCreate(createRes.data.id);
            }
          }}
        >
          Create Playlist
        </Button>
      </Group>
    </Stack>
  );
};
