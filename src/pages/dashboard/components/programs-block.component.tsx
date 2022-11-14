import React, { useEffect, useState } from 'react';
import {
  ActionIcon,
  Button,
  Center,
  Divider,
  Flex,
  Group,
  Loader,
  Modal,
  Paper,
  Stack,
  Text,
  TextInput,
  Title,
  useMantineColorScheme,
  useMantineTheme,
} from '@mantine/core';
import { IconPencil, IconPlus, IconTrash } from '@tabler/icons';
import { theme } from '../../../theme';
import { useForm } from '@mantine/form';
import { getUserPrograms, removeUserProgram, writeUserProgram } from '../../../apis/programs/programs.api';
import { useMutation, useQuery, useQueryClient } from 'react-query';

export type Program = {
  id: string;
  name: string;
  created_at: number;
  edited_at?: number;
};

const USER_PROGRAM_QUERY_KEY = 'user-programs';

export const ProgramsBlock = () => {
  // Theme
  const { colorScheme } = useMantineColorScheme();
  const mantineTheme = useMantineTheme();

  // Query Data
  const queryClient = useQueryClient();
  const { isLoading, data: programs } = useQuery({
    queryKey: [USER_PROGRAM_QUERY_KEY],
    queryFn: () => getUserPrograms({ userId: 'brayden-test' }),
    refetchOnWindowFocus: false,
  });
  const writeProgramMutation = useMutation({
    mutationFn: (variables: { name: string; id?: string }) => {
      return writeUserProgram({ userId: 'brayden-test', name: variables.name, programId: variables.id }).then(
        (result) => {
          closeProgramModal();
          return result;
        },
      );
    },
    mutationKey: [USER_PROGRAM_QUERY_KEY],
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USER_PROGRAM_QUERY_KEY] });
    },
  });
  const removeProgramMutation = useMutation({
    mutationFn: (variables: { programId: string }) => {
      return removeUserProgram({ userId: 'brayden-test', programId: variables.programId });
    },
    mutationKey: [USER_PROGRAM_QUERY_KEY],
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USER_PROGRAM_QUERY_KEY] });
    },
  });

  // State
  const [programModalOpen, setProgramModalOpen] = useState(false);
  const [selectedProgramId, setSelectedProgramId] = useState<string>();
  const programForm = useForm({
    initialValues: {
      programName: '',
    },
    validate: (values) => ({
      programName: values.programName ? null : 'Program name is required',
    }),
  });

  // Functions
  const openProgramModal = () => {
    setProgramModalOpen(true);
  };

  const closeProgramModal = () => {
    setProgramModalOpen(false);
    if (selectedProgramId) setSelectedProgramId(undefined);
    programForm.reset();
  };

  const handleProgramModalConfirm = (values: { programName: string }) => {
    if (selectedProgramId) {
      writeProgramMutation.mutate({ name: values.programName, id: selectedProgramId });
    } else {
      writeProgramMutation.mutate({ name: values.programName });
    }
  };

  const editProgram = (id: string) => {
    setSelectedProgramId(id);
    const previousName = programs?.find((program) => program.id === id)?.name;
    if (previousName) {
      programForm.setValues((values) => ({
        ...values,
        programName: previousName,
      }));
      openProgramModal();
    } else {
      console.error(`Could not find program with id: ${id}`);
    }
  };

  const programRows = programs?.map((program, index) => {
    return (
      <React.Fragment key={program.id}>
        <Flex justify='space-between' align='center' css={{ padding: `2px 0px` }}>
          <Text>{program.name}</Text>
          <Group spacing='xs'>
            <ActionIcon>
              <IconPencil onClick={() => editProgram(program.id)} />
            </ActionIcon>
            <ActionIcon color='danger' onClick={() => removeProgramMutation.mutate({ programId: program.id })}>
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
        <Button leftIcon={<IconPlus />} onClick={() => setProgramModalOpen(true)}>
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
        {(!programModalOpen && isLoading && (
          <Center>
            <Loader color='neutral' />
          </Center>
        )) ||
          (programRows && programRows.length > 0 && <Stack spacing='xs'>{programRows}</Stack>) || (
            <Center>
              <Text>No Programs created</Text>
            </Center>
          )}
      </Paper>
      <Modal
        opened={programModalOpen}
        onClose={closeProgramModal}
        title={selectedProgramId ? 'Edit Program' : 'Create a new program'}
        centered
      >
        <form
          onSubmit={programForm.onSubmit((values) => {
            handleProgramModalConfirm(values);
          })}
          css={{
            display: 'flex',
            flexDirection: 'column',
            gap: mantineTheme.spacing.sm,
          }}
        >
          <TextInput
            {...programForm.getInputProps('programName')}
            data-autofocus
            placeholder='Program name'
            label='Program name'
          />
          <Button type='submit' loading={isLoading} color={programForm.isDirty() ? 'primary' : 'neutral'}>
            {programForm.isDirty() ? (selectedProgramId ? 'Save Program' : 'Create Program') : 'Cancel'}
          </Button>
        </form>
      </Modal>
    </>
  );
};
