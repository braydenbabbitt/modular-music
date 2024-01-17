import { generateColors } from '@mantine/colors-generator';
import { DEFAULT_THEME, createTheme, mergeMantineTheme } from '@mantine/core';

const customColors = {
  primary: generateColors('#1DBA53'),
  secondary: generateColors('#1873cc'),
  warning: generateColors('#ffc300'),
  danger: generateColors('#FF5252'),
} as const;

export type CustomColors = keyof typeof customColors;

export const themeOverride = createTheme({
  primaryColor: 'primary',
  primaryShade: {
    light: 8,
    dark: 7,
  },
  black: '#17191C',
  colors: customColors,
  cursorType: 'pointer',
});

export const theme = mergeMantineTheme(DEFAULT_THEME, themeOverride);
