import { useMantineColorScheme } from '@mantine/core';
import { useColorScheme } from '@mantine/hooks';
import { useState } from 'react';

export const useBrightness = () => {
  const browserBrightness = useColorScheme();
  const hasBrightnessOverride = !!localStorage.getItem('brightness');
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const [brightnessSetting, setBrightnessSetting] = useState<'dark' | 'light' | 'default'>(
    hasBrightnessOverride ? colorScheme : 'default',
  );

  const setBrightness = (value: 'dark' | 'light' | 'default') => {
    console.log({ value });
    setBrightnessSetting(value);
    if (value !== 'default') {
      if (value !== colorScheme) {
        toggleColorScheme();
      } else {
        localStorage.setItem('brightness', value);
      }
    } else {
      if (colorScheme !== browserBrightness) {
        toggleColorScheme();
      }
      localStorage.removeItem('brightness');
    }
  };

  return [brightnessSetting, setBrightness] as const;
};
