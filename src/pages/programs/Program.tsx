import React from 'react';
import { ActionIcon, useMantineTheme } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons';
import { Link, useParams } from 'react-router-dom';

export const Program = () => {
  const { programId } = useParams();
  const appTheme = useMantineTheme();

  return (
    <>
      <ActionIcon component={Link} to='/programs'>
        <IconArrowLeft />
      </ActionIcon>
      <h1>{programId}</h1>
    </>
  );
};
