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
  onClick?: () => void
}

const UserDropdownItem = ({ ...props }: UserDropdownItemProps) => {
  const appTheme = getTheme();
  const itemStyles = css({
    ...appTheme.fonts.userDropdownList,
    width: '100%',
    padding: '5px 8px',
    borderRadius: props.isFirstItem ? '5px 5px 0px 0px' : props.isLastItem ? '0px 0px 5px 5px' : '0px',
    backgroundColor: appTheme.colors.neutrals.shades[90],
    '&:hover': {
      backgroundColor: appTheme.colors.primary.main,
      color: appTheme.colors.neutrals.shades[100]
    }
  });

  return (
    <div css={itemStyles} onClick={props.onClick}>
      {props.label}
    </div>
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
  const [authData, setAuthData] = useAuth();
  const appTheme = getTheme();
  const buttonStyles = css({
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: '0',
    height: '100%',
    cursor: 'pointer',
    alignItems: 'end',
  });

  const dropdownItems = [
    { label: 'user settings' },
    { label: 'logout', onClick: props.handleLogout }
  ]

  return (
    <div onMouseOver={() => setIsHovering(true)} onMouseOut={() => setIsHovering(false)} onClick={props.onClick} css={buttonStyles}>
      <img style={{ flex: '1', borderRadius: '50%', height: '100%' }} src={props.imageUrl} alt="" />
      {isHovering && dropdownItems.map((item, i, arr) => <UserDropdownItem isFirstItem={i === 0} isLastItem={i === arr.length - 1} label={item.label} onClick={item.onClick} />)}
    </div>
  );
}

export const LoginButton = () => {
  const appTheme = getTheme();
  const [authData, setAuthData] = useAuth();
  const navItemStyles = css(appTheme.fonts?.navLink);

  const handleLogout = () => {
    setAuthData({});
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