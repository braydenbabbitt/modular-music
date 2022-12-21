import { useMantineTheme } from '@mantine/core';
import { useViewportSize } from '@mantine/hooks';

export const useLayoutSize = () => {
  const mantineTheme = useMantineTheme();
  const { width } = useViewportSize();
  return width > mantineTheme.breakpoints.sm ? 'desktop' : 'mobile';
};
