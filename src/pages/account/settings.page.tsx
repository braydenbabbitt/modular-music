import React, { useEffect, useState } from 'react';
import { SegmentedControl, Stack, Text, Title, useMantineColorScheme } from '@mantine/core';
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
    <Stack align='flex-start'>
      <Title order={2} css={{ marginBottom: '15px' }}>
        Appearance
      </Title>
      <SegmentedControl
        value={colorSchemeState}
        onChange={setColorSchemeState}
        data={[
          { label: 'Light', value: 'light' },
          { label: 'Dark', value: 'dark' },
          { label: 'Browser default', value: 'default' },
        ]}
      />

      <Title order={2} css={{ marginBottom: '15px' }}>
        User Data Sandbox
      </Title>
      <Text></Text>
    </Stack>
  );
};
