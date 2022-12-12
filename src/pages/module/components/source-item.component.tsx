import { ActionIcon, Avatar, Card, Flex, Group, Text, useMantineTheme } from '@mantine/core';
import { IconX } from '@tabler/icons';
import { PlaylistIcon } from '../../../assets/icons/playlist-icon.component';
import { theme } from '../../../theme';

type SourceItemProps = {
  imageHref?: string;
  label: string;
  handleDelete: () => void;
};

export const SourceItem = ({ imageHref, label, handleDelete }: SourceItemProps) => {
  const mantineTheme = useMantineTheme();

  return (
    <Card shadow='sm' p='sm'>
      <Flex gap={mantineTheme.spacing.sm} align='center' justify='space-between'>
        <Group noWrap>
          <Avatar src={imageHref} size='lg' radius='md'>
            <PlaylistIcon
              fill={mantineTheme.colorScheme === 'dark' ? theme.colors.neutral[20] : theme.colors.neutral[80]}
            />
          </Avatar>
          <Text>{label}</Text>
        </Group>
        <ActionIcon color='danger' onClick={handleDelete}>
          <IconX />
        </ActionIcon>
      </Flex>
    </Card>
  );
};
