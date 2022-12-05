import { ActionIcon, Avatar, Flex, Group, Text, useMantineTheme } from '@mantine/core';
import { IconTrash } from '@tabler/icons';
import { PlaylistIcon } from '../../../assets/icons/playlist-icon.component';
import { theme } from '../../../theme';

type SourceRowProps = {
  imageHref?: string;
  label: string;
  handleDelete: () => void;
};

export const SourceRow = ({ imageHref, label, handleDelete }: SourceRowProps) => {
  const mantineTheme = useMantineTheme();

  console.log({ imageHref });

  return (
    <Flex gap={mantineTheme.spacing.sm} align='center' justify='space-between'>
      <Group>
        <Avatar src={imageHref} size='lg' radius='md'>
          <PlaylistIcon
            fill={mantineTheme.colorScheme === 'dark' ? theme.colors.neutral[20] : theme.colors.neutral[80]}
          />
        </Avatar>
        <Text>{label}</Text>
      </Group>
      <ActionIcon color='danger' onClick={handleDelete}>
        <IconTrash />
      </ActionIcon>
    </Flex>
  );
};
