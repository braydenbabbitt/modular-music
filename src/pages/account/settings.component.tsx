import React, { useEffect, useState } from 'react';
import { SegmentedControl, Text, useMantineColorScheme } from '@mantine/core';
import { COLOR_SCHEME_KEY } from '../../utils/constants';

export const SettingsPage = () => {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const colorSchemeIsDefault = localStorage.getItem(COLOR_SCHEME_KEY) === null;
  const [colorSchemeState, setColorSchemeState] = useState<string>(colorSchemeIsDefault ? 'default' : colorScheme);

  useEffect(() => {
    const newColorScheme = colorSchemeState === 'default' ? undefined : colorSchemeState === 'dark' ? 'dark' : 'light';
    toggleColorScheme(newColorScheme);
  }, [colorSchemeState, toggleColorScheme]);

  return (
    <>
      <Text component='h1' css={{ marginBottom: '15px' }}>
        Appearance
      </Text>
      <SegmentedControl
        value={colorSchemeState}
        onChange={setColorSchemeState}
        data={[
          { label: 'Light', value: 'light' },
          { label: 'Dark', value: 'dark' },
          { label: 'Browser default', value: 'default' },
        ]}
      />
    </>
  );
};
