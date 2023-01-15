import { ActionIcon, Flex, Footer, Group, Stack, useMantineTheme, Text, Divider } from '@mantine/core';
import { IconBrandGithub } from '@tabler/icons';
import { theme } from '../../theme';
import { GITHUB_LINK } from '../../utils/constants';
import { ModularMusicLogo } from '../images/modular-music-logo';

type BasicFooterProps = {
  children?: React.ReactNode;
};

export const BasicFooter = ({ children }: BasicFooterProps) => {
  const mantineTheme = useMantineTheme();

  return (
    <Footer height='auto' css={{ padding: mantineTheme.spacing.lg }}>
      <Flex css={{ maxWidth: theme.sizes.innerMaxWidth, height: '100%' }} align='center' justify='space-between'>
        <Stack align='start' spacing='sm'>
          <ModularMusicLogo height={`${theme.sizes.logoHeight}px`} colorScheme={mantineTheme.colorScheme} />
          <Text color={mantineTheme.fn.lighten(mantineTheme.fn.themeColor('neutral'), 0.5)} size='xs'>
            © 2023 Brayden Babbitt | All rights reserved
          </Text>
        </Stack>
        {children}
        <Group>
          <ActionIcon component='a' target='_blank' href={GITHUB_LINK} variant='light' color='neutral'>
            <IconBrandGithub />
          </ActionIcon>
        </Group>
      </Flex>
    </Footer>
  );
};
