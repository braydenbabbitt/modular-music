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
import { IconChevronRight, IconPencil, IconPlus, IconTrash } from '@tabler/icons';
import { theme } from '../../../theme';
import { useForm } from '@mantine/form';
import { createUserProgram, deleteProgram, getUserPrograms } from '../../../services/supabase/programs/programs.api';
import { useSupabase } from '../../../services/supabase/client/client';
import { useAuth } from '../../../services/auth/auth.provider';
import { useNavigate } from 'react-router-dom';
import { DatabaseProgram } from '../../program/types';

export const ProgramsBlock = () => {
  // Theme
  const { colorScheme } = useMantineColorScheme();
  const supabaseClient = useSupabase();
  const { user } = useAuth();
  const mantineTheme = useMantineTheme();
  const [programs, setPrograms] = useState<DatabaseProgram[]>();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.id) {
      getUserPrograms({ supabaseClient, userId: user.id }).then((res) => {
        if (res) {
          setPrograms(res ?? undefined);
        }
        setIsLoading(false);
      });
    }
  }, [supabaseClient, user]);

  // State
  const [programModalOpen, setProgramModalOpen] = useState(false);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<DatabaseProgram>();
  const [isLoading, setIsLoading] = useState(true);
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
    setFormSubmitted(false);
    if (selectedProgram) setSelectedProgram(undefined);
    programForm.reset();
  };
  const selectProgram = (id: string) => {
    const newSelectedProgram = programs?.find((item) => item.id === id);
    setSelectedProgram(newSelectedProgram);
    return newSelectedProgram;
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
    setFormSubmitted(false);
    if (selectedProgram) setSelectedProgram(undefined);
  };
  const removeProgram = () => {
    setFormSubmitted(true);
    if (selectedProgram && user) {
      deleteProgram({ supabaseClient, userId: user.id, programId: selectedProgram.id, refetch: true }).then(
        (newPrograms) => {
          if (newPrograms) {
            setPrograms(newPrograms);
          }
          setIsLoading(false);
          closeDeleteConfirmation();
        },
      );
    }
  };

  // Render
  const programRows = programs?.map((program, index) => {
    return (
      <React.Fragment key={program.id}>
        <Flex align='center' gap={mantineTheme.spacing.sm}>
          <Text
            css={{ padding: mantineTheme.spacing.sm, flexGrow: 1, cursor: 'pointer' }}
            onClick={() => navigate(`/program/${program.id}`)}
          >
            {program.name}
          </Text>
          <Group spacing='xs' css={{ padding: mantineTheme.spacing.sm }}>
            <ActionIcon color='danger' onClick={() => openDeleteConfirmation(program.id)}>
              <IconTrash />
            </ActionIcon>
            <ActionIcon color='neutral' onClick={() => navigate(`/program/${program.id}`)}>
              <IconChevronRight />
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
        <Button leftIcon={<IconPlus />} onClick={openProgramModal}>
          Create Program
        </Button>
      </Flex>
      <Paper
        css={{
          backgroundColor: colorScheme === 'dark' ? theme.colors.neutral[80] : theme.colors.neutral[10],
          marginTop: `12px`,
        }}
        radius='md'
        shadow='lg'
      >
        {(!programModalOpen && isLoading && (
          <Center>
            <Loader color='neutral' />
          </Center>
        )) ||
          (programRows && programRows.length > 0 && <Stack spacing={0}>{programRows}</Stack>) || (
            <Center>
              <Text>No Programs created</Text>
            </Center>
          )}
      </Paper>

      {/* Creation/Edit Modal */}
      <Modal opened={programModalOpen} onClose={closeProgramModal} title='Create a new program' centered>
        <form
          onSubmit={programForm.onSubmit((values) => {
            if (user) {
              setIsLoading(true);
              createUserProgram({
                supabaseClient,
                userId: user?.id,
                name: values.programName,
              }).then((newProgram) => {
                if (newProgram) {
                  navigate(`/program/${newProgram.id}`);
                }
                setIsLoading(false);
                closeProgramModal();
              });
            }
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
          {programForm.isDirty() ? (
            <Button type='submit' loading={isLoading || formSubmitted} color='primary'>
              Create Program
            </Button>
          ) : (
            <Button onClick={closeProgramModal} color='neutral'>
              Cancel
            </Button>
          )}
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
            <Button loading={isLoading || formSubmitted} color='danger' onClick={removeProgram}>
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
};
