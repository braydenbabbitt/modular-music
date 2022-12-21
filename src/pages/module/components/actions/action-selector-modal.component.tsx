import { Modal } from '@mantine/core';
import { useQuery } from 'react-query';
import { useLayoutSize } from '../../../../hooks/use-layout-size';
import { useSupabase } from '../../../../services/supabase/client/client';
import { getActionTypes } from '../../../../services/supabase/modules/actions.api';

type ActionSelectorModalProps = {
  open: boolean;
  onClose: () => void;
};

export const ActionSelectorModal = ({ open, onClose }: ActionSelectorModalProps) => {
  const supabaseClient = useSupabase();
  const layoutSize = useLayoutSize();
  const { data: actionOptions } = useQuery(['action-types'], () => getActionTypes({ supabaseClient }));
  const handleClose = () => {
    onClose();
  };

  return (
    <Modal
      opened={open}
      onClose={handleClose}
      fullScreen={layoutSize === 'mobile'}
      centered
      title='Add a new action:'
    ></Modal>
  );
};
