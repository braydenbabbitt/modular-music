import React, { useEffect, useState } from 'react';
import {
  ActionIcon,
  Autocomplete,
  Button,
  Center,
  Flex,
  Loader,
  NativeSelect,
  Select,
  Text,
  TextInput,
  Title,
  useMantineTheme,
} from '@mantine/core';
import { useNavigate, useParams } from 'react-router-dom';
import { IconArrowLeft, IconPencil } from '@tabler/icons';
import { DatabaseProgram } from './types';
import { editProgram, getProgram } from '../../services/supabase/programs/programs.api';
import { useSupabase } from '../../services/supabase/client/client';
import { useForm } from '@mantine/form';
import { useAuth } from '../../services/auth/auth.provider';
import { getBaseSources } from '../../services/supabase/programs/sources.api';

export const ProgramPage = () => {
  const mantineTheme = useMantineTheme();
  const { programId } = useParams();
  const supabaseClient = useSupabase();
  const { user } = useAuth();
  const navigate = useNavigate();
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
  const [baseSource, setBaseSource] = useState<string | null>(null);
  const [sourceOptions, setSourceOptions] = useState<{ id: string; label: string; value: string }[]>([]);

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

    getBaseSources({ supabaseClient }).then((sources) => {
      const options = sources?.map((source) => ({
        id: source.id,
        label: source.label,
        value: source.label,
      }));
      setSourceOptions(options ?? []);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nameForm.setValues, programId, supabaseClient, setSourceOptions]);

  if (programQuery.isLoading && !programQuery.program) {
    return (
      <Center>
        <Loader />
      </Center>
    );
  }

  return (
    <>
      <Button leftIcon={<IconArrowLeft />} variant='subtle' onClick={() => navigate(-1)} color='primary'>
        Back to Dashboard
      </Button>
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
                  setProgramQuery({
                    program: newProgram,
                    isLoading: false,
                  });
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
      {sourceOptions && sourceOptions.length > 0 && (
        <Select
          placeholder='Select a source'
          data={sourceOptions}
          nothingFound='No sources found'
          value={baseSource}
          onChange={setBaseSource}
          searchable
          clearable
          filter={(value, item) => {
            if (value.length === 0) {
              return true;
            }
            return item.label?.toLowerCase().includes(value.toLowerCase().trim()) ?? false;
          }}
        />
      )}
    </>
  );
};
