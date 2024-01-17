import { ThemeProvider } from '@emotion/react';
import { useMantineTheme } from '@mantine/core';
import { ReactNode } from 'react';

type EmotionThemeProviderProps = {
  children: ReactNode;
};

export const EmotionThemeProvider = ({ children }: EmotionThemeProviderProps) => {
  const theme = useMantineTheme();

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};
