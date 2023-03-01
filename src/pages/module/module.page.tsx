import { Button, Center, Divider, Group, Loader, Stack, useMantineTheme } from '@mantine/core';
import { IconCalendarTime, IconPlayerPlay } from '@tabler/icons';
import { useState } from 'react';
import { useQuery } from 'react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { BackButton } from '../../components/buttons/back-button.component';
import { useSupabase } from '../../services/supabase/client/client';
import { editModule, getModuleData, setModuleComplete } from '../../services/supabase/modules/modules.api';
import { ModuleNameField } from './components/module-name-field.component';
import { ModuleScheduleModal } from './components/module-schedule-modal.component';
import { CreateModuleModal } from './views/create.component';
import { EditModule } from './views/edit-module.component';

export const ModulePage = () => {
  const supabaseClient = useSupabase();
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, refetch } = useQuery(
    ['module', moduleId],
    () => getModuleData({ supabaseClient, moduleId: moduleId! }),
    {
      enabled: !!moduleId,
      onSuccess: (data) => {
        setShowCreateModal(!data.complete);
      },
    },
  );

  const [isRunning, setIsRunning] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  if (!moduleId) {
    return null;
  }

  if (isLoading || !data) {
    return (
      <Center>
        <Loader />
      </Center>
    );
  }

  return (
    <Stack>
      <Group>
        <BackButton label='Back to dashboard' to='/dashboard' />
      </Group>
      <Group position='apart'>
        <ModuleNameField
          onSave={async (newName: string) => {
            if (moduleId) {
              await editModule({
                supabaseClient,
                moduleId,
                name: newName,
              });
              refetch();
            }
          }}
          initialName={data.name}
        />
        <Group>
          <Button
            leftIcon={<IconPlayerPlay />}
            loading={isRunning}
            onClick={() => {
              setIsRunning(true);
              setTimeout(() => {
                setIsRunning(false);
              }, 5000);
            }}
            disabled={data.sources.length === 0 || data.actions.length === 0 || data.output === undefined}
          >
            {isRunning ? 'In progress' : 'Run Module'}
          </Button>
          <Button leftIcon={<IconCalendarTime />} color='secondary' onClick={() => setShowScheduleModal(true)}>
            Set Schedule
          </Button>
        </Group>
      </Group>
      <Divider />
      <EditModule moduleData={data} refetchModuleData={refetch} disableEditing={isRunning} />
      <CreateModuleModal
        open={showCreateModal}
        onClose={() => navigate(-1)}
        onComplete={async () => {
          await setModuleComplete(supabaseClient, moduleId);
          refetch();
        }}
        data={data}
        refetch={refetch}
        moduleId={moduleId}
        title={`Create ${data.name}`}
      />
      <ModuleScheduleModal open={showScheduleModal} onClose={() => setShowScheduleModal(false)} />
    </Stack>
  );
};
