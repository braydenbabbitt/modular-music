import { Button, Title, useMantineTheme } from '@mantine/core';
import { useState } from 'react';
import { QueryObserverResult } from 'react-query';
import { FetchedModuleOutput } from '../../../../services/supabase/modules/modules.api';
import { SourceItem } from '../sources/source-item.component';
import { OutputSelectorModal } from './output-selector-modal.component';
import { IconPlaylist } from '@tabler/icons';

type OutputSectionProps = {
  output: FetchedModuleOutput | undefined;
  refetchOutput: () => void;
  moduleId: string;
  hideTitle?: boolean;
  disableEditing?: boolean;
  userPlaylists: any[];
  refetchUserPlaylists: () => Promise<QueryObserverResult<any[], unknown>>;
};

export const OutputSection = ({
  output,
  refetchOutput,
  moduleId,
  hideTitle,
  disableEditing,
  userPlaylists,
  refetchUserPlaylists,
}: OutputSectionProps) => {
  const mantineTheme = useMantineTheme();
  const [selectorModalIsOpen, setSelectorModalIsOpen] = useState(false);

  return (
    <>
      <section css={{ marginTop: mantineTheme.spacing.md }}>
        {!hideTitle && (
          <Title order={3} css={{ marginBottom: mantineTheme.spacing.md }}>
            Output:
          </Title>
        )}
        {(output && (
          <SourceItem
            label={output.label}
            imageHref={output.image_href}
            defaultIcon={IconPlaylist}
            disabled={disableEditing}
            handleEdit={
              disableEditing
                ? undefined
                : () => {
                    setSelectorModalIsOpen(true);
                  }
            }
            description={`${output.limit} tracks, ${
              output.append === null ? 'overwrite' : output.append ? 'append' : 'insert'
            }`}
          />
        )) ||
          (!disableEditing && <Button onClick={() => setSelectorModalIsOpen(true)}>Select Output</Button>)}
      </section>
      <OutputSelectorModal
        open={selectorModalIsOpen}
        moduleId={moduleId}
        onSave={() => {
          setSelectorModalIsOpen(false);
          refetchOutput();
        }}
        onClose={() => setSelectorModalIsOpen(false)}
        initOutput={output}
        userPlaylists={userPlaylists ?? []}
        refetchUserPlaylists={refetchUserPlaylists}
      />
    </>
  );
};
