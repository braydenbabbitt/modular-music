import { SimpleGrid, Title, useMantineTheme } from '@mantine/core';
import { DeepPartial } from 'den-ui';
import { useState } from 'react';
import { INTERVAL_MAP, SOURCE_TYPE_IDS } from '../../../../services/supabase/constants';
import { FetchedModuleSource } from '../../../../services/supabase/modules/modules.api';
import {
  addLikedTracksSource,
  addRecentlyListenedSource,
  addUserPlaylistSource,
  deleteSourceFromModule,
  RecentlyListenedOptions,
  UserPlaylistOptions,
} from '../../../../services/supabase/modules/sources.api';
import { CustomCreateDatabaseModuleSource } from '../../types';
import { SourceItem } from './source-item.component';
import { SourceSelectionFormValues } from './source-selection-form.component';
import { SourceSelectorModal } from './source-selector-modal.component';
import { useAuth } from '../../../../services/auth/auth.provider';

type SourceSectionProps = {
  sources: FetchedModuleSource[];
  refetchSources: () => void;
  moduleId: string;
  hideTitle?: boolean;
  disableEditing?: boolean;
};

export const SourceSection = ({ sources, refetchSources, moduleId, hideTitle, disableEditing }: SourceSectionProps) => {
  const { supabaseClient } = useAuth();
  const mantineTheme = useMantineTheme();
  const [sourceSelectorModalValues, setSourceSelectorModalValues] = useState<DeepPartial<SourceSelectionFormValues>>();
  const [selectedSourceId, setSelectedSourceId] = useState<string>();
  const [sourceSelectorModalIsOpen, setSourceSelectorModalIsOpen] = useState(false);

  return (
    <section css={{ marginTop: mantineTheme.spacing?.md }}>
      {!hideTitle && <Title order={3}>Sources:</Title>}
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
        {sources.map((source) => {
          const description =
            source.type_id === SOURCE_TYPE_IDS.USER_RECENTLY_LISTENED
              ? source.options.quantity === 1
                ? `Last ${INTERVAL_MAP[source.options.interval!].slice(0, -1)}`
                : `Last ${source.options.quantity} ${INTERVAL_MAP[source.options.interval!]}`
              : undefined;
          return (
            <SourceItem
              key={source.id}
              imageHref={source.image_href || undefined}
              label={source.label ?? ''}
              handleDelete={() =>
                deleteSourceFromModule({ supabaseClient, sourceId: source.id }).then(() => refetchSources())
              }
              description={description}
              handleEdit={() => {
                setSelectedSourceId(source.id);
                setSourceSelectorModalValues({
                  sourceType: sources.find((item) => item.id === source.id)?.type_id,
                  userPlaylist: source.options?.playlist_id,
                  recentlyListened: {
                    quantity: source.options?.quantity,
                    interval: source.options?.interval?.toString(),
                  },
                });
                setSourceSelectorModalIsOpen(true);
              }}
              disabled={disableEditing}
            />
          );
        })}
        <SourceItem
          label='Add Source'
          onClick={disableEditing ? undefined : () => setSourceSelectorModalIsOpen(true)}
          disabled={disableEditing}
        />
      </SimpleGrid>
      <SourceSelectorModal
        initValues={sourceSelectorModalValues}
        sourceId={selectedSourceId}
        open={sourceSelectorModalIsOpen}
        refetchSources={refetchSources}
        onClose={() => {
          setSelectedSourceId(undefined);
          setSourceSelectorModalValues(undefined);
          setSourceSelectorModalIsOpen(false);
        }}
        onConfirm={({ type_id, label, image_href, options }: CustomCreateDatabaseModuleSource) => {
          if (moduleId) {
            switch (type_id) {
              case SOURCE_TYPE_IDS.USER_LIKED_TRACKS:
                addLikedTracksSource({
                  supabaseClient,
                  module_id: moduleId,
                  label,
                  image_href,
                }).then(() => refetchSources());
                break;
              case SOURCE_TYPE_IDS.USER_PLAYLIST:
                addUserPlaylistSource({
                  supabaseClient,
                  module_id: moduleId,
                  label,
                  image_href,
                  options: options as UserPlaylistOptions,
                }).then(() => refetchSources());
                break;
              case SOURCE_TYPE_IDS.USER_RECENTLY_LISTENED:
                addRecentlyListenedSource({
                  supabaseClient,
                  module_id: moduleId,
                  label,
                  image_href,
                  options: options as RecentlyListenedOptions,
                }).then(() => refetchSources());
                break;
            }
          }
        }}
      />
    </section>
  );
};
