import { Avatar, Menu, UnstyledButton } from '@mantine/core';
import { useSupabase } from '@root/providers';
import { IconLogout } from '@tabler/icons-react';

export const UserAvatarMenu = () => {
  const { user, logout } = useSupabase();
  const name = user?.user_metadata.name as string | undefined;
  const names = name?.split(' ');
  const initials = `${names?.at(0)?.charAt(0) ?? ''}${names?.at(-1)?.charAt(0) ?? ''}`;

  return (
    <Menu position='bottom-end'>
      <Menu.Target>
        <UnstyledButton>
          <Avatar
            src={user?.user_metadata.picture}
            css={{
              cursor: 'pointer',
            }}
          >
            {initials}
          </Avatar>
        </UnstyledButton>
      </Menu.Target>
      <Menu.Dropdown
        css={{
          '> div:nth-child(1)': {
            ':focus': {
              backgroundColor: 'transparent',
              outline: 'none',
              border: 'none',
            },
          },
        }}
      >
        <Menu.Item onClick={() => logout()} leftSection={<IconLogout size={14} />}>
          Logout
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};
