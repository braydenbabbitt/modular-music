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

export type Program = {
  id: string;
  name: string;
  created_at: number;
  edited_at?: number;
};

export const ProgramsBlock = () => {
  const { colorScheme } = useMantineColorScheme();
  const mantineTheme = useMantineTheme();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [programModalOpen, setProgramModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedProgramId, setSelectedProgramId] = useState<string>();
  const programForm = useForm({
    initialValues: {
      programName: '',
    },
    validate: (values) => ({
      programName: values.programName ? null : 'Program name is required',
    }),
  });

  const openProgramModal = () => {
    setProgramModalOpen(true);
  };

  const closeProgramModal = () => {
    setProgramModalOpen(false);
    if (selectedProgramId) setSelectedProgramId(undefined);
    programForm.reset();
  };

  const handleProgramModalConfirm = (values: { programName: string }) => {
    setLoading(true);
    if (selectedProgramId) {
      writeProgram(values.programName, selectedProgramId);
    } else {
      writeProgram(values.programName);
    }
  };

  const removeProgram = (id: string) => {
    removeUserProgram({ userId: 'brayden-test', programId: id }).then((result) => setPrograms(result));
  };

  const writeProgram = (name: string, id?: string) => {
    writeUserProgram({ userId: 'brayden-test', name, programId: id }).then((result) => {
      setPrograms(result);
      setLoading(false);
      closeProgramModal();
    });
  };

  const editProgram = (id: string) => {
    setSelectedProgramId(id);
    const previousName = programs.find((program) => program.id === id)?.name;
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

  useEffect(() => {
    getUserPrograms({ userId: 'brayden-test' }).then((programs) => {
      setPrograms(programs);
      setLoading(false);
    });
  }, []);

  const programRows = programs.map((program, index) => {
    return (
      <React.Fragment key={program.id}>
        <Flex justify='space-between' align='center' css={{ padding: `2px 0px` }}>
          <Text>{program.name}</Text>
          <Group spacing='xs'>
            <ActionIcon>
              <IconPencil onClick={() => editProgram(program.id)} />
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
        {(loading && (
          <Center>
            <Loader />
          </Center>
        )) ||
          (programRows.length > 0 && <Stack spacing='xs'>{programRows}</Stack>) || (
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
            autoFocus
            data-autofocus
            placeholder='Program name'
            label='Program name'
          />
          <Button type='submit' loading={loading} color={programForm.isDirty() ? 'primary' : 'neutral'}>
            {programForm.isDirty() ? (selectedProgramId ? 'Save Program' : 'Create Program') : 'Cancel'}
          </Button>
        </form>
      </Modal>
    </>
  );
};
