import {
  Button,
  Center,
  Group,
  Loader,
  Select,
  Stack,
  useMantineTheme,
  Text,
  Avatar,
  NumberInput,
  ButtonProps,
  Divider,
  Modal,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { forwardRef, ReactNode, useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import { useAuth } from '../../../../services/auth/auth.provider';
import { getUserPlaylists } from '../../../../services/spotify/spotify.api';
import { SOURCE_TYPE_IDS } from '../../../../services/supabase/constants';
import { getSourceTypes, ModuleSourceOptions, SourceType } from '../../../../services/supabase/modules/sources.api';
import { DeepPartial, useTypedJSONEncoding } from 'den-ui';
import dayjs from 'dayjs';
import { useSpotifyToken } from '../../../../services/spotify/spotify-token.provider';

type RecentlyListenedValues = {
  quantity?: number;
  interval: string;
};

export type SourceSelectionFormValues = {
  sourceType: string;
  userPlaylist: string;
  recentlyListened: RecentlyListenedValues;
};

export type SourceSelectionOnSubmitArgs = {
  values: SourceSelectionFormValues;
  label: string;
  image_href: string;
  options: ModuleSourceOptions;
};

type SourceSelectionFormProps = {
  initValues?: DeepPartial<SourceSelectionFormValues>;
  onSubmit: (payload: SourceSelectionOnSubmitArgs) => void;
  horizontal?: boolean;
  buttonLabel?: string;
  buttonVariant?: ButtonProps['variant'];
  cancelButtonLabel?: string;
  onCancel?: () => void;
  hideLabels?: boolean;
};

export const SourceSelectionForm = ({
  initValues,
  onSubmit,
  horizontal = false,
  buttonLabel = 'Add Source',
  buttonVariant,
  cancelButtonLabel,
  onCancel,
  hideLabels,
}: SourceSelectionFormProps) => {
  const { supabaseClient, user } = useAuth();
  const spotifyToken = useSpotifyToken();
  const mantineTheme = useMantineTheme();
  const { parseTypedJSON: parseSourceType, stringifyTypedJSON: stringifySourceType } =
    useTypedJSONEncoding<SourceType>();
  const { parseTypedJSON: parseObject, stringifyTypedJSON: stringifyObject } =
    useTypedJSONEncoding<Record<string, any>>();
  const sourceTypesQuery = useQuery('source-types', () => getSourceTypes({ supabaseClient }), {
    refetchOnWindowFocus: false,
  });
  const userPlaylistsQuery = useQuery(
    'user-playlists',
    async () => {
      if (parseSourceType(form.values.sourceType)?.id === SOURCE_TYPE_IDS.USER_PLAYLIST) {
        return getUserPlaylists(spotifyToken);
      }
    },
    {
      refetchOnWindowFocus: false,
    },
  );
  const isNewUser = user ? dayjs(new Date()).diff(user?.created_at, 'd') < 31 : false;
  const [showNewUserModal, setShowNewUserModal] = useState(false);

  const form = useForm<SourceSelectionFormValues>({
    initialValues: {
      sourceType: initValues?.sourceType ?? '',
      userPlaylist: initValues?.userPlaylist ?? '',
      recentlyListened: {
        quantity: initValues?.recentlyListened?.quantity,
        interval: initValues?.recentlyListened?.interval ?? '1',
      },
    },
    validate: {
      sourceType: (value) => (value ? null : 'Please select a source type'),
      userPlaylist: (value, values) =>
        parseSourceType(values.sourceType)?.id === SOURCE_TYPE_IDS.USER_PLAYLIST
          ? value
            ? null
            : 'Please select a playlist'
          : null,
      recentlyListened: {
        quantity: (value: number | undefined, values: any) => {
          if (value === undefined) return null;
          const typedValues = values as SourceSelectionFormValues;
          const isRequired = parseSourceType(typedValues.sourceType)?.id === SOURCE_TYPE_IDS.USER_RECENTLY_LISTENED;
          const daysCalc = value * parseInt(typedValues.recentlyListened.interval);
          const isOutOfRange = daysCalc > 31 || daysCalc < 1;
          if (isRequired) {
            if (isOutOfRange) {
              return 'Enter a time between 1 day and 1 month';
            } else if (value === undefined) {
              return 'Enter a time';
            }
          }
          return null;
        },
        interval: (value, values: any) => {
          const typedValues = values as SourceSelectionFormValues;
          return parseSourceType(typedValues.sourceType)?.id === SOURCE_TYPE_IDS.USER_RECENTLY_LISTENED
            ? value
              ? null
              : 'Please select an interval'
            : null;
        },
      },
    },
    validateInputOnChange: true,
  });

  const renderAdditionalSelections = () => {
    const showTimeLimitError = !form.isValid('recentlyListened.quantity') && form.isDirty('recentlyListened.quantity');
    const showTimeRequiredError =
      (!form.isValid('recentlyListened.quantity') || !form.isValid('recentlyListened.interval')) &&
      form.isDirty('recentlyListened.quantity');
    switch (parseSourceType(form.values.sourceType)?.id) {
      case SOURCE_TYPE_IDS.USER_PLAYLIST:
        return (
          ((userPlaylistsQuery.isLoading || !userPlaylistsQuery.data) && (
            <Center>
              <Loader />
            </Center>
          )) ||
          (userPlaylistsQuery.data && userPlaylistsQuery.data.length > 0 && (
            <Select
              {...form.getInputProps('userPlaylist')}
              css={{ width: horizontal ? '50%' : 'auto' }}
              placeholder='Select a playlist'
              data={userPlaylistsQuery.data.map((playlist) => ({
                image: playlist.images[0]?.url ?? 'playlist-icon@512.png',
                label: playlist.name,
                value: stringifyObject(playlist) ?? '',
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
      case SOURCE_TYPE_IDS.USER_RECENTLY_LISTENED:
        return (
          <>
            <Group noWrap spacing={horizontal ? 'md' : 'xs'} css={{ width: horizontal ? '50%' : 'auto' }}>
              <NumberInput
                hideControls
                {...form.getInputProps('recentlyListened.quantity', { withError: false })}
                css={{ lineHeight: 2 }}
                label={hideLabels ? undefined : 'Quantity'}
                withAsterisk={!hideLabels}
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
                label={hideLabels ? undefined : 'Interval'}
                withAsterisk={!hideLabels}
                error={
                  showTimeLimitError ||
                  (!form.isValid('recentlyListened.interval') && form.isDirty('recentlyListened.interval'))
                }
                data={[
                  { value: '1', label: 'days' },
                  { value: '7', label: 'weeks' },
                  { value: '30', label: 'months' },
                ]}
              />
            </Group>
            {(showTimeLimitError || showTimeRequiredError) && (
              <Text size='xs' color='red' css={{ marginTop: `-${mantineTheme.spacing.sm}px` }}>
                {showTimeLimitError ? 'Enter a time between 1 day and 1 month' : 'Enter a quantity'}
              </Text>
            )}
          </>
        );
      default:
        return <></>;
    }
  };

  const getSourceOptions = (): ModuleSourceOptions => {
    switch (parseSourceType(form.values.sourceType)?.id) {
      case SOURCE_TYPE_IDS.USER_PLAYLIST:
        return {
          playlist_id: JSON.parse(form.values.userPlaylist).id,
          playlist_href: JSON.parse(form.values.userPlaylist).href,
        };
      case SOURCE_TYPE_IDS.USER_RECENTLY_LISTENED:
        return {
          quantity: form.values.recentlyListened.quantity!,
          interval: parseInt(form.values.recentlyListened.interval),
        };
      default:
        return {};
    }
  };

  const handleSubmit = () => {
    if (form.values.sourceType) {
      onSubmit({
        values: form.values,
        label: parseObject(form.values.userPlaylist)?.name || parseSourceType(form.values.sourceType)?.label,
        image_href:
          parseObject(form.values.userPlaylist)?.images[0]?.url || parseSourceType(form.values.sourceType)?.image_href,
        options: getSourceOptions(),
      });
      if (isNewUser) {
        setShowNewUserModal(true);
      }
      return;
    }
    showNotification({
      color: 'danger',
      title: 'Error',
      message: 'Could not find selected source type from fetched source types',
    });
  };

  useEffect(() => {
    userPlaylistsQuery.refetch();
  }, [form.values.sourceType]);

  useEffect(() => {
    if (initValues && sourceTypesQuery.isFetched && userPlaylistsQuery.isFetched) {
      const newSourceType = sourceTypesQuery.data?.find((item) => item.id === initValues?.sourceType);
      const newPlaylist = userPlaylistsQuery.data?.find((item) => item.id === initValues?.userPlaylist);
      if (newSourceType) {
        const newValues = {
          sourceType: stringifySourceType(newSourceType),
          userPlaylist: newPlaylist ? stringifyObject(newPlaylist) : undefined,
          recentlyListened: {
            interval: initValues?.recentlyListened?.interval ?? '',
            quantity: initValues?.recentlyListened?.quantity,
          },
        };
        form.setValues(newValues);
      }
    }
  }, [initValues, sourceTypesQuery.isFetched, userPlaylistsQuery.isFetched]);

  return (
    <>
      {(sourceTypesQuery.isLoading && (
        <Center>
          <Loader />
        </Center>
      )) || (
        <>
          <StackGroupConverter horizontal={horizontal}>
            {sourceTypesQuery.data && sourceTypesQuery.data.length > 0 && (
              <Select
                {...form.getInputProps('sourceType')}
                css={{
                  lineHeight: 2,
                  width: horizontal
                    ? parseSourceType(form.values.sourceType) &&
                      parseSourceType(form.values.sourceType)?.id !== SOURCE_TYPE_IDS.USER_LIKED_TRACKS
                      ? '50%'
                      : '100%'
                    : 'auto',
                }}
                label={hideLabels ? undefined : 'Source Type'}
                withAsterisk={!hideLabels}
                placeholder='Select a source type'
                data={sourceTypesQuery.data.map((source) => ({
                  value: stringifySourceType(source) ?? '',
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
            {!horizontal && <Divider />}
          </StackGroupConverter>
          <Group position='center' noWrap>
            {onCancel && (
              <Button
                variant='outline'
                color='neutral'
                fullWidth
                onClick={() => {
                  form.reset();
                  onCancel();
                }}
              >
                {cancelButtonLabel || 'Cancel'}
              </Button>
            )}
            <Button
              variant={buttonVariant}
              onClick={() => {
                if (
                  isNewUser &&
                  parseSourceType(form.values.sourceType)?.id === SOURCE_TYPE_IDS.USER_RECENTLY_LISTENED
                ) {
                  setShowNewUserModal(true);
                  return;
                }
                handleSubmit();
              }}
              fullWidth
              disabled={initValues ? !form.isDirty() : !form.isValid()}
            >
              {buttonLabel}
            </Button>
          </Group>
          {user && (
            <Modal
              title={<Title order={3}>{"Looks like you're a new user!"}</Title>}
              centered
              opened={showNewUserModal}
              onClose={() => setShowNewUserModal(false)}
            >
              <div css={{ display: 'flex', flexDirection: 'column', gap: mantineTheme.spacing.md }}>
                <Text>
                  Only songs that you have listend to after creating your Modular Music account (
                  {new Date(user.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}) will be used.
                </Text>
                <Button
                  color='primary'
                  onClick={() => {
                    setShowNewUserModal(false);
                    handleSubmit();
                  }}
                >
                  Continue
                </Button>
              </div>
            </Modal>
          )}
        </>
      )}
    </>
  );
};

export const UserPlaylistSelectItem = forwardRef<HTMLDivElement, { image: string; label: string; value: string }>(
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

type StackGroupConverterProps = {
  children: ReactNode;
  horizontal?: boolean;
};

const StackGroupConverter = ({ children, horizontal = false }: StackGroupConverterProps) => {
  if (horizontal) {
    return (
      <Group noWrap align='end'>
        {children}
      </Group>
    );
  }
  return <Stack spacing='md'>{children}</Stack>;
};
