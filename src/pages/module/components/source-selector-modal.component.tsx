import { forwardRef, useEffect, useState } from 'react';
import { Avatar, Button, Group, Loader, Modal, NumberInput, Select, Text, TextInput } from '@mantine/core';
import { getSourceTypes } from '../../../services/supabase/modules/sources.api';
import { useSupabase } from '../../../services/supabase/client/client';
import { useQuery } from 'react-query';
import { getUserPlaylists } from '../../../services/spotify/spotify.api';
import { useSpotifyToken } from '../../../services/auth/auth.provider';
import { SOURCE_TYPE_IDS } from '../../../services/supabase/constants';
import { AddSourceToModuleConfirmation } from '../module.page';

type SourceSelectorModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: (payload: AddSourceToModuleConfirmation) => void;
};

const USER_PLAYLIST_SOURCE_ID = 'e6273f47-8dfc-485c-b594-0bb4dc80a1d3';
const USER_RECENTLY_LISTENED_SOURCE_ID = 'f27db10a-fcb4-430f-aa24-88059e7aedd3';

export const SourceSelectorModal = ({ open, onClose, onConfirm }: SourceSelectorModalProps) => {
  const supabaseClient = useSupabase();
  const spotifyToken = useSpotifyToken();
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [userPlaylistSelection, setUserPlaylistSelection] = useState<string | null>(null);
  const [recentlyPlayedSelection, setRecentlyPlayedSelection] = useState<{
    quantity?: number;
    intervalMultiplier?: number;
  }>({ intervalMultiplier: 1 });
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
    setRecentlyPlayedSelection({});
    reset();
  };

  const handleConfirm = () => {
    if (selectedSource) {
      const selectedSourceData = sourceTypesQuery.data?.find((sourceType) => sourceType.id === selectedSource);
      const userPlaylistData = userPlaylistsQuery.data?.find((playlist) => playlist.id === userPlaylistSelection);
      switch (selectedSource) {
        case SOURCE_TYPE_IDS.USER_PLAYLIST:
          onConfirm({
            type_id: selectedSource,
            options: {
              userPlaylist: {
                playlist_id: userPlaylistData.id,
                playlist_href: userPlaylistData.href,
                label: userPlaylistData.name,
                image_href: userPlaylistData.images[0].url,
              },
            },
          });
          break;
        case SOURCE_TYPE_IDS.USER_RECENTLY_LISTENED:
          onConfirm({
            type_id: selectedSource,
            options: {
              userRecentlyPlayed: {
                label: selectedSourceData?.label ?? "User's Recently Listened",
                quantity: recentlyPlayedSelection.quantity ?? 1,
                interval: recentlyPlayedSelection.intervalMultiplier ?? 1,
                image_href: selectedSourceData?.image_href ?? undefined,
              },
            },
          });
          break;
        case SOURCE_TYPE_IDS.USER_LIKED_TRACKS:
          onConfirm({
            type_id: selectedSource,
            options: {
              userLikedTracks: {
                label: selectedSourceData?.label ?? "User's Liked Tracks",
                image_href: selectedSourceData?.image_href ?? undefined,
              },
            },
          });
          break;
        default:
          onClose();
          break;
      }
    }
    handleClose();
  };

  useEffect(() => {
    userPlaylistsQuery.refetch();
    if (selectedSource !== USER_PLAYLIST_SOURCE_ID && userPlaylistSelection) setUserPlaylistSelection(null);
  }, [selectedSource]);

  const renderAdditionalSelections = () => {
    switch (selectedSource) {
      case USER_PLAYLIST_SOURCE_ID:
        return (
          ((userPlaylistsQuery.isLoading || !userPlaylistsQuery.data) && <Loader />) ||
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
          )) || <></>
        );
      case USER_RECENTLY_LISTENED_SOURCE_ID:
        return (
          <Group>
            <NumberInput
              value={recentlyPlayedSelection.quantity}
              onChange={(value) => setRecentlyPlayedSelection((prev) => ({ ...prev, quantity: value }))}
            />
            <Select
              label='Interval'
              placeholder='Select an interval'
              value={recentlyPlayedSelection.intervalMultiplier?.toString()}
              onChange={(value) =>
                setRecentlyPlayedSelection((prev) => ({
                  ...prev,
                  intervalMultiplier: value === null ? undefined : parseInt(value),
                }))
              }
              data={[
                { value: '1', label: 'days' },
                { value: '7', label: 'weeks' },
                { value: '30', label: 'months' },
                { value: '365', label: 'years' },
              ]}
            />
          </Group>
        );
      default:
        return <></>;
    }
  };

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
          {renderAdditionalSelections()}
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
