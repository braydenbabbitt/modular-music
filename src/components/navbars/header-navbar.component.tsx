import React from 'react';
import { css } from '@emotion/react';
import { Button, Center, Container, Group, Header, Menu, useMantineColorScheme } from '@mantine/core';
import { theme } from '../../theme';
import { ModularMusicLogo } from '../images/modular-music-logo';
import { IconChevronDown } from '@tabler/icons';
import { useElementSize } from '@mantine/hooks';
import { useAuth } from '../../hooks/use-auth.hook';

type NavbarItem = {
  label: string;
  link?: string;
  children?: {
    label: string;
    link: string;
  }[];
};

type HeaderNavbarProps = {
  links: NavbarItem[];
};

export const HeaderNavbar = ({ links }: HeaderNavbarProps) => {
  const { colorScheme } = useMantineColorScheme();
  const { login } = useAuth();
  const styles = {
    header: css({
      backgroundColor: colorScheme === 'light' ? theme.colors.neutral[5] : theme.colors.neutral[90],
      padding: '8px 25px',
    }),
    inner: css({
      height: '100%',
      maxWidth: '1600px',
      padding: 0,
      margin: '0 auto',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      color: colorScheme === 'light' ? theme.colors.neutral[90] : theme.colors.neutral[5],
    }),
    logo: css({
      height: '100%',
    }),
    menuItem: css({
      backgroundColor: colorScheme === 'light' ? theme.colors.neutral[5] : theme.colors.neutral[90],
      height: '100%',
      transition: 'background-color 0.15s',
      '&:hover': {
        backgroundColor: colorScheme === 'light' ? theme.colors.neutral[10] : theme.colors.neutral[80],
      },
      padding: '5px 8px',
      borderRadius: '5px',
      cursor: 'default',
      display: 'flex',
      gap: '3px',
      lineHeight: 1,
    }),
    link: css({
      cursor: 'pointer',
    }),
    linksGroup: css({
      height: '80%',
    }),
    dropdownIcon: css({
      marginTop: '5px',
    }),
  };

  const linkItems = links.map((linkItem) => {
    const subItems = linkItem.children?.map((subItem) => (
      <Menu.Item key={`${subItem.label}:${subItem.link}`}>{subItem.label}</Menu.Item>
    ));

    if (subItems) {
      return (
        <Menu
          key={`${linkItem.label}${linkItem.link ? `:${linkItem.link}` : ''}`}
          trigger='hover'
          exitTransitionDuration={150}
        >
          <Menu.Target>
            {linkItem.link ? (
              <Center
                component='a'
                href={linkItem.link}
                onClick={(e) => e.preventDefault()}
                css={[styles.menuItem, styles.link]}
              >
                <span>{linkItem.label}</span>
                <IconChevronDown size={'1em'} stroke={1.5} css={styles.dropdownIcon} />
              </Center>
            ) : (
              <Center css={styles.menuItem}>
                <span>{linkItem.label}</span>
                <IconChevronDown size={'1.5em'} stroke={1.5} css={styles.dropdownIcon} />
              </Center>
            )}
          </Menu.Target>
          <Menu.Dropdown>{subItems}</Menu.Dropdown>
        </Menu>
      );
    }

    return (
      <Center
        component='a'
        href={linkItem.link}
        onClick={(e) => e.preventDefault()}
        css={[styles.menuItem, styles.link]}
        key={`${linkItem.label}${linkItem.link ? `:${linkItem.link}` : ''}`}
      >
        {linkItem.label}
      </Center>
    );
  });

  return (
    <Header height={theme.sizes.headerHeight} css={styles.header}>
      <Container css={styles.inner} fluid>
        <ModularMusicLogo colorScheme={colorScheme} />
        <Group css={styles.linksGroup} spacing={5}>
          {linkItems}
        </Group>
        <Button onClick={() => login()}>Login</Button>
      </Container>
    </Header>
  );
};
