import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../services/auth/auth.provider';
import { Text } from '@mantine/core';

export const HomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (user) {
    navigate('/dashboard');
    return <></>;
  } else {
    return <Text component='h1'>Home</Text>;
  }
};
