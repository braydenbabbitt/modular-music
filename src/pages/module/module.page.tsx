import { Button, Center, Divider, Group, Loader, Stack, Text } from '@mantine/core';
import { useUser } from '@supabase/auth-helpers-react';
import { IconCalendarTime, IconPlayerPlay } from '@tabler/icons';
import { useState } from 'react';
import { useQuery } from 'react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { BackButton } from '../../components/buttons/back-button.component';
import { useSpotifyToken } from '../../services/auth/auth.provider';
import { getUserPlaylists } from '../../services/spotify/spotify.api';
import { useSupabase } from '../../services/supabase/client/client';
import { editModule, getModuleData, setModuleComplete } from '../../services/supabase/modules/modules.api';
import { formatScheduleText } from '../../utils/schedule-helpers';
import { ModuleNameField } from './components/module-name-field.component';
import { ModuleScheduleModal } from './components/module-schedule-modal.component';
import { CreateModuleModal } from './views/create.component';
import { EditModule } from './views/edit-module.component';

export const ModulePage = () => {
  const supabaseClient = useSupabase();
  const { moduleId } = useParams();
  const user = useUser();
  const navigate = useNavigate();
  const spotifyToken = useSpotifyToken();
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
  const { data: userPlaylists, refetch: refetchUserPlaylists } = useQuery(
    ['spotify-playlists', user?.id],
    () => getUserPlaylists(spotifyToken!),
    {
      enabled: !!spotifyToken,
    },
  );

  const [isRunning, setIsRunning] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  const { nextRunString, scheduleString } = formatScheduleText(data?.schedule);

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
      <Group position='apart' css={{ alignItems: 'end' }}>
        <Stack align='start'>
          <BackButton label='Back to dashboard' to='/dashboard' />
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
            disabled={isRunning}
          />
        </Stack>
        <Stack align='end' justify='space-between'>
          <Group>
            <Button
              leftIcon={<IconPlayerPlay />}
              loading={isRunning}
              onClick={async () => {
                setIsRunning(true);
                // console.time('execute-module');
                // const functionResponse = await supabaseClient.functions.invoke('execute-module', {
                //   body: `"${moduleId}"`,
                // });
                // console.timeEnd('execute-module');
                console.time('fetch-recently-listened');
                const functionResponse = await supabaseClient.functions.invoke('fetch-recently-listened', {
                  body: `"${moduleId}"`,
                });
                console.timeEnd('fetch-recently-listened');
                console.log({ functionResponse });
                setIsRunning(false);
              }}
              disabled={data.sources.length === 0 || data.actions.length === 0 || data.output === undefined}
            >
              {isRunning ? 'In progress' : 'Run Module'}
            </Button>
            <Button leftIcon={<IconCalendarTime />} color='secondary' onClick={() => setShowScheduleModal(true)}>
              {data.schedule ? 'Edit Schedule' : 'Set Schedule'}
            </Button>
          </Group>
          {data.schedule && (
            <Stack spacing='xs' align='end'>
              {nextRunString && (
                <Text size='sm' css={{ lineHeight: 0.75 }}>
                  {nextRunString}
                </Text>
              )}
              {scheduleString && (
                <Text size='sm' css={{ lineHeight: 0.75 }}>
                  {scheduleString}
                </Text>
              )}
            </Stack>
          )}
        </Stack>
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
        userPlaylists={userPlaylists ?? []}
        refetchUserPlaylists={refetchUserPlaylists}
      />
      <ModuleScheduleModal
        open={showScheduleModal}
        onClose={async () => {
          setShowScheduleModal(false);
          await refetch();
        }}
        moduleId={moduleId}
        initSchedule={data.schedule}
      />
    </Stack>
  );
};
