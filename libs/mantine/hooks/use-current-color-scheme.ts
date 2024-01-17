import { useMantineColorScheme } from '@mantine/core';
import { useColorScheme } from '@mantine/hooks';
export const useCurrentColorScheme = () => {
  const { colorScheme } = useMantineColorScheme();
  const browserColorScheme = useColorScheme();

  return colorScheme === 'auto' ? browserColorScheme : colorScheme;
};
