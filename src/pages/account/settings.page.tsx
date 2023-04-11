import { useEffect, useState } from 'react';
import { Button, SegmentedControl, Stack, Text, Title, useMantineColorScheme } from '@mantine/core';
import { COLOR_SCHEME_KEY } from '../../utils/constants';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@supabase/auth-helpers-react';
import { createClient } from '@supabase/supabase-js';
import { Database } from '../../services/supabase/types/database.types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const SettingsPage = () => {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const colorSchemeIsDefault = localStorage.getItem(COLOR_SCHEME_KEY) === null;
  const [colorSchemeState, setColorSchemeState] = useState<string>(colorSchemeIsDefault ? 'default' : colorScheme);
  const supabaseClient = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
  const navigate = useNavigate();
  const user = useUser();

  useEffect(() => {
    const newColorScheme = colorSchemeState === 'default' ? undefined : colorSchemeState === 'dark' ? 'dark' : 'light';
    toggleColorScheme(newColorScheme);
  }, [colorSchemeState, toggleColorScheme]);

  return (
    <Stack align='flex-start'>
      <Title order={2} css={{ marginBottom: '15px' }}>
        Appearance
      </Title>
      <SegmentedControl
        value={colorSchemeState}
        onChange={setColorSchemeState}
        data={[
          { label: 'Light', value: 'light' },
          { label: 'Dark', value: 'dark' },
          { label: 'Browser default', value: 'default' },
        ]}
      />
      <Button
        onClick={async () => {
          if (user) {
            await supabaseClient.auth.admin.deleteUser(user.id);
            navigate('/');
          }
        }}
      >
        Delete user
      </Button>
    </Stack>
  );
};
