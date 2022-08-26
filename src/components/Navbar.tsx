import { css, jsx, useTheme } from '@emotion/react';
import { NavLink } from 'react-router-dom';
import { LoginButton } from './LoginButton';

export const Navbar = () => {
  const appTheme = useTheme();

  const navbarStyles = css({
    backgroundColor: appTheme.colors?.neutrals?.shades?.[100],
    display: 'flex',
    flex: '1',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px 20px',
    height: '50px',
    boxShadow: '0px 2px 10px rgba(0,0,0,0.15)',
    overflow: 'visible'
  });
  const logoLinkStyles = css({
    height: '95%'
  });
  const logoStyles = css({
    height: '100%',
    width: 'auto',
    '&:hover': {
      fill: 'red'
    }
  });
  const navListStyles = css({
    display: 'flex',
    listStyle: 'none',
    gap: '15px',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'end',
  });
  const navItemStyles = css(appTheme.fonts?.navLink);

  return (
    <nav css={navbarStyles} >
      <NavLink css={logoLinkStyles} to='/'>
        <img css={logoStyles} src="wordmark-black-green.svg" alt="Modular Music" />
      </NavLink>
      <LoginButton />
    </nav >
  )
}