import React from 'react';
import {
  ActionIcon,
  Button,
  Center,
  Divider,
  Flex,
  Group,
  Paper,
  Stack,
  Text,
  Title,
  useMantineColorScheme,
  useMantineTheme,
} from '@mantine/core';
import { IconPencil, IconPlus, IconTrash } from '@tabler/icons';
import { theme } from '../../../theme';

export type Program = {
  id: string;
  name: string;
};

type ProgramsBlockProps = {
  programs: Program[];
  removeProgram: (id: string) => void;
  addProgram: () => void;
};

export const ProgramsBlock = ({ programs, removeProgram, addProgram }: ProgramsBlockProps) => {
  const { colorScheme } = useMantineColorScheme();
  const mantineTheme = useMantineTheme();
  const programRows = programs.map((program, index) => {
    return (
      <React.Fragment key={program.id}>
        <Flex justify='space-between' align='center' css={{ padding: `2px 0px` }}>
          <Text>{program.name}</Text>
          <Group spacing='xs'>
            <ActionIcon>
              <IconPencil />
            </ActionIcon>
            <ActionIcon color='danger' onClick={() => removeProgram(program.id)}>
              <IconTrash />
            </ActionIcon>
          </Group>
        </Flex>
        {index < programs.length - 1 && (
          <Divider color={colorScheme === 'dark' ? theme.colors.neutral[90] : theme.colors.neutral[30]} />
        )}
      </React.Fragment>
    );
  });

  return (
    <>
      <Flex justify='space-between'>
        <Title order={2}>Programs</Title>
        <Button leftIcon={<IconPlus />} onClick={() => addProgram()}>
          Create Program
        </Button>
      </Flex>
      <Paper
        css={{
          backgroundColor: colorScheme === 'dark' ? theme.colors.neutral[80] : theme.colors.neutral[10],
          marginTop: `12px`,
          padding: mantineTheme.spacing.sm,
        }}
        radius='md'
        shadow='lg'
      >
        {(programRows.length > 0 && <Stack spacing='xs'>{programRows}</Stack>) || (
          <Center>
            <Text>No Programs created</Text>
          </Center>
        )}
      </Paper>
    </>
  );
};
