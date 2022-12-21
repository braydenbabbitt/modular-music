import { Button, SimpleGrid, Title, useMantineTheme } from '@mantine/core';
import { useState } from 'react';
import { useSupabase } from '../../../../services/supabase/client/client';
import { deleteActionFromModule } from '../../../../services/supabase/modules/actions.api';
import { FetchedModuleAction } from '../../../../services/supabase/modules/modules.api';
import { ActionItem } from './action-item.component';
import { ActionSelectorModal } from './action-selector-modal.component';

type ActionsSectionsProps = {
  actions: FetchedModuleAction[];
  refetchActions: () => void;
};

export const ActionsSection = ({ actions, refetchActions }: ActionsSectionsProps) => {
  const supabaseClient = useSupabase();
  const mantineTheme = useMantineTheme();
  const [actionSelectorModalIsOpen, setActionSelectorModalIsOpen] = useState(false);

  return (
    <section css={{ marginTop: mantineTheme.spacing.md }}>
      <Title order={3}>Actions:</Title>
      <Button css={{ marginTop: mantineTheme.spacing.sm }} onClick={() => setActionSelectorModalIsOpen(true)}>
        Add Action
      </Button>
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
            label={action.options.label ?? ''}
            handleDelete={() =>
              deleteActionFromModule({ supabaseClient, actionId: action.id }).then(() => refetchActions())
            }
          />
        ))}
      </SimpleGrid>
      <ActionSelectorModal open={actionSelectorModalIsOpen} onClose={() => setActionSelectorModalIsOpen(false)} />
    </section>
  );
};
