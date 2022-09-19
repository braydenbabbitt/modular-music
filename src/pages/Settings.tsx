import { SegmentedControl, useMantineColorScheme, useMantineTheme } from "@mantine/core";
import { useColorScheme } from "@mantine/hooks";
import { useState } from "react";

export const Settings = () => {
  const browserBrightness = useColorScheme();
  const hasBrightnessOverride = !!localStorage.getItem('brightness');
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const [brightnessSetting, setBrightnessSetting] = useState(hasBrightnessOverride ? colorScheme : 'default');

  const setBrightness = (value: string) => {
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

  return (
    <>
      <h1>Settings</h1>
      <SegmentedControl
        value={brightnessSetting}
        data={[
          { label: 'Browser Default', value: 'default' },
          { label: 'Light', value: 'light' },
          { label: 'Dark', value: 'dark' }
        ]}
        onChange={setBrightness}
      />
    </>
  );
};