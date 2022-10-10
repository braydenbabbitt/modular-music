import React from 'react';
import { Button, Group, Menu } from '@mantine/core';
import { IconHome, IconLogout, IconSettings } from '@tabler/icons';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAuthLink, useAuth } from '../hooks/useAuthContext';
import { getHashParams, removeHashFromUrl } from '../utils/HashUtils';
import { getUser } from '../utils/SpotifyAPI';

const MENU_ICON_SIZE = 16;

type UserButtonProps = {
  imageUrl: string;
  name: string;
  handleLogout: () => void;
  onClick?: () => void;
};

const UserButton = ({ ...props }: UserButtonProps) => {
  const userButtonDropdownItems = [
    {
      label: 'Dashboard',
      icon: <IconHome size={MENU_ICON_SIZE} />,
      to: '/programs',
    },
    {
      label: 'Settings',
      icon: <IconSettings size={MENU_ICON_SIZE} />,
      to: '/settings',
    },
    {
      label: 'Logout',
      icon: <IconLogout size={MENU_ICON_SIZE} />,
      onClick: props.handleLogout,
    },
  ];

  return (
    <Menu trigger='hover' openDelay={100} closeDelay={400} position='bottom-end'>
      <Menu.Target>
        <Group style={{ height: '65%', gap: 5, cursor: 'pointer' }}>
          <img src={props.imageUrl} alt={`An image of ${props.name}`} style={{ borderRadius: '50%', height: '100%' }} />
        </Group>
      </Menu.Target>

      <Menu.Dropdown>
        {userButtonDropdownItems.map((item) =>
          item.to ? (
            <Menu.Item key={item.label} icon={item.icon} component={Link} to={item.to} onClick={item.onClick}>
              {item.label}
            </Menu.Item>
          ) : (
            <Menu.Item key={item.label} icon={item.icon} onClick={item.onClick}>
              {item.label}
            </Menu.Item>
          ),
        )}
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
    const token = hash.access_token || localStorage.getItem('token');

    if (token) {
      getUser(token).then((response) => {
        setAuthData((prev) => ({
          ...prev,
          token,
          user: response,
        }));

        window.location.replace('/');
      });
    }
  }, [setAuthData]);

  return !authData.user ? (
    <Button
      color='primary'
      onClick={handleLogin}
      variant='filled'
      styles={() => ({
        root: {
          fontSize: '1em',
        },
      })}
    >
      Login
    </Button>
  ) : (
    <UserButton handleLogout={handleLogout} imageUrl={authData.user.images[0].url} name={authData.user.display_name} />
  );
};
