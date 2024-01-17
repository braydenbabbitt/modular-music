import { useCurrentColorScheme } from '@libs/mantine';
import { DefaultHeader } from '@root/components';
import { Outlet } from 'react-router-dom';

export const DefaultAppLayout = () => {
  const colorScheme = useCurrentColorScheme();

  return (
    <div
      css={(theme) => ({
        fontFamily: 'inter',
        minHeight: '100vh',
        width: '100%',
        backgroundColor: colorScheme === 'dark' ? theme.black : theme.white,
      })}
    >
      <DefaultHeader />
      <Outlet />
    </div>
  );
};
