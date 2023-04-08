import {
  Accordion,
  Avatar,
  Button,
  Group,
  Modal,
  Title,
  useMantineTheme,
  Text,
  Stack,
  Center,
  Loader,
} from '@mantine/core';
import { IconCheck, IconChevronRight } from '@tabler/icons';
import { ReactNode, useEffect, useState } from 'react';
import { QueryObserverResult } from 'react-query';
import { GetModuleDataResponse } from '../../../services/supabase/modules/modules.api';
import { ActionsSection } from '../components/actions/actions-section.component';
import { OutputSection } from '../components/output/output-section.component';
import { SourceSection } from '../components/sources/sources-section.component';

type CreateSteps = 'sources' | 'actions' | 'output' | null;

type CreateModuleModalProps = {
  open: boolean;
  onClose: () => void;
  onComplete: () => Promise<void>;
  data: GetModuleDataResponse | undefined;
  refetch: () => void;
  moduleId: string;
  title?: string;
  initialValues?: {
    name?: string;
  };
  userPlaylists: any[];
  refetchUserPlaylists: () => Promise<QueryObserverResult<any[], unknown>>;
};

const getLastEnabledStep = (data: GetModuleDataResponse | undefined): CreateSteps => {
  if (data?.actions.length) {
    return 'output';
  } else if (data?.sources.length) {
    return 'actions';
  }
  return 'sources';
};

export const CreateModuleModal = ({
  open,
  onClose,
  onComplete,
  data,
  refetch,
  moduleId,
  title = 'Create Module',
  userPlaylists,
  refetchUserPlaylists,
}: CreateModuleModalProps) => {
  const mantineTheme = useMantineTheme();
  // const [enabledSteps, setEnabledSteps] = useState(new Set<CreateSteps>(['sources']));
  const [step, setStep] = useState<CreateSteps>(getLastEnabledStep(data));
  const [isCompleting, setIsCompleting] = useState(false);

  useEffect(() => {
    if (!step) {
      setStep(getLastEnabledStep(data));
    }
  }, [data]);

  useEffect(() => {
    if (!open) setIsCompleting(false);
  }, [open]);

  return (
    <Modal opened={open} onClose={onClose} title={title} overflow='inside' fullScreen>
      <Accordion
        value={step}
        onChange={(newValue: CreateSteps) => setStep(newValue)}
        css={{ borderRadius: mantineTheme.radius.md, overflow: 'hidden' }}
        styles={{
          chevron: {
            '&[data-rotate]': {
              transform: 'rotate(90deg)',
            },
          },
        }}
        chevron={<IconChevronRight />}
      >
        <Accordion.Item value='sources'>
          <Accordion.Control>
            <AccordionLabel
              label='Select Sources'
              enabled={step === 'sources'}
              complete={!!data?.sources.length && step !== 'sources'}
              icon={
                <Text size='xl' weight='lighter'>
                  1
                </Text>
              }
            />
          </Accordion.Control>
          <Accordion.Panel>
            <Stack>
              <SourceSection sources={data?.sources ?? []} refetchSources={refetch} moduleId={moduleId} hideTitle />
              {!!data?.sources.length && (
                <Button fullWidth onClick={() => setStep('actions')}>
                  Next
                </Button>
              )}
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item value='actions'>
          <Accordion.Control disabled={!data?.sources.length}>
            <AccordionLabel
              label='Configure Actions'
              enabled={step === 'actions'}
              complete={!!data?.actions.length && step !== 'actions'}
              icon={
                <Text size='xl' weight='lighter'>
                  2
                </Text>
              }
            />
          </Accordion.Control>
          <Accordion.Panel>
            <Stack>
              <ActionsSection actions={data?.actions ?? []} refetchActions={refetch} moduleId={moduleId} hideTitle />
              {!!data?.actions.length && (
                <Button fullWidth onClick={() => setStep('output')}>
                  Next
                </Button>
              )}
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item value='output' css={{ border: 'none' }}>
          <Accordion.Control disabled={!data?.actions.length}>
            <AccordionLabel
              label='Set Up Output'
              enabled={step === 'output'}
              complete={!!data && !!data.output}
              icon={
                <Text size='xl' weight='lighter'>
                  3
                </Text>
              }
            />
          </Accordion.Control>
          <Accordion.Panel>
            <Stack>
              <OutputSection
                output={data?.output}
                refetchOutput={refetch}
                moduleId={moduleId}
                hideTitle
                userPlaylists={userPlaylists}
                refetchUserPlaylists={refetchUserPlaylists}
              />
              <Button
                onClick={() => {
                  setIsCompleting(true);
                  onComplete();
                }}
                loading={isCompleting}
                disabled={!data?.output}
              >
                Finish Module
              </Button>
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
      {/* <Group position='right'>
          <Button variant='outline' color='neutral'>
            Cancel
          </Button>
          <Button>Create</Button>
        </Group> */}
    </Modal>
  );
};

type AccordionLabelProps = {
  label: string;
  enabled: boolean;
  complete: boolean;
  icon: ReactNode;
};

const AccordionLabel = ({ label, enabled, complete, icon }: AccordionLabelProps) => {
  return (
    <Group noWrap>
      <Avatar
        color={enabled || complete ? 'primary' : 'neutral'}
        variant={complete ? 'gradient' : 'filled'}
        radius='xl'
        css={{
          '.mantine-Avatar-placeholder': {
            transition: 'background-color 0.3s',
          },
        }}
      >
        {(complete && <IconCheck />) || icon}
      </Avatar>
      <Title order={3} weight='bolder'>
        {label}
      </Title>
    </Group>
  );
};
