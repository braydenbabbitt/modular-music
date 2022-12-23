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
import { useState } from 'react';
import { useQuery } from 'react-query';
import { useLayoutSize } from '../../../../hooks/use-layout-size';
import { useSupabase } from '../../../../services/supabase/client/client';
import { ACTION_TYPE_IDS } from '../../../../services/supabase/constants';
import { ActionType, getActionTypes } from '../../../../services/supabase/modules/actions.api';
import { SourceType } from '../../../../services/supabase/modules/sources.api';
import { jsonParseWithType } from '../../../../utils/custom-json-encoder';
import { convertRecentlyPlayedToDescription } from '../../../../utils/description-converters';
import { CustomCreateDatabaseModuleSource } from '../../types';
import { SourceSelectionForm, SourceSelectionOnSubmitArgs } from '../sources/source-selection-form.component';

export type ActionSelectionOnSubmitArgs = {
  values: ActionFormValues;
  label: string;
  image_href: string;
  sources?: CustomCreateDatabaseModuleSource[];
};

type ActionSelectorModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: (payload: ActionSelectionOnSubmitArgs) => void;
};

type ActionFormValues = {
  actionType: string;
  filterSources: CustomCreateDatabaseModuleSource[];
};

export const ActionSelectorModal = ({ open, onClose, onConfirm }: ActionSelectorModalProps) => {
  const supabaseClient = useSupabase();
  const layoutSize = useLayoutSize();
  const { data: actionTypes, isLoading: actionTypesIsLoading } = useQuery(['action-types'], () =>
    getActionTypes({ supabaseClient }),
  );
  const [isAddingSource, setIsAddingSource] = useState(false);
  const form = useForm<ActionFormValues>({
    initialValues: {
      actionType: '',
      filterSources: [],
    },
    validate: {
      actionType: (value) => (value ? null : 'Please select an action type'),
      filterSources: (value: CustomCreateDatabaseModuleSource[], values: ActionFormValues) =>
        jsonParseWithType<ActionType>(values.actionType)?.id === ACTION_TYPE_IDS.FILTER
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
    console.log('handleConfirm', { form });
    onConfirm({
      values: form.values,
      label: jsonParseWithType<ActionType>(form.values.actionType)!.label,
      image_href: jsonParseWithType<ActionType>(form.values.actionType)!.image_href,
      sources: form.values.filterSources,
    });
    handleClose();
  };

  const handleAddFilterSource = ({ values, label, image_href, options }: SourceSelectionOnSubmitArgs) => {
    const sourceType = jsonParseWithType<SourceType>(values.sourceType);
    if (sourceType) {
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
    switch (jsonParseWithType<ActionType>(form.values.actionType)?.id) {
      case ACTION_TYPE_IDS.FILTER:
        return (
          <>
            <Text>
              {form.values.filterSources.length === 0 ? 'Select sources for your filter:' : 'Filter sources:'}
            </Text>
            {form.values.filterSources.length > 0 && (
              <Stack spacing='xs'>
                {form.values.filterSources.map((source, index) => (
                  <>
                    <SourceRow
                      key={index}
                      source={source}
                      handleDelete={() =>
                        form.setFieldValue(
                          'filterSources',
                          form.values.filterSources.filter((item, itemIndex) => itemIndex !== index),
                        )
                      }
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
                buttonLabel='Save source'
                onCancel={() => setIsAddingSource(false)}
                hideLabels
              />
            )) || (
              <Button onClick={() => setIsAddingSource(true)} leftIcon={<IconPlus />} variant='subtle'>
                {`Add${form.values.filterSources.length > 0 ? ' Another' : ''} Source`}
              </Button>
            )}
          </>
        );
      default:
        return <></>;
    }
  };

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
                  value: JSON.stringify(action),
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
            {isAddingSource || (
              <Button type='submit' fullWidth disabled={!form.isValid()}>
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
    source.options.quantity && source.options.interval
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
