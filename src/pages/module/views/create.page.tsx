import { Accordion, Avatar, Button, Group, Modal, Title, useMantineTheme, Text, Stack } from '@mantine/core';
import { IconCheck, IconChevronRight, IconNumber1, IconNumber2 } from '@tabler/icons';
import { ReactNode, useEffect, useState } from 'react';
import { GetModuleDataResponse } from '../../../services/supabase/modules/modules.api';
import { ActionsSection } from '../components/actions/actions-section.component';
import { SourceSelectionForm } from '../components/sources/source-selection-form.component';
import { SourceSection } from '../components/sources/sources-section.component';

type CreateSteps = 'sources' | 'actions' | 'output' | null;

type CreateModuleModalProps = {
  open: boolean;
  onClose: () => void;
  data: GetModuleDataResponse | undefined;
  refetch: () => void;
  moduleId: string;
  title?: string;
  initialValues?: {
    name?: string;
  };
};

export const CreateModuleModal = ({
  open,
  onClose,
  data,
  refetch,
  moduleId,
  title = 'Create Module',
}: CreateModuleModalProps) => {
  const mantineTheme = useMantineTheme();
  const [step, setStep] = useState<CreateSteps>();
  const [enabledSteps, setEnabledSteps] = useState(new Set<CreateSteps>(['sources']));

  useEffect(() => {
    if (data?.sources.length) setEnabledSteps((prev) => prev.add('actions'));
    if (data?.actions.length && enabledSteps.has('actions')) setEnabledSteps((prev) => prev.add('output'));
  }, [data]);

  return (
    <Modal opened={open} onClose={onClose} title={title} overflow='inside' fullScreen>
      <div css={{ maxWidth: '80%', margin: '0 auto' }}>
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
                complete={enabledSteps.has('sources') && step !== 'sources'}
                icon={
                  <Text size='xl' weight='lighter'>
                    1
                  </Text>
                }
              />
            </Accordion.Control>
            <Accordion.Panel>
              <Stack>
                <SourceSection sources={data?.sources ?? []} refetchSources={refetch} moduleId={moduleId} />
                {enabledSteps.has('actions') && (
                  <Button fullWidth onClick={() => setStep('actions')}>
                    Next
                  </Button>
                )}
              </Stack>
            </Accordion.Panel>
          </Accordion.Item>
          <Accordion.Item value='actions'>
            <Accordion.Control disabled={!enabledSteps.has('actions')}>
              <AccordionLabel
                label='Configure Actions'
                enabled={step === 'actions'}
                complete={enabledSteps.has('output') && step !== 'actions'}
                icon={
                  <Text size='xl' weight='lighter'>
                    2
                  </Text>
                }
              />
            </Accordion.Control>
            <Accordion.Panel>
              <Stack>
                <ActionsSection actions={data?.actions ?? []} refetchActions={refetch} moduleId={moduleId} />
                {enabledSteps.has('output') && (
                  <Button fullWidth onClick={() => setStep('output')}>
                    Next
                  </Button>
                )}
              </Stack>
            </Accordion.Panel>
          </Accordion.Item>
          <Accordion.Item value='output' css={{ border: 'none' }}>
            <Accordion.Control disabled={!enabledSteps.has('output')}>
              <AccordionLabel
                label='Set Up Output'
                enabled={step === 'output'}
                complete={!!data && 'output' in data}
                icon={
                  <Text size='xl' weight='lighter'>
                    3
                  </Text>
                }
              />
            </Accordion.Control>
            <Accordion.Panel>Test</Accordion.Panel>
          </Accordion.Item>
        </Accordion>
        {/* <Group position='right'>
          <Button variant='outline' color='neutral'>
            Cancel
          </Button>
          <Button>Create</Button>
        </Group> */}
      </div>
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
