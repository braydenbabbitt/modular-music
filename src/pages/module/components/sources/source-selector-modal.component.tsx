import { forwardRef, useEffect } from 'react';
import { Avatar, Group, Modal, Stack, Text } from '@mantine/core';
import { useLayoutSize } from '../../../../hooks/use-layout-size';
import {
  SourceSelectionForm,
  SourceSelectionFormValues,
  SourceSelectionOnSubmitArgs,
} from './source-selection-form.component';
import { CustomCreateDatabaseModuleSource } from '../../types';
import { editSource, SourceType } from '../../../../services/supabase/modules/sources.api';
import { useTypedJSONEncoding, DeepPartial } from 'den-ui';
import { useSupabase } from '../../../../services/supabase/client/client';

type SourceSelectorModalProps = {
  open: boolean;
  initValues?: DeepPartial<SourceSelectionFormValues>;
  sourceId?: string;
  refetchSources: () => void;
  onClose: () => void;
  onConfirm: (payload: CustomCreateDatabaseModuleSource) => void;
};

export const SourceSelectorModal = ({
  open,
  initValues,
  sourceId,
  refetchSources,
  onClose,
  onConfirm,
}: SourceSelectorModalProps) => {
  const layoutSize = useLayoutSize();
  const supabaseClient = useSupabase();
  const { parseTypedJSON } = useTypedJSONEncoding<SourceType>();

  const handleClose = () => {
    onClose();
  };

  const handleConfirm = ({ values, label, image_href, options }: SourceSelectionOnSubmitArgs) => {
    const sourceType = parseTypedJSON(values.sourceType);
    if (sourceType) {
      if (sourceId) {
        editSource({
          supabaseClient,
          sourceId,
          payload: {
            type_id: sourceType.id,
            label,
            image_href,
            options,
          },
        }).then(() => refetchSources());
      } else {
        onConfirm({
          type_id: sourceType.id,
          label,
          image_href,
          options,
        });
      }
    }
    handleClose();
  };

  return (
    <Modal
      opened={open}
      onClose={handleClose}
      fullScreen={layoutSize === 'mobile'}
      centered
      title={initValues ? 'Edit Source' : 'Add Source to Module'}
      css={{
        label: {
          opacity: 0.7,
        },
      }}
    >
      <Stack>
        <SourceSelectionForm
          initValues={initValues}
          onSubmit={handleConfirm}
          buttonLabel={initValues ? 'Save Source' : undefined}
        />
      </Stack>
    </Modal>
  );
};

const UserPlaylistSelectItem = forwardRef<HTMLDivElement, { image: string; label: string; value: string }>(
  ({ image, label, ...others }: { image: string; label: string; value: string }, ref) => (
    <div ref={ref} {...others}>
      <Group noWrap>
        <Avatar src={image} />
        <Text size='sm'>{label}</Text>
      </Group>
    </div>
  ),
);
UserPlaylistSelectItem.displayName = 'SelectItem';
