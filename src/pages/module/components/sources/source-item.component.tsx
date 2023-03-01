import { ActionIcon, Avatar, Flex, Group, Paper, Stack, Text, useMantineTheme } from '@mantine/core';
import { IconPencil, IconPlus, IconX } from '@tabler/icons';
import { theme } from '../../../../theme';

type SourceItemProps = {
  imageHref?: string;
  label: string;
  description?: string;
  handleDelete?: () => void;
  handleEdit?: () => void;
  onClick?: () => void;
  disabled?: boolean;
};

export const SourceItem = ({
  imageHref,
  label,
  description,
  handleDelete,
  handleEdit,
  onClick,
  disabled,
}: SourceItemProps) => {
  const mantineTheme = useMantineTheme();

  return (
    <Paper
      shadow='sm'
      p='sm'
      radius='md'
      css={[
        {
          flexGrow: 1,
          cursor: onClick ? 'pointer' : 'auto',
          backgroundColor: mantineTheme.colorScheme === 'dark' ? theme.colors.neutral[80] : theme.colors.neutral[10],
        },
        onClick
          ? {
              ':hover': {
                backgroundColor: mantineTheme.fn.themeColor('neutral'),
              },
            }
          : {},
        disabled ? { opacity: 0.5 } : {},
      ]}
      onClick={onClick}
    >
      <Flex gap={mantineTheme.spacing.sm} align='center' justify='space-between' css={{ height: '100%' }}>
        <Group noWrap spacing={imageHref ? undefined : mantineTheme.spacing.sm}>
          {(imageHref && <Avatar src={imageHref} radius='md' />) || <IconPlus size={30} />}
          <Stack spacing={0}>
            <Text>{label}</Text>
            {description && (
              <Text size='sm' opacity={0.7}>
                {description}
              </Text>
            )}
          </Stack>
        </Group>
        <Group spacing='sm' noWrap>
          {handleEdit && !disabled && (
            <ActionIcon color='neutral' onClick={handleEdit}>
              <IconPencil />
            </ActionIcon>
          )}
          {handleDelete && !disabled && (
            <ActionIcon color='danger' onClick={handleDelete}>
              <IconX />
            </ActionIcon>
          )}
        </Group>
      </Flex>
    </Paper>
  );
};
