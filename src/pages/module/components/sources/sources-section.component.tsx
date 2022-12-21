import { Button, SimpleGrid, Title, useMantineTheme } from '@mantine/core';
import { useState } from 'react';
import { useSupabase } from '../../../../services/supabase/client/client';
import { SOURCE_TYPE_IDS } from '../../../../services/supabase/constants';
import { FetchedModuleSource } from '../../../../services/supabase/modules/modules.api';
import {
  addLikedTracksSourceToModule,
  addRecentlyPlayedSourceToModule,
  addUserPlaylistSourceToModule,
  deleteSourceFromModule,
} from '../../../../services/supabase/modules/sources.api';
import { AddSourceToModuleConfirmation } from '../../module.page';
import { SourceItem } from './source-item.component';
import { SourceSelectorModal } from './source-selector-modal.component';

type SourceSectionProps = {
  sources: FetchedModuleSource[];
  refetchSources: () => void;
  moduleId: string;
};

export const SourceSection = ({ sources, refetchSources, moduleId }: SourceSectionProps) => {
  const supabaseClient = useSupabase();
  const mantineTheme = useMantineTheme();
  const [sourceSelectorModalIsOpen, setSourceSelectorModalIsOpen] = useState(false);

  return (
    <section css={{ marginTop: mantineTheme.spacing?.md }}>
      <Title order={3} css={{ marginTop: mantineTheme.spacing.md }}>
        Sources:
      </Title>
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
        {sources.map((source) => (
          <SourceItem
            key={source.id}
            imageHref={source.options['image_href'] || undefined}
            label={source.options.label ?? ''}
            handleDelete={() =>
              deleteSourceFromModule({ supabaseClient, sourceId: source.id }).then(() => refetchSources())
            }
          />
        ))}
      </SimpleGrid>
      <Button css={{ marginTop: mantineTheme.spacing.sm }} onClick={() => setSourceSelectorModalIsOpen(true)}>
        Add Source
      </Button>
      <SourceSelectorModal
        open={sourceSelectorModalIsOpen}
        onClose={() => {
          setSourceSelectorModalIsOpen(false);
        }}
        onConfirm={({ type_id, options }: AddSourceToModuleConfirmation) => {
          if (moduleId) {
            switch (type_id) {
              case SOURCE_TYPE_IDS.USER_LIKED_TRACKS:
                if (options.userLikedTracks) {
                  addLikedTracksSourceToModule({
                    supabaseClient,
                    module_id: moduleId,
                    options: options.userLikedTracks,
                  }).then(() => refetchSources());
                }
                break;
              case SOURCE_TYPE_IDS.USER_PLAYLIST:
                if (options.userPlaylist) {
                  addUserPlaylistSourceToModule({
                    supabaseClient,
                    module_id: moduleId,
                    options: options.userPlaylist,
                  }).then(() => refetchSources());
                }
                break;
              case SOURCE_TYPE_IDS.USER_RECENTLY_LISTENED:
                if (options.userRecentlyPlayed) {
                  addRecentlyPlayedSourceToModule({
                    supabaseClient,
                    module_id: moduleId,
                    options: options.userRecentlyPlayed,
                  }).then(() => refetchSources());
                }
                break;
            }
          }
        }}
      />
    </section>
  );
};
