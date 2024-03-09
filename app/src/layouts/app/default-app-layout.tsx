import { useCurrentColorScheme } from '@libs/mantine';
import { DefaultHeader, Page } from '@root/components';
import { Outlet } from 'react-router-dom';

export const DefaultAppLayout = () => {
  const colorScheme = useCurrentColorScheme();

  return (
    <div
      css={(theme) => ({
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'inter',
        height: '100vh',
        width: '100%',
        backgroundColor: colorScheme === 'dark' ? theme.black : theme.white,
        overflow: 'hidden',
      })}
    >
      <DefaultHeader />
      <Page>
        <Outlet />
      </Page>
    </div>
  );
};
