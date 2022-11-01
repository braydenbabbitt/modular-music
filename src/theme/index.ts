import { colors, mantineDeepPartial } from './colors/colors';
import { sizes } from './sizes/sizes';

export const theme = {
  colors: {
    ...colors,
    mantineDeepPartial,
  },
  sizes,
};

export type themeType = typeof theme;
