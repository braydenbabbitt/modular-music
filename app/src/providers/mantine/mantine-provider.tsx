import { ReactNode } from 'react';
import { MantineProvider } from '@mantine/core';
import { themeOverride } from './theme';

type MantineProviderProps = {
  children: ReactNode;
};

export const CustomMantineProvider = ({ children }: MantineProviderProps) => {
  return (
    <MantineProvider theme={themeOverride} defaultColorScheme='auto'>
      {children}
    </MantineProvider>
  );
};
