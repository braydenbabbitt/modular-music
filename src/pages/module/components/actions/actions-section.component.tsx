import { Button, Flex, SimpleGrid, Title, useMantineTheme } from '@mantine/core';
import { useState } from 'react';
import { useSupabase } from '../../../../services/supabase/client/client';
import {
  ActionType,
  addActionToModule,
  deleteActionFromModule,
} from '../../../../services/supabase/modules/actions.api';
import { FetchedModuleAction } from '../../../../services/supabase/modules/modules.api';
import { jsonParseWithType } from '../../../../utils/custom-json-encoder';
import { ActionItem } from './action-item.component';
import { ActionSelectionOnSubmitArgs, ActionSelectorModal } from './action-selector-modal.component';

type ActionsSectionsProps = {
  actions: FetchedModuleAction[];
  refetchActions: () => void;
  moduleId: string;
};

export const ActionsSection = ({ actions, refetchActions, moduleId }: ActionsSectionsProps) => {
  const supabaseClient = useSupabase();
  const mantineTheme = useMantineTheme();
  const [actionSelectorModalIsOpen, setActionSelectorModalIsOpen] = useState(false);

  return (
    <section css={{ marginTop: mantineTheme.spacing.md }}>
      <Flex align='center' justify='space-between'>
        <Title order={3}>Actions:</Title>
        <Button css={{ marginTop: mantineTheme.spacing.sm }} onClick={() => setActionSelectorModalIsOpen(true)}>
          Add Action
        </Button>
      </Flex>
      <SimpleGrid
        css={{ marginTop: mantineTheme.spacing.md }}
        cols={4}
        breakpoints={[
          { maxWidth: 'xl', cols: 3, spacing: 'md' },
          { maxWidth: 'lg', cols: 2, spacing: 'md' },
          { maxWidth: 'md', cols: 2, spacing: 'sm' },
          { maxWidth: 'sm', cols: 1, spacing: 'sm' },
        ]}
      >
        {actions.map((action) => (
          <ActionItem
            key={action.id}
            imageHref={action.image_href}
            label={action.label}
            handleDelete={() =>
              deleteActionFromModule({ supabaseClient, actionId: action.id }).then(() => refetchActions())
            }
          />
        ))}
      </SimpleGrid>
      <ActionSelectorModal
        open={actionSelectorModalIsOpen}
        onClose={() => setActionSelectorModalIsOpen(false)}
        onConfirm={({ values, label, image_href, sources }: ActionSelectionOnSubmitArgs) => {
          const actionType = jsonParseWithType<ActionType>(values.actionType);
          if (moduleId && actionType) {
            addActionToModule({
              supabaseClient,
              sources,
              module_id: moduleId,
              type_id: actionType.id,
              label,
              image_href,
            }).then(() => {
              refetchActions();
            });
          }
        }}
      />
    </section>
  );
};
