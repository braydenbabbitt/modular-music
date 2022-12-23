import { forwardRef } from 'react';
import { Avatar, Group, Modal, Stack, Text } from '@mantine/core';
import { useLayoutSize } from '../../../../hooks/use-layout-size';
import { SourceSelectionForm, SourceSelectionOnSubmitArgs } from './source-selection-form.component';
import { CustomCreateDatabaseModuleSource } from '../../types';
import { SourceType } from '../../../../services/supabase/modules/sources.api';
import { jsonParseWithType } from '../../../../utils/custom-json-encoder';

type SourceSelectorModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: (payload: CustomCreateDatabaseModuleSource) => void;
};

export const SourceSelectorModal = ({ open, onClose, onConfirm }: SourceSelectorModalProps) => {
  const layoutSize = useLayoutSize();

  const handleClose = () => {
    onClose();
  };

  const handleConfirm = ({ values, label, image_href, options }: SourceSelectionOnSubmitArgs) => {
    const sourceType = jsonParseWithType<SourceType>(values.sourceType);
    if (sourceType) {
      onConfirm({
        type_id: sourceType.id,
        label,
        image_href,
        options,
      });
    }
    handleClose();
  };

  return (
    <Modal
      opened={open}
      onClose={handleClose}
      fullScreen={layoutSize === 'mobile'}
      centered
      title='Add Source to Module'
      css={{
        label: {
          opacity: 0.7,
        },
      }}
    >
      <Stack>
        <SourceSelectionForm onSubmit={handleConfirm} />
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
