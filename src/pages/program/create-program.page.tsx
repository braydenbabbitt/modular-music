import React, { useEffect, useState } from 'react';
import { ActionIcon, Button, Center, Flex, Loader, Text, TextInput, Title, useMantineTheme } from '@mantine/core';
import { useParams } from 'react-router-dom';
import { IconPencil } from '@tabler/icons';
import { DatabaseProgram } from './types';
import { editProgram, getProgram } from '../../services/supabase/programs/programs.api';
import { useSupabase } from '../../services/supabase/client/client';
import { useForm } from '@mantine/form';
import { useAuth } from '../../services/auth/auth.provider';

export const CreateProgramPage = () => {
  const mantineTheme = useMantineTheme();
  const { programId } = useParams();
  const supabaseClient = useSupabase();
  const { user } = useAuth();
  const [programQuery, setProgramQuery] = useState<{
    program?: DatabaseProgram;
    isLoading: boolean;
  }>({
    isLoading: true,
  });
  const [editState, setEditState] = useState({
    name: false,
  });
  const nameForm = useForm({
    initialValues: {
      name: programQuery.program?.name,
    },
    validate: (values) => ({
      name: values.name ? null : 'Program name is required',
    }),
  });

  useEffect(() => {
    if (programId) {
      getProgram({ supabaseClient, programId }).then((program) => {
        if (program) {
          setProgramQuery({
            program,
            isLoading: false,
          });
          nameForm.setValues({
            name: program.name,
          });
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nameForm.setValues, programId, supabaseClient]);

  const sources = [
    {
      id: 1,
      label: "User's Liked Tracks",
    },
    {
      id: 2,
      label: 'User Playlist',
    },
  ];

  if (programQuery.isLoading && !programQuery.program) {
    return (
      <Center>
        <Loader />
      </Center>
    );
  }

  return (
    <>
      {editState.name ? (
        <form
          onSubmit={nameForm.onSubmit((values) => {
            setProgramQuery((prev) => ({
              ...prev,
              isLoading: true,
            }));
            if (user && programId) {
              editProgram({ supabaseClient, programId, name: values.name ?? '' }).then((newProgram) => {
                if (newProgram) {
                  setProgramQuery((prev) => ({
                    program: newProgram,
                    isLoading: false,
                  }));
                  setEditState((prev) => ({ ...prev, name: false }));
                }
              });
            } else {
              setEditState((prev) => ({ ...prev, name: false }));
            }
          })}
        >
          <Flex gap={mantineTheme.spacing.sm} align='center'>
            <TextInput {...nameForm.getInputProps('name')} placeholder='Unnamed program' autoFocus />
            <Button type='submit' loading={programQuery.isLoading}>
              Save
            </Button>
          </Flex>
        </form>
      ) : (
        <Flex gap={mantineTheme.spacing.sm} align='baseline'>
          <Title>{programQuery.program?.name ?? 'Unnamed program'}</Title>
          <ActionIcon onClick={() => setEditState((prev) => ({ ...prev, name: true }))}>
            <IconPencil />
          </ActionIcon>
        </Flex>
      )}
      <Text>Program Source:</Text>
    </>
  );
};
