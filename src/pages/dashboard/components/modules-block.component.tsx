import { useEffect, useState, Fragment } from 'react';
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
import { IconChevronRight, IconPlus, IconTrash } from '@tabler/icons';
import { theme } from '../../../theme';
import { useForm } from '@mantine/form';
import { createUserModule, deleteModule, getUserModules } from '../../../services/supabase/modules/modules.api';
import { useNavigate } from 'react-router-dom';
import { DatabaseModule } from '../../module/types';
import { useAuth } from '../../../services/auth/auth.provider';

export const ModulesBlock = () => {
  // Theme
  const { colorScheme } = useMantineColorScheme();
  const { session, supabaseClient } = useAuth();
  const mantineTheme = useMantineTheme();
  const [modules, setModules] = useState<DatabaseModule[]>();
  const navigate = useNavigate();

  useEffect(() => {
    if (session?.user?.id) {
      getUserModules({ supabaseClient, userId: session.user.id }).then((res) => {
        if (res) {
          setModules(res ?? undefined);
        }
        setIsLoading(false);
      });
    }
  }, [supabaseClient, session?.user]);

  // State
  const [moduleModalOpen, setModuleModalOpen] = useState(false);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [selectedModule, setSelectedModule] = useState<DatabaseModule>();
  const [isLoading, setIsLoading] = useState(true);
  const moduleForm = useForm({
    initialValues: {
      moduleName: '',
    },
    validate: (values) => ({
      moduleName: values.moduleName ? null : 'Module name is required',
    }),
  });

  // Functions
  const openModuleModal = () => {
    setModuleModalOpen(true);
  };
  const closeModuleModal = () => {
    setModuleModalOpen(false);
    setFormSubmitted(false);
    if (selectedModule) setSelectedModule(undefined);
    moduleForm.reset();
  };
  const selectModule = (id: string) => {
    const newSelectedModule = modules?.find((item) => item.id === id);
    setSelectedModule(newSelectedModule);
    return newSelectedModule;
  };
  const openDeleteConfirmation = (id: string) => {
    const newSelectedModule = selectModule(id);
    if (newSelectedModule) {
      setDeleteConfirmationOpen(true);
    } else {
      console.error(`Could not find module with id: ${id}`);
    }
  };
  const closeDeleteConfirmation = () => {
    setDeleteConfirmationOpen(false);
    setFormSubmitted(false);
    if (selectedModule) setSelectedModule(undefined);
  };
  const removeModule = () => {
    setFormSubmitted(true);
    if (selectedModule && session?.user) {
      deleteModule({ supabaseClient, userId: session?.user?.id, moduleId: selectedModule.id, refetch: true }).then(
        (newModules) => {
          if (newModules) {
            setModules(newModules);
          }
          setIsLoading(false);
          closeDeleteConfirmation();
        },
      );
    }
  };

  // Render
  const moduleRows = modules?.map((module, index) => {
    return (
      <Fragment key={module.id}>
        <Flex align='center' gap={mantineTheme.spacing.sm}>
          <Text
            css={{ padding: mantineTheme.spacing.sm, flexGrow: 1, cursor: 'pointer' }}
            onClick={() => navigate(`/module/${module.id}`)}
          >
            {module.name}
          </Text>
          <Group spacing='xs' css={{ padding: mantineTheme.spacing.sm }} noWrap>
            <ActionIcon color='danger' onClick={() => openDeleteConfirmation(module.id)}>
              <IconTrash />
            </ActionIcon>
            <ActionIcon color='neutral' onClick={() => navigate(`/module/${module.id}`)}>
              <IconChevronRight />
            </ActionIcon>
          </Group>
        </Flex>
        {index < modules.length - 1 && (
          <Divider color={colorScheme === 'dark' ? theme.colors.neutral[90] : theme.colors.neutral[30]} />
        )}
      </Fragment>
    );
  });

  return (
    <>
      <Flex justify='space-between'>
        <Title order={2}>Modules</Title>
        <Button leftIcon={<IconPlus />} onClick={openModuleModal}>
          Create Module
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
        {(!moduleModalOpen && isLoading && (
          <Center>
            <Loader color='neutral' />
          </Center>
        )) ||
          (moduleRows && moduleRows.length > 0 && <Stack spacing={0}>{moduleRows}</Stack>) || (
            <Center css={{ padding: mantineTheme.spacing.sm }}>
              <Text>No Modules created</Text>
            </Center>
          )}
      </Paper>

      {/* Creation/Edit Modal */}
      <Modal opened={moduleModalOpen} onClose={closeModuleModal} title='Create a new module' centered>
        <form
          onSubmit={moduleForm.onSubmit((values) => {
            if (session?.user) {
              setIsLoading(true);
              createUserModule({
                supabaseClient,
                userId: session.user.id,
                name: values.moduleName,
              }).then((newModule) => {
                if (newModule) {
                  navigate(`/module/${newModule.id}`);
                }
                setIsLoading(false);
                closeModuleModal();
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
            {...moduleForm.getInputProps('moduleName')}
            data-autofocus
            placeholder='Module name'
            label='Module name'
          />
          {moduleForm.isDirty() ? (
            <Button type='submit' loading={isLoading || formSubmitted} color='primary'>
              Create Module
            </Button>
          ) : (
            <Button onClick={closeModuleModal} color='neutral'>
              Cancel
            </Button>
          )}
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteConfirmationOpen}
        onClose={() => setDeleteConfirmationOpen(false)}
        title='Delete a module'
        centered
      >
        <Stack>
          <Center>
            <Text>
              {selectedModule ? `Are you sure you want to delete "${selectedModule.name}"?` : `Could not find module`}
            </Text>
          </Center>
          <Group grow>
            <Button color='neutral' onClick={closeDeleteConfirmation}>
              Cancel
            </Button>
            <Button loading={isLoading || formSubmitted} color='danger' onClick={removeModule}>
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
};
