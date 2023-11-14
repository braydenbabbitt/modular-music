import { Paper, Stack, Title, Text, Button } from '@mantine/core';
import { useAuth } from '../../services/auth/auth.provider';

export const UnverifiedEmailError = () => {
  const { login } = useAuth();

  return (
    <Paper css={{ width: '60%' }}>
      <Stack align='center' spacing={24}>
        <Title order={2} size='h1'>
          Your Email is Not Verified
        </Title>
        <Text css={{ width: '50%' }} align='center'>
          A confirmation email has been sent to your Spotify email. Please confirm your email address and then log in
          again.
        </Text>
        <Button onClick={() => login()} css={{ width: 'fit-content' }} size='md'>
          Login
        </Button>
      </Stack>
    </Paper>
  );
};
