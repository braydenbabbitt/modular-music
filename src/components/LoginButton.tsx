import { css } from "@emotion/react";
import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { getAuthLink, useAuth } from "../hooks/useAuthContext";
import { getHashParams, removeHashFromUrl } from "../utils/HashUtils";
import { getUser } from "../utils/SpotifyAPI";
import { getTheme } from "../utils/Theme";

type UserDropdownItemProps = {
  label: string,
  isFirstItem?: boolean,
  isLastItem?: boolean,
  onClick?: () => void,
  href?: string,
  danger?: boolean
}

const UserDropdownItem = ({ ...props }: UserDropdownItemProps) => {
  const appTheme = getTheme();
  const itemStyles = css({
    ...appTheme.fonts.userDropdownList,
    minWidth: '0',
    padding: '8px 15px',
    borderRadius: props.isFirstItem ? '8px 8px 0px 0px' : props.isLastItem ? '0px 0px 8px 8px' : '0px',
    backgroundColor: appTheme.colors.neutrals.shades[100],
    textAlign: 'center',
    textDecoration: 'none',
    borderBottom: `solid 1px ${appTheme.colors.neutrals.shades[90]}`,
    color: props.danger ? appTheme.colors.danger.main : 'inherit',
    transition: 'color 0.15s, background-color 0.15s',
    '&:hover': {
      backgroundColor: props.danger ? appTheme.colors.danger.main : appTheme.colors.primary.main,
      color: appTheme.colors.neutrals.shades[100],
    }
  });

  console.log({ props })

  return (
    props.href ?
      <NavLink css={itemStyles} to={props.href}>
        {props.label}
      </NavLink> :
      <span css={itemStyles} onClick={props.onClick}>
        {props.label}
      </span>
  )
}

type UserButtonProps = {
  imageUrl: string,
  name: string,
  handleLogout: () => void,
  onClick?: () => void,
}

const UserButton = ({ ...props }: UserButtonProps) => {
  const [isHovering, setIsHovering] = useState(false);
  const buttonStyles = css({
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    cursor: 'pointer',
    alignItems: 'end',
  });

  const dropdownItems = [
    { label: 'Settings', href: '/settings' },
    { label: 'Logout', onClick: props.handleLogout, danger: true }
  ]

  return (
    <div id='thing' onMouseOver={() => setIsHovering(true)} onMouseOut={() => setIsHovering(false)} onClick={props.onClick} css={buttonStyles}>
      <img style={{ borderRadius: '50%', height: '100%' }} src={props.imageUrl} alt="" />
      {isHovering && <span id='filler' style={{ minHeight: '10px', width: '100%' }}></span>}
      {isHovering &&
        <div style={{ display: 'flex', flexDirection: 'column', boxShadow: '0px 0px 8px rgba(0,0,0,0.2)', borderRadius: '8px', width: '100%' }}>
          {dropdownItems.map((item, i, arr) => <UserDropdownItem isFirstItem={i === 0} isLastItem={i === arr.length - 1} {...item} />)}
        </div>
      }
    </div>
  );
}

export const LoginButton = () => {
  const appTheme = getTheme();
  const [authData, setAuthData] = useAuth();
  const navItemStyles = css(appTheme.fonts?.navLink);

  const handleLogout = () => {
    setAuthData({});
    window.location.replace('/')
  }

  const handleLogin = () => {
    window.open(getAuthLink(), '_self');
  }

  useEffect(() => {
    const hash = getHashParams(window.location);
    window.history.replaceState('', document.title, removeHashFromUrl(window.location));
    let token = hash.access_token || localStorage.getItem('token');

    if (token) {
      getUser(token).then((response) => {
        console.log('getUser', { response })
        setAuthData(prev => ({
          ...prev,
          token,
          user: response
        }))

        window.location.replace('/')
      })
    }
  }, [])


  return (
    !authData.user ? <a onClick={handleLogin} style={{ display: 'flex', justifyContent: 'center', cursor: 'pointer' }} css={navItemStyles}>Login</a> : <UserButton handleLogout={handleLogout} imageUrl={authData.user.images[0].url} name={authData.user.display_name} />
  );
}