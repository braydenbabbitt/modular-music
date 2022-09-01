import { Burger, Button, Center, Container, createStyles, Group, Header, Menu, useMantineColorScheme, useMantineTheme } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useEffect } from "react";
import { NavLink } from "react-router-dom";
import { LoginButton } from "./LoginButton";

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
  burger: {
    [theme.fn.largerThan('sm')]: {
      display: 'none',
    },
  },
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
}));

export const Navbar = () => {
  const styles = navbarStyles();
  const [opened, { toggle }] = useDisclosure(false);
  const brightness = useMantineTheme().colorScheme;
  const headerStyles = {
    borderBottom: 0, boxShadow: `0 0 5px ${brightness === 'light' ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.5)'}`
  };
  const logoImage = brightness === 'light' ? 'wordmark-black-green.svg' : 'wordmark-white-green.svg';

  console.log({ brightness });

  return (
    <Header height={HEADER_HEIGHT} sx={headerStyles}>
      <Container className={styles.classes.inner} fluid>
        <Group spacing={5} sx={{ height: '65%' }}>
          <Burger opened={opened} onClick={toggle} className={styles.classes.burger} size='sm' />
          <NavLink to='/' style={{ height: '100%' }}>
            <img src={logoImage} alt="Modular Music Logo" style={{ height: '100%' }} />
          </NavLink>
        </Group>
        <LoginButton />
      </Container>
    </Header>
  );
};