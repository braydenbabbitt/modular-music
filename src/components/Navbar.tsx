import { jsx, css, useTheme } from "@emotion/react"
import { NavLink } from "react-router-dom"

export const Navbar = () => {
  const appTheme = useTheme();

  const navbarStyles = css({
    backgroundColor: appTheme.colors?.primary.main,
    display: 'flex',
    flex: '1',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px 20px',
    height: '50px',
    boxShadow: '0px 2px 5px rgba(0,0,0,0.33)'
  });
  const logoLinkStyles = css({
    height: '75%'
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
        <img css={logoStyles} src="wordmark-white.svg" alt="Modular Music" />
      </NavLink>
      <ul css={navListStyles}>
        <li><NavLink to='/about' css={navItemStyles}>
          About
        </NavLink></li>
        <li><NavLink to='/login' css={navItemStyles}>
          Login
        </NavLink></li>
      </ul>
    </nav >
  )
}