import React from 'react';
import { Container, createStyles, Group, Header, useMantineTheme } from '@mantine/core';
import { NavLink } from 'react-router-dom';
import { useUser } from '../hooks/useAuthContext';
import { LoginButton } from './LoginButton';

const HEADER_HEIGHT = 80;

const navbarStyles = createStyles((theme) => ({
  inner: {
    height: HEADER_HEIGHT,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  links: {
    [theme.fn.smallerThan('sm')]: {
      display: 'none',
    },
  },
  // burger: {
  //   [theme.fn.largerThan('sm')]: {
  //     display: 'none',
  //   },
  // },
  link: {
    display: 'block',
    lineHeight: 1,
    padding: '8px 12px',
    borderRadius: theme.radius.sm,
    textDecoration: 'none',
    color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.colors.gray[7],
    fontSize: theme.fontSizes.sm,
    fontWeight: 500,

    '&:hover': {
      backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
    },
  },
  linkLabel: {
    marginRight: 5,
  },
  logoImage: {
    height: '100%',
    // [theme.fn.smallerThan('sm')]: {
    //   height: '75%'
    // },
  },
}));

type NavbarProps = {
  devMode?: boolean;
};

export const Navbar = ({ devMode }: NavbarProps) => {
  const isUser = !!useUser();
  const styles = navbarStyles();
  // const [opened, { toggle }] = useDisclosure(false);
  const brightness = useMantineTheme().colorScheme;
  const headerStyles = {
    borderBottom: 0,
    boxShadow: `0 0 5px ${brightness === 'light' ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.5)'}`,
  };
  const logoImage = brightness === 'light' ? '/wordmark-black-green.svg' : '/wordmark-white-green.svg';

  return (
    <Header height={HEADER_HEIGHT} sx={headerStyles}>
      <Container className={styles.classes.inner} fluid>
        <Group spacing={5} sx={{ height: '65%', gap: '25px' }}>
          {/* <Burger opened={opened} onClick={toggle} className={styles.classes.burger} size='md' /> */}
          <NavLink to={isUser ? '/programs' : '/'} style={{ height: '100%' }}>
            <img className={styles.classes.logoImage} src={logoImage} alt='Modular Music Logo' />
          </NavLink>
        </Group>
        <LoginButton />
      </Container>
    </Header>
  );
};
