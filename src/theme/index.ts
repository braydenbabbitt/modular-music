import { MantineThemeOverride } from '@mantine/core';
import { colors } from './colors/colors';
import { sizes } from './sizes/sizes';

export const theme = {
  colors: {
    ...colors,
  },
  sizes,
};

export const mantineTheme = {
  colors: {
    primary: theme.colors.mantineDeepPartials.primary,
    neutral: theme.colors.mantineDeepPartials.neutral,
    danger: theme.colors.mantineDeepPartials.danger,
  },
  primaryColor: 'primary',
  primaryShade: { light: 5, dark: 7 },
} as MantineThemeOverride;

export type themeType = typeof theme;
