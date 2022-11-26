import React from 'react';
import { css } from '@emotion/react';
import { Avatar, Button, Center, Container, Group, Header, Menu, useMantineColorScheme } from '@mantine/core';
import { theme } from '../../theme';
import { ModularMusicLogo } from '../images/modular-music-logo';
import { IconChevronDown, IconLogout, IconSettings } from '@tabler/icons';
import { Link } from 'react-router-dom';
import { useAuth } from '../../services/auth/auth.provider';

type NavbarItem = {
  label: string;
  link?: string;
  children?: {
    label: string;
    link: string;
  }[];
};

type HeaderNavbarProps = {
  links?: NavbarItem[];
};

export const HeaderNavbar = ({ links }: HeaderNavbarProps) => {
  const { colorScheme } = useMantineColorScheme();
  const { spotifyUser, login, logout } = useAuth();
  const styles = {
    header: css({
      backgroundColor: colorScheme === 'light' ? theme.colors.neutral[5] : theme.colors.neutral[90],
      padding: `12px ${theme.sizes.pagePadding}px`,
      ' a': {
        textDecoration: 'none',
        cursor: 'pointer',
      },
    }),
    inner: css({
      height: '100%',
      maxWidth: theme.sizes.innerMaxWidth,
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
      height: '100%',
    }),
    dropdownIcon: css({
      marginTop: '5px',
    }),
  };

  const linkItems = links?.map((linkItem) => {
    const subItems = linkItem.children?.map((subItem) => {
      return (
        <Menu.Item component={Link} to={subItem.link} key={`${subItem.label}:${subItem.link}`}>
          {subItem.label}
        </Menu.Item>
      );
    });

    if (subItems) {
      return (
        <Menu
          key={`${linkItem.label}${linkItem.link ? `:${linkItem.link}` : ''}`}
          trigger='hover'
          exitTransitionDuration={150}
          width='target'
        >
          <Menu.Target>
            {linkItem.link ? (
              <Center component={Link} to={linkItem.link} css={[styles.menuItem, styles.link]}>
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

    if (linkItem.link) {
      return (
        <Center
          component={Link}
          to={linkItem.link}
          css={[styles.menuItem, styles.link]}
          key={`${linkItem.label}${linkItem.link ? `:${linkItem.link}` : ''}`}
        >
          {linkItem.label}
        </Center>
      );
    } else {
      return (
        <Center css={styles.menuItem} key={`${linkItem.label}${linkItem.link ? `:${linkItem.link}` : ''}`}>
          {linkItem.label}
        </Center>
      );
    }
  });

  return (
    <Header height={theme.sizes.headerHeight} css={styles.header}>
      <Container css={styles.inner} fluid>
        <Link css={css({ height: '100%' })} to={spotifyUser ? '/dashboard' : '/'}>
          <ModularMusicLogo colorScheme={colorScheme} />
        </Link>
        {linkItems && (
          <Group css={styles.linksGroup} spacing={10}>
            {linkItems}
          </Group>
        )}
        {(spotifyUser && (
          <UserDropdown
            imageSource={spotifyUser.images[0].url}
            displayName={spotifyUser.display_name}
            logout={logout}
          />
        )) || (
          <Button color={theme.colors.primary[50]} onClick={login}>
            Login
          </Button>
        )}
      </Container>
    </Header>
  );
};

type UserDropdownProps = {
  imageSource?: string;
  displayName: string;
  logout: () => void;
};

const UserDropdown = ({ imageSource, displayName, logout }: UserDropdownProps) => {
  const styles = {
    avatar: css({
      cursor: 'pointer',
    }),
  };

  const actions = [
    {
      label: 'Settings',
      icon: <IconSettings size={14} />,
      route: '/settings',
    },
    {
      label: 'Logout',
      icon: <IconLogout size={14} />,
      onClick: logout,
    },
  ];

  const userInitials =
    displayName.split(' ')[0].charAt(0).toUpperCase() + displayName.split(' ')[1].charAt(0).toUpperCase();

  return (
    <Menu position='top-end' trigger='hover' exitTransitionDuration={150}>
      <Menu.Target>
        <Avatar css={styles.avatar} src={imageSource}>
          {userInitials}
        </Avatar>
      </Menu.Target>
      <Menu.Dropdown>
        {actions.map((item) => {
          if (item.route) {
            return (
              <Menu.Item component={Link} icon={item.icon} key={`${item.label}:${item.route}`} to={item.route}>
                {item.label}
              </Menu.Item>
            );
          } else {
            return (
              <Menu.Item key={`${item.label}`} icon={item.icon} onClick={item.onClick}>
                {item.label}
              </Menu.Item>
            );
          }
        })}
      </Menu.Dropdown>
    </Menu>
  );
};
