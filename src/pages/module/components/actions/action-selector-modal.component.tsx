import {
  Center,
  Loader,
  Modal,
  Text,
  Select,
  Stack,
  Group,
  Button,
  Avatar,
  Flex,
  ActionIcon,
  Divider,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconPlus, IconX } from '@tabler/icons';
import { useTypedJSONEncoding } from 'den-ui';
import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { useLayoutSize } from '../../../../hooks/use-layout-size';
import { ACTION_TYPE_IDS, SOURCE_TYPE_IDS } from '../../../../services/supabase/constants';
import { ActionType, editAction, getActionTypes } from '../../../../services/supabase/modules/actions.api';
import {
  addLikedTracksSource,
  addRecentlyListenedSource,
  addUserPlaylistSource,
  deleteSourceFromModule,
  RecentlyListenedOptions,
  SourceType,
  UserPlaylistOptions,
} from '../../../../services/supabase/modules/sources.api';
import { convertRecentlyPlayedToDescription } from '../../../../utils/description-converters';
import { CustomCreateDatabaseModuleSource } from '../../types';
import { SourceSelectionForm, SourceSelectionOnSubmitArgs } from '../sources/source-selection-form.component';
import { useAuth } from '../../../../services/auth/auth.provider';

export type ActionSelectionOnSubmitArgs = {
  values: ActionFormValues;
  label: string;
  image_href: string;
  sources?: CustomCreateDatabaseModuleSource[];
};

type ActionSelectorModalProps = {
  initValues?: Partial<ActionFormValues>;
  open: boolean;
  actionId?: string;
  refetchActions: () => void;
  onClose: () => void;
  onConfirm: (payload: ActionSelectionOnSubmitArgs) => void;
};

export type ActionFormValues = {
  actionType: string;
  filterSources: CustomCreateDatabaseModuleSource[];
};

export const ActionSelectorModal = ({
  initValues,
  open,
  actionId,
  refetchActions,
  onClose,
  onConfirm,
}: ActionSelectorModalProps) => {
  const { supabaseClient } = useAuth();
  const queryClient = useQueryClient();
  const layoutSize = useLayoutSize();
  const { parseTypedJSON: parseActionType, stringifyTypedJSON: stringifyActionType } =
    useTypedJSONEncoding<ActionType>();
  const { parseTypedJSON: parseSourceType } = useTypedJSONEncoding<SourceType>();
  const { data: actionTypes, isLoading: actionTypesIsLoading } = useQuery(
    ['action-types'],
    () => getActionTypes({ supabaseClient }),
    { refetchOnWindowFocus: false },
  );
  const [isAddingSource, setIsAddingSource] = useState(false);
  const form = useForm<ActionFormValues>({
    initialValues: {
      actionType: '',
      filterSources: initValues?.filterSources ?? [],
    },
    validate: {
      actionType: (value) => (value ? null : 'Please select an action type'),
      filterSources: (value: CustomCreateDatabaseModuleSource[], values: ActionFormValues) =>
        parseActionType(values.actionType)?.id === ACTION_TYPE_IDS.FILTER
          ? value.length > 0
            ? null
            : 'Add at least one source'
          : null,
    },
    validateInputOnChange: true,
  });

  const handleClose = () => {
    setIsAddingSource(false);
    onClose();
    form.reset();
  };

  const handleConfirm = () => {
    const parsedActionType = parseActionType(form.values.actionType)!;
    if (actionId) {
      editAction({
        supabaseClient,
        actionId,
        payload: {
          type_id: parsedActionType.id,
          label: parsedActionType.label,
          image_href: parsedActionType.image_href,
        },
      }).then(() => {
        queryClient.invalidateQueries({ queryKey: [actionId, 'action-sources'] });
        refetchActions();
        handleClose();
      });
    } else {
      onConfirm({
        values: form.values,
        label: parsedActionType.label,
        image_href: parsedActionType.image_href,
        sources: form.values.filterSources,
      });
      handleClose();
    }
  };

  const handleAddFilterSource = ({ values, label, image_href, options }: SourceSelectionOnSubmitArgs) => {
    const sourceType = parseSourceType(values.sourceType);
    if (sourceType) {
      if (actionId) {
        switch (sourceType.id) {
          case SOURCE_TYPE_IDS.USER_LIKED_TRACKS:
            addLikedTracksSource({
              supabaseClient,
              action_id: actionId,
              label,
              image_href,
            });
            break;
          case SOURCE_TYPE_IDS.USER_PLAYLIST:
            addUserPlaylistSource({
              supabaseClient,
              action_id: actionId,
              label,
              image_href,
              options: options as UserPlaylistOptions,
            });
            break;
          case SOURCE_TYPE_IDS.USER_RECENTLY_LISTENED:
            addRecentlyListenedSource({
              supabaseClient,
              action_id: actionId,
              label,
              image_href,
              options: options as RecentlyListenedOptions,
            });
            break;
        }
      }
      form.setFieldValue('filterSources', [
        ...form.values.filterSources,
        {
          type_id: sourceType.id,
          label,
          image_href,
          options,
        },
      ]);
    }
    setIsAddingSource(false);
  };

  const renderAdditionalSelections = () => {
    switch (parseActionType(form.values.actionType)?.id) {
      case ACTION_TYPE_IDS.FILTER:
        return (
          <>
            <Text>
              {form.values.filterSources.length === 0 ? 'Select what you want excluded:' : 'Filter exclusions:'}
            </Text>
            {form.values.filterSources.length > 0 && (
              <Stack spacing='xs'>
                {form.values.filterSources.map((source, index) => (
                  <>
                    <SourceRow
                      key={index}
                      source={source}
                      handleDelete={() => {
                        if (source.id) {
                          deleteSourceFromModule({ supabaseClient, sourceId: source.id });
                        }
                        form.setFieldValue(
                          'filterSources',
                          form.values.filterSources.filter((item, itemIndex) => itemIndex !== index),
                        );
                        refetchActions();
                      }}
                    />
                    {index !== form.values.filterSources.length - 1 && <Divider my={0} size='xs' />}
                  </>
                ))}
              </Stack>
            )}

            {(isAddingSource && (
              <SourceSelectionForm
                onSubmit={handleAddFilterSource}
                horizontal={true}
                buttonLabel='Save exclusion'
                onCancel={() => setIsAddingSource(false)}
                hideLabels
              />
            )) || (
              <Button onClick={() => setIsAddingSource(true)} leftIcon={<IconPlus />} variant='subtle'>
                {`Add${form.values.filterSources.length > 0 ? ' Another' : ''} Exclusion`}
              </Button>
            )}
          </>
        );
      default:
        return <></>;
    }
  };

  useEffect(() => {
    if (initValues?.actionType) {
      form.setFieldValue('actionType', initValues.actionType);
    }
    if (initValues?.filterSources) {
      form.setFieldValue('filterSources', initValues.filterSources);
    }
  }, [initValues]);

  return (
    <Modal opened={open} onClose={handleClose} fullScreen={layoutSize === 'mobile'} centered title='Add a new action:'>
      {(actionTypesIsLoading && (
        <Center>
          <Loader />
        </Center>
      )) || (
        <form onSubmit={form.onSubmit(handleConfirm)}>
          <Stack>
            {actionTypes && actionTypes.length > 0 && (
              <Select
                {...form.getInputProps('actionType')}
                css={{ lineHeight: 2 }}
                label='Action Type'
                withAsterisk
                placeholder='Select an action type'
                data={actionTypes.map((action) => ({
                  value: stringifyActionType(action) ?? '',
                  label: action.label,
                }))}
                nothingFound='No actions found'
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
            <Divider />
            {renderAdditionalSelections()}
            {(parseActionType(form.values.actionType)?.id === ACTION_TYPE_IDS.FILTER && isAddingSource) || (
              <Button
                type='submit'
                fullWidth
                disabled={
                  initValues
                    ? !(
                        form.values.actionType !== initValues.actionType ||
                        form.values.filterSources !== initValues.filterSources
                      ) || form.values.filterSources.length === 0
                    : !form.isValid()
                }
              >
                Save Action
              </Button>
            )}
          </Stack>
        </form>
      )}
    </Modal>
  );
};

type SourceRowProps = {
  source: CustomCreateDatabaseModuleSource;
  handleDelete: () => void;
};

const SourceRow = ({ source, handleDelete }: SourceRowProps) => {
  const description =
    source.options?.quantity && source.options?.interval
      ? convertRecentlyPlayedToDescription(source.options.quantity, source.options.interval)
      : undefined;
  return (
    <Flex align='center' justify='space-between'>
      <Group>
        <Avatar src={source.image_href} />
        <Stack spacing={0}>
          <Text size='sm'>{source.label}</Text>
          <Text size='xs' opacity={0.7}>
            {description}
          </Text>
        </Stack>
      </Group>
      <ActionIcon color='danger' onClick={handleDelete}>
        <IconX />
      </ActionIcon>
    </Flex>
  );
};
