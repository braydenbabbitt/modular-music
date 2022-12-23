import { ActionIcon, Avatar, Card, Flex, Group, Stack, Text, useMantineTheme } from '@mantine/core';
import { IconX } from '@tabler/icons';
import { PlaylistIcon } from '../../../../assets/icons/playlist-icon.component';
import { theme } from '../../../../theme';

type SourceItemProps = {
  imageHref?: string;
  label: string;
  description?: string;
  handleDelete: () => void;
};

export const SourceItem = ({ imageHref, label, description, handleDelete }: SourceItemProps) => {
  const mantineTheme = useMantineTheme();

  return (
    <Card shadow='sm' p='sm' css={{ flexGrow: 1 }}>
      <Flex gap={mantineTheme.spacing.sm} align='center' justify='space-between'>
        <Group noWrap>
          <Avatar src={imageHref} size='lg' radius='md'>
            <PlaylistIcon
              fill={mantineTheme.colorScheme === 'dark' ? theme.colors.neutral[20] : theme.colors.neutral[80]}
            />
          </Avatar>
          <Stack spacing={0}>
            <Text>{label}</Text>
            {description && (
              <Text size='sm' opacity={0.7}>
                {description}
              </Text>
            )}
          </Stack>
        </Group>
        <ActionIcon color='danger' onClick={handleDelete}>
          <IconX />
        </ActionIcon>
      </Flex>
    </Card>
  );
};
