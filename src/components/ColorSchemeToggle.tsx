import React from 'react';
import { SegmentedControl } from '@mantine/core';
import { useBrightness } from '../hooks/useBrightness';

export const ColorSchemeToggle = () => {
  const [brightness, setBrightness] = useBrightness();

  return (
    <SegmentedControl
      value={brightness}
      data={[
        { label: 'Browser Default', value: 'default' },
        { label: 'Light', value: 'light' },
        { label: 'Dark', value: 'dark' },
      ]}
      onChange={setBrightness}
      style={{ flexShrink: '1' }}
    />
  );
};
