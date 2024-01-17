import '../global-styles.css';
import '@mantine/core/styles.css';
import { AppProviders } from '@root/providers';
import { DefaultAppLayout } from '@layouts/app';

export default function App() {
  return (
    <AppProviders>
      <DefaultAppLayout />
    </AppProviders>
  );
}
