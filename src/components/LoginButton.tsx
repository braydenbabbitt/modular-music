import { Button, Group, Menu, useMantineTheme } from "@mantine/core";
import { IconLogout, IconSettings } from "@tabler/icons";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { getAuthLink, useAuth } from "../hooks/useAuthContext";
import { getHashParams, removeHashFromUrl } from "../utils/HashUtils";
import { getUser } from "../utils/SpotifyAPI";

const MENU_ICON_SIZE = 14;

type UserButtonProps = {
  imageUrl: string,
  name: string,
  handleLogout: () => void,
  onClick?: () => void,
};

const UserButton = ({ ...props }: UserButtonProps) => {
  const userButtonDropdownItems = [
    {
      label: 'Settings',
      icon: <IconSettings size={MENU_ICON_SIZE} />,
      to: '/settings'
    },
    {
      label: 'Logout',
      icon: <IconLogout size={MENU_ICON_SIZE} />,
      onClick: props.handleLogout
    }
  ];

  return (
    <Menu trigger='hover' openDelay={100} closeDelay={400} position="bottom-end">
      <Menu.Target>
        <Group style={{ height: '65%', gap: 5 }}>
          <img src={props.imageUrl} alt={`An image of ${props.name}`} style={{ borderRadius: '50%', height: '100%' }} />
          {/* <IconChevronDown /> */}
        </Group>
      </Menu.Target>

      <Menu.Dropdown>
        {userButtonDropdownItems.map(item => (item.to ? <Menu.Item key={item.label} icon={item.icon} component={Link} to={item.to} onClick={item.onClick}>{item.label}</Menu.Item> : <Menu.Item key={item.label} icon={item.icon} onClick={item.onClick}>{item.label}</Menu.Item>))}
      </Menu.Dropdown>
    </Menu>
  );
};

export const LoginButton = () => {
  const [authData, setAuthData] = useAuth();

  const handleLogout = () => {
    setAuthData({});
    window.location.replace('/');
  };

  const handleLogin = () => {
    window.open(getAuthLink(), '_self');
  };

  useEffect(() => {
    const hash = getHashParams(window.location);
    window.history.replaceState('', document.title, removeHashFromUrl(window.location));
    let token = hash.access_token || localStorage.getItem('token');

    if (token) {
      getUser(token).then((response) => {
        setAuthData(prev => ({
          ...prev,
          token,
          user: response
        }));

        window.location.replace('/');
      });
    }
  }, []);


  return (
    !authData.user ?
      <Button onClick={handleLogin} variant='filled' styles={() => ({
        root: {
          fontSize: '1em'
        }
      })}>Login</Button> : 
      <UserButton handleLogout={handleLogout} imageUrl={authData.user.images[0].url} name={authData.user.display_name} />
  );
};