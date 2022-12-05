import { forwardRef, useEffect, useState } from 'react';
import { Avatar, Button, Group, Loader, Modal, Select, Text } from '@mantine/core';
import { getSourceTypes } from '../../../services/supabase/modules/sources.api';
import { useSupabase } from '../../../services/supabase/client/client';
import { useQuery } from 'react-query';
import { getUserPlaylists } from '../../../services/spotify/spotify.api';
import { useSpotifyToken } from '../../../services/auth/auth.provider';

type SourceSelectorModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: (payload: {
    type_id: string;
    playlist_id?: string;
    href?: string;
    label?: string;
    image_href?: string;
  }) => void;
};

const USER_PLAYLIST_SOURCE_ID = 'e6273f47-8dfc-485c-b594-0bb4dc80a1d3';

export const SourceSelectorModal = ({ open, onClose, onConfirm }: SourceSelectorModalProps) => {
  const supabaseClient = useSupabase();
  const spotifyToken = useSpotifyToken();
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [userPlaylistSelection, setUserPlaylistSelection] = useState<string | null>(null);
  const sourceTypesQuery = useQuery('module-sources', () => getSourceTypes({ supabaseClient }));
  const userPlaylistsQuery = useQuery('user-playlists', () => {
    if (selectedSource === USER_PLAYLIST_SOURCE_ID && spotifyToken) {
      return getUserPlaylists(spotifyToken);
    }
  });

  const reset = () => {
    setSelectedSource(null);
    setUserPlaylistSelection(null);
  };

  const handleClose = () => {
    onClose();
    reset();
  };

  const handleConfirm = () => {
    if (selectedSource) {
      const selectedSourceData = sourceTypesQuery.data?.find((sourceType) => sourceType.id === selectedSource);
      const userPlaylistData = userPlaylistsQuery.data?.find((playlist) => playlist.id === userPlaylistSelection);
      switch (selectedSource) {
        case USER_PLAYLIST_SOURCE_ID:
          onConfirm({
            type_id: selectedSource,
            playlist_id: userPlaylistData.id,
            href: userPlaylistData.href,
            label: userPlaylistData.name,
            image_href: userPlaylistData.images[0].url,
          });
          break;
        default:
          onConfirm({
            type_id: selectedSource,
            label: selectedSourceData?.label,
          });
          break;
      }
    }
    handleClose();
  };

  useEffect(() => {
    userPlaylistsQuery.refetch();
    if (selectedSource !== USER_PLAYLIST_SOURCE_ID && userPlaylistSelection) setUserPlaylistSelection(null);
  }, [selectedSource]);

  if (userPlaylistsQuery.data) {
    console.log({ userPlaylistsQuery });
  }

  return (
    <Modal opened={open} onClose={handleClose}>
      {(sourceTypesQuery.isLoading && <Loader />) || (
        <Group>
          {sourceTypesQuery.data && sourceTypesQuery.data.length > 0 && (
            <Select
              placeholder='Select a source'
              data={sourceTypesQuery.data.map((source) => ({
                value: source.id,
                label: source.label,
              }))}
              nothingFound='No sources found'
              value={selectedSource}
              onChange={setSelectedSource}
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
          {selectedSource === USER_PLAYLIST_SOURCE_ID &&
            (((userPlaylistsQuery.isLoading || !userPlaylistsQuery.data) && <Loader />) ||
              (userPlaylistsQuery.data && userPlaylistsQuery.data.length > 0 && (
                <Select
                  placeholder='Select a playlist'
                  data={userPlaylistsQuery.data.map((playlist) => ({
                    image: playlist.images[0]?.url ?? 'playlist-icon@512.png',
                    label: playlist.name,
                    value: playlist.id,
                  }))}
                  itemComponent={UserPlaylistSelectItem}
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
              )))}
        </Group>
      )}
      <Button onClick={handleConfirm}>Add Source</Button>
    </Modal>
  );
};

const UserPlaylistSelectItem = forwardRef<HTMLDivElement, { image: string; label: string; value: string }>(
  ({ image, label, ...others }: { image: string; label: string; value: string }, ref) => (
    <div ref={ref} {...others}>
      <Group noWrap>
        <Avatar src={image} />
        <Text size='sm'>{label}</Text>
      </Group>
    </div>
  ),
);
UserPlaylistSelectItem.displayName = 'SelectItem';
