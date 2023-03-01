import { Interpolation, Theme } from '@emotion/react';
import { Avatar, Flex, Group, useMantineTheme, Text, ActionIcon, Stack } from '@mantine/core';
import { IconGripVertical, IconPencil, IconX } from '@tabler/icons';
import { DraggableProvided } from 'react-beautiful-dnd';
import { useQuery } from 'react-query';
import { useSupabase } from '../../../../services/supabase/client/client';
import { ACTION_TYPE_IDS, SOURCE_TYPE_IDS } from '../../../../services/supabase/constants';
import { getActionSources } from '../../../../services/supabase/modules/actions.api';
import { convertRecentlyPlayedToDescription } from '../../../../utils/description-converters';

type ActionItemProps = {
  imageHref: string;
  label: string;
  actionId: string;
  typeId: string;
  provided: DraggableProvided;
  handleEdit: () => void;
  handleDelete: () => void;
  disabled?: boolean;
};

export const ActionItem = ({
  imageHref,
  label,
  actionId,
  typeId,
  provided,
  handleEdit,
  handleDelete,
  disabled,
}: ActionItemProps) => {
  const supabaseClient = useSupabase();
  const mantineTheme = useMantineTheme();
  const isFilter = typeId === ACTION_TYPE_IDS.FILTER;
  const { data, isLoading } = useQuery(
    [actionId, 'action-sources'],
    () => getActionSources({ supabaseClient, actionId }),
    {
      enabled: typeId === ACTION_TYPE_IDS.FILTER,
    },
  );

  const rowItemStyles: Interpolation<Theme> = {
    padding: `${mantineTheme.spacing.sm}px 0`,
  };

  return (
    <li
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      css={[
        { listStyle: 'none', borderBottom: `1px solid ${mantineTheme.fn.themeColor('neutral')}` },
        disabled ? { opacity: 0.5 } : {},
      ]}
    >
      <Flex align='center'>
        <IconGripVertical size={mantineTheme.spacing.md} />
        <Stack css={{ width: '100%' }} spacing={0}>
          <Flex css={{ padding: `0 ${mantineTheme.spacing.sm}px` }}>
            <Group
              css={[
                rowItemStyles,
                {
                  flexGrow: 1,
                },
              ]}
              noWrap
            >
              <Avatar size='sm' src={imageHref} />
              <Stack spacing={0}>
                <Text css={{ userSelect: 'none' }}>{label}</Text>
                {isFilter &&
                  (isLoading ? null : (
                    <Text size='sm' opacity={0.7} css={{ userSelect: 'none' }}>{`Exclusions: ${data
                      ?.map((source) =>
                        source.type_id === SOURCE_TYPE_IDS.USER_RECENTLY_LISTENED &&
                        source.options.quantity &&
                        source.options.interval
                          ? `Recently Listened (${convertRecentlyPlayedToDescription(
                              source.options.quantity,
                              source.options.interval,
                            )})`
                          : source.label,
                      )
                      .join(', ')}`}</Text>
                  ))}
              </Stack>
            </Group>
            {!disabled && (
              <Group css={{ flexShrink: 1 }} noWrap>
                <ActionIcon css={rowItemStyles} onClick={handleEdit}>
                  <IconPencil />
                </ActionIcon>
                <ActionIcon css={rowItemStyles} color='danger' onClick={handleDelete}>
                  <IconX />
                </ActionIcon>
              </Group>
            )}
          </Flex>
        </Stack>
      </Flex>
    </li>
  );
};
