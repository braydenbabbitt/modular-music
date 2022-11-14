import React, { useState } from 'react';
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
      return removeUserProgram({ userId: 'brayden-test', programId: variables.programId }).then((result) => {
        closeDeleteConfirmation();
        return result;
      });
    },
    mutationKey: [USER_PROGRAM_QUERY_KEY],
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USER_PROGRAM_QUERY_KEY] });
    },
  });

  // State
  const [programModalOpen, setProgramModalOpen] = useState(false);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<Program>();
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
    if (selectedProgram) setSelectedProgram(undefined);
    programForm.reset();
  };
  const handleProgramModalConfirm = (values: { programName: string }) => {
    if (selectedProgram) {
      writeProgramMutation.mutate({ name: values.programName, id: selectedProgram.id });
    } else {
      writeProgramMutation.mutate({ name: values.programName });
    }
  };
  const selectProgram = (id: string) => {
    const newSelectedProgram = programs?.find((item) => item.id === id);
    setSelectedProgram(newSelectedProgram);
    return newSelectedProgram;
  };
  const editProgram = (id: string) => {
    const newSelectedProgram = selectProgram(id);
    setSelectedProgram(newSelectedProgram);
    if (newSelectedProgram) {
      programForm.setValues((values) => ({
        ...values,
        programName: newSelectedProgram.name,
      }));
      openProgramModal();
    } else {
      console.error(`Could not find program with id: ${id}`);
    }
  };
  const openDeleteConfirmation = (id: string) => {
    const newSelectedProgram = selectProgram(id);
    if (newSelectedProgram) {
      setDeleteConfirmationOpen(true);
    } else {
      console.error(`Could not find program with id: ${id}`);
    }
  };
  const closeDeleteConfirmation = () => {
    setDeleteConfirmationOpen(false);
    if (selectedProgram) setSelectedProgram(undefined);
  };
  const removeProgram = () => {
    if (selectedProgram) {
      removeProgramMutation.mutate({ programId: selectedProgram.id });
    }
  };

  // Render
  const programRows = programs?.map((program, index) => {
    return (
      <React.Fragment key={program.id}>
        <Flex justify='space-between' align='center' css={{ padding: `2px 0px` }}>
          <Text>{program.name}</Text>
          <Group spacing='xs'>
            <ActionIcon>
              <IconPencil onClick={() => editProgram(program.id)} />
            </ActionIcon>
            <ActionIcon color='danger' onClick={() => openDeleteConfirmation(program.id)}>
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
      {/* Creation/Edit Modal */}
      <Modal
        opened={programModalOpen}
        onClose={closeProgramModal}
        title={selectedProgram ? 'Edit Program' : 'Create a new program'}
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
            {programForm.isDirty() ? (selectedProgram ? 'Save Program' : 'Create Program') : 'Cancel'}
          </Button>
        </form>
      </Modal>
      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteConfirmationOpen}
        onClose={() => setDeleteConfirmationOpen(false)}
        title='Delete a program'
        centered
      >
        <Stack>
          <Center>
            <Text>
              {selectedProgram
                ? `Are you sure you want to delete "${selectedProgram.name}"?`
                : `Could not find program`}
            </Text>
          </Center>
          <Group grow>
            <Button color='neutral' onClick={closeDeleteConfirmation}>
              Cancel
            </Button>
            <Button loading={isLoading} color='danger' onClick={removeProgram}>
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
};
