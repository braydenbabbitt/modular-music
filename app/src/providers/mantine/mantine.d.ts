import { DefaultMantineColor, MantineColorsTuple } from '@mantine/core';
import { CustomColors } from './theme';

declare module '@mantine/core' {
  export interface MantineThemeColorsOverride {
    colors: Record<DefaultMantineColor | CustomColors, MantineColorsTuple>;
  }
}
