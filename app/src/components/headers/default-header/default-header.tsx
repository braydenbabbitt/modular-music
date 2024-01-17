import { ModularMusicLogo, UserAvatarMenu } from '@root/components';
import { Button } from '@mantine/core';
import { useSupabase } from '@root/providers';
import { useCurrentColorScheme } from '@libs/mantine';

export const DefaultHeader = () => {
  const { login, isLoggedIn } = useSupabase();
  const colorScheme = useCurrentColorScheme();

  return (
    <nav
      css={(theme) => {
        return {
          width: '100%',
          height: '75px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1rem',
          borderBottom: `1px solid ${colorScheme === 'light' ? theme.colors.gray[2] : theme.colors.gray[8]}`,
        };
      }}
    >
      <ModularMusicLogo variant='full' theme='dark' />
      {isLoggedIn ? (
        <UserAvatarMenu />
      ) : (
        <Button
          onClick={() => {
            login();
          }}
        >
          Login
        </Button>
      )}
    </nav>
  );
};
