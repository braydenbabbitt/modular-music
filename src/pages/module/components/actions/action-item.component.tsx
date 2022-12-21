import { Avatar, Card, Flex, Group, useMantineTheme, Text, ActionIcon } from '@mantine/core';
import { IconX } from '@tabler/icons';

type ActionItemProps = {
  imageHref: string;
  label: string;
  handleDelete: () => void;
};

export const ActionItem = ({ imageHref, label, handleDelete }: ActionItemProps) => {
  const mantineTheme = useMantineTheme();

  return (
    <Card shadow='sm' p='sm' css={{ flexGrow: 1 }}>
      <Flex gap={mantineTheme.spacing.sm} align='center' justify='space-between'>
        <Group noWrap>
          <Avatar src={imageHref} size='lg' radius='md' />
          <Text>{label}</Text>
        </Group>
        <ActionIcon color='danger' onClick={handleDelete}>
          <IconX />
        </ActionIcon>
      </Flex>
    </Card>
  );
};
