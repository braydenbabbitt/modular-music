import { Button, Title, useMantineTheme } from '@mantine/core';
import { useState } from 'react';
import { FetchedModuleOutput } from '../../../../services/supabase/modules/modules.api';
import { SourceItem } from '../sources/source-item.component';
import { OutputSelectorModal } from './output-selector-modal.component';

type OutputSectionProps = {
  output: FetchedModuleOutput | undefined;
  refetchOutput: () => void;
  moduleId: string;
  hideTitle?: boolean;
  disableEditing?: boolean;
};

export const OutputSection = ({ output, refetchOutput, moduleId, hideTitle, disableEditing }: OutputSectionProps) => {
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
            disabled={disableEditing}
            handleEdit={
              disableEditing
                ? undefined
                : () => {
                    setSelectorModalIsOpen(true);
                  }
            }
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
      />
    </>
  );
};
