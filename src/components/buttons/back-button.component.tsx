import { Button } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons';
import { useNavigate } from 'react-router-dom';

type BackButtonProps = {
  label: string;
  backArrow?: boolean;
  to?: string;
};

export const BackButton = ({ label, backArrow = true, to }: BackButtonProps) => {
  const navigate = useNavigate();

  return (
    <Button
      leftIcon={backArrow && <IconArrowLeft />}
      variant='subtle'
      onClick={() => {
        to ? navigate(to) : navigate(-1);
      }}
      color='primary'
    >
      {label}
    </Button>
  );
};
