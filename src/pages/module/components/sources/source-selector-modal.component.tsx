import { forwardRef, useEffect, useState } from 'react';
import { Avatar, Button, Group, Loader, Modal, NumberInput, Select, Stack, Text, useMantineTheme } from '@mantine/core';
import { getSourceTypes } from '../../../../services/supabase/modules/sources.api';
import { useSupabase } from '../../../../services/supabase/client/client';
import { useQuery } from 'react-query';
import { getUserPlaylists } from '../../../../services/spotify/spotify.api';
import { useSpotifyToken } from '../../../../services/auth/auth.provider';
import { SOURCE_TYPE_IDS } from '../../../../services/supabase/constants';
import { AddSourceToModuleConfirmation } from '../../module.page';
import { useLayoutSize } from '../../../../hooks/use-layout-size';
import { useForm } from '@mantine/form';

type SourceSelectorModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: (payload: AddSourceToModuleConfirmation) => void;
};

const USER_PLAYLIST_SOURCE_ID = 'e6273f47-8dfc-485c-b594-0bb4dc80a1d3';
const USER_RECENTLY_LISTENED_SOURCE_ID = 'f27db10a-fcb4-430f-aa24-88059e7aedd3';

type RecentlyListenedValues = {
  quantity?: number;
  interval: string;
};

type FormValues = {
  sourceType: string;
  userPlaylist: string;
  recentlyListened: RecentlyListenedValues;
};

export const SourceSelectorModal = ({ open, onClose, onConfirm }: SourceSelectorModalProps) => {
  const supabaseClient = useSupabase();
  const spotifyToken = useSpotifyToken();
  const mantineTheme = useMantineTheme();
  const layoutSize = useLayoutSize();
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const sourceTypesQuery = useQuery('module-sources', () => getSourceTypes({ supabaseClient }));
  const userPlaylistsQuery = useQuery('user-playlists', () => {
    if (selectedSource === USER_PLAYLIST_SOURCE_ID && spotifyToken) {
      return getUserPlaylists(spotifyToken.token);
    }
  });

  const form = useForm<FormValues>({
    initialValues: {
      sourceType: '',
      userPlaylist: '',
      recentlyListened: {
        quantity: undefined,
        interval: '1',
      },
    },
    validate: {
      sourceType: (value) => (value ? null : 'Please select a source type'),
      userPlaylist: (value) =>
        selectedSource === USER_PLAYLIST_SOURCE_ID ? (value ? null : 'Please select a playlist') : null,
      recentlyListened: {
        quantity: (value: number, values: any) => {
          const typedValues = values as FormValues;
          const isRequired = selectedSource === USER_RECENTLY_LISTENED_SOURCE_ID;
          const daysCalc = value * parseInt(typedValues.recentlyListened.interval);
          const isOutOfRange = daysCalc > 365 || daysCalc < 1;
          if (isRequired) {
            if (isOutOfRange) {
              return 'Enter a time less than 1 year';
            } else if (value === undefined) {
              return 'Enter a time';
            }
          }
          return null;
        },
        interval: (value) =>
          selectedSource === USER_RECENTLY_LISTENED_SOURCE_ID ? (value ? null : 'Please select an interval') : null,
      },
    },
    validateInputOnChange: true,
  });

  const reset = () => {
    setSelectedSource(null);
    form.reset();
  };

  const handleClose = () => {
    onClose();
    reset();
  };

  const handleConfirm = () => {
    if (selectedSource) {
      const selectedSourceData = sourceTypesQuery.data?.find((sourceType) => sourceType.id === selectedSource);
      const userPlaylistData = userPlaylistsQuery.data?.find((playlist) => playlist.id === form.values.userPlaylist);
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
                quantity: form.values.recentlyListened.quantity!,
                interval: parseInt(form.values.recentlyListened.interval),
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
  }, [selectedSource]);

  const renderAdditionalSelections = () => {
    const showTimeLimitError = !form.isValid('recentlyListened.quantity') && form.isDirty('recentlyListened.quantity');
    const showTimeRequiredError =
      (!form.isValid('recentlyListened.quantity') || !form.isValid('recentlyListened.interval')) &&
      form.isDirty('recentlyListened.quantity');
    switch (form.values.sourceType) {
      case USER_PLAYLIST_SOURCE_ID:
        return (
          ((userPlaylistsQuery.isLoading || !userPlaylistsQuery.data) && <Loader />) ||
          (userPlaylistsQuery.data && userPlaylistsQuery.data.length > 0 && (
            <Select
              {...form.getInputProps('userPlaylist')}
              placeholder='Select a playlist'
              data={userPlaylistsQuery.data.map((playlist) => ({
                image: playlist.images[0]?.url ?? 'playlist-icon@512.png',
                label: playlist.name,
                value: playlist.id,
              }))}
              itemComponent={UserPlaylistSelectItem}
              nothingFound='No playlist found'
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
          <>
            <Group noWrap spacing='xs'>
              <NumberInput
                hideControls
                {...form.getInputProps('recentlyListened.quantity', { withError: false })}
                css={{ lineHeight: 2 }}
                label='Quantity'
                withAsterisk
                min={1}
                max={Math.floor(365 / parseInt(form.values.recentlyListened.interval))}
                error={
                  showTimeLimitError ||
                  (!form.isValid('recentlyListened.quantity') && form.isDirty('recentlyListened.quantity'))
                }
                placeholder='Quantity'
              />
              <Select
                {...form.getInputProps('recentlyListened.interval')}
                css={{ lineHeight: 2 }}
                placeholder='Select an interval'
                label='Interval'
                withAsterisk
                error={
                  showTimeLimitError ||
                  (!form.isValid('recentlyListened.interval') && form.isDirty('recentlyListened.interval'))
                }
                data={[
                  { value: '1', label: 'days' },
                  { value: '7', label: 'weeks' },
                  { value: '30', label: 'months' },
                  { value: '365', label: 'years' },
                ]}
              />
            </Group>
            {(showTimeLimitError || showTimeRequiredError) && (
              <Text size='xs' color='red' css={{ marginTop: `-${mantineTheme.spacing.sm}px` }}>
                {showTimeLimitError ? 'Enter a time between 1 day and 1 year' : 'Enter a quantity'}
              </Text>
            )}
          </>
        );
      default:
        return <></>;
    }
  };

  return (
    <Modal
      opened={open}
      onClose={handleClose}
      fullScreen={layoutSize === 'mobile'}
      centered
      title='Add Source to Module'
      size='350px'
      css={{
        label: {
          opacity: 0.7,
        },
      }}
    >
      {(sourceTypesQuery.isLoading && <Loader />) || (
        <form onSubmit={form.onSubmit(handleConfirm)}>
          <Stack spacing='md'>
            {sourceTypesQuery.data && sourceTypesQuery.data.length > 0 && (
              <Select
                {...form.getInputProps('sourceType')}
                css={{ lineHeight: 2 }}
                label='Source Type'
                withAsterisk
                onChange={(value) => {
                  setSelectedSource(value ?? '');
                  form.setFieldValue('sourceType', value ?? '');
                }}
                placeholder='Select a source type'
                data={sourceTypesQuery.data.map((source) => ({
                  value: source.id,
                  label: source.label,
                }))}
                nothingFound='No sources found'
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
            <Group
              css={{
                width: '100%',
                paddingTop: mantineTheme.spacing?.sm,
                borderTop: `1px solid ${mantineTheme.colors['neutral'][7]}`,
              }}
            >
              <Button type='submit' css={{ flexGrow: 1 }} disabled={!form.isValid()}>
                Add Source
              </Button>
            </Group>
          </Stack>
        </form>
      )}
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
