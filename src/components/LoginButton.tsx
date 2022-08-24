import { useTheme, css } from "@emotion/react";
import { useEffect } from "react";
import { NavLink } from "react-router-dom";
import { getAuthLink, useAuth } from "../hooks/useAuthContext";
import { getHashParams, removeHashFromUrl } from "../utils/HashUtils";
import { getUser } from "../utils/SpotifyAPI";

type UserDropdownProps = {
  imageUrl: string,
  name: string,
  onClick?: () => void
}

const UserDropdown = ({ ...props }: UserDropdownProps) => {
  const buttonStyles = css({
    display: 'flex',
    height: '100%',
    gap: '10px',
    cursor: 'pointer'
  })

  return (
    <div onClick={props.onClick} css={buttonStyles}>
      <img style={{ flex: '1', borderRadius: '50%', overflow: 'hidden' }} src={props.imageUrl} alt="" />
      <p>{props.name}</p>
    </div>
  )
}

export const LoginButton = () => {
  const appTheme = useTheme();
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
    window.history.pushState('', document.title, removeHashFromUrl(window.location));
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
    !authData.user ? <a onClick={handleLogin} style={{ display: 'flex', justifyContent: 'center', cursor: 'pointer' }} css={navItemStyles}>Login</a> : <UserDropdown onClick={handleLogout} imageUrl={authData.user.images[0].url} name={authData.user.display_name} />
  );
}