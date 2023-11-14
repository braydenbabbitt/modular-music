import { Container, Overlay, Title, useMantineTheme, Text, Button, Space, TextInput, Group } from '@mantine/core';
import { theme } from '../../theme';
import { useAuth } from '../../services/auth/auth.provider';
import { useFeatureFlag } from '../../services/supabase/modules/feature-flags.api';
import { useForm } from '@mantine/form';
import { addEmailToNewsletter } from '../../services/supabase/newsletter/newsletter.api';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export const HomePage = () => {
  const mantineTheme = useMantineTheme();
  const loginFF = useFeatureFlag('login');
  const navigate = useNavigate();
  const { session, user, supabaseClient } = useAuth();
  const newsLetterForm = useForm({
    initialValues: {
      email: '',
    },
    validate: {
      email: (value) =>
        // eslint-disable-next-line no-useless-escape
        /^\w+([\.\+-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value) ? null : 'Please enter a valid email',
    },
    validateInputOnBlur: true,
  });
  const { login } = useAuth();
  const { hash } = useLocation();
  const searchParams = new URLSearchParams(hash.replace('#', ''));

  useEffect(() => {
    if (session && user) {
      navigate('/dashboard');
    }
  }, [session, user]);

  useEffect(() => {
    if (Object.fromEntries(searchParams).error) {
      navigate(`/error?${searchParams.toString()}`);
    }
  }, [JSON.stringify(searchParams)]);

  return (
    <div
      css={{
        backgroundImage: 'url(/heros/dark-headphones.jpg)',
        height: `calc(100vh - ${theme.sizes.headerHeight}px)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        margin: -theme.sizes.pagePadding,
        position: 'relative',
      }}
    >
      <Overlay
        gradient='linear-gradient(180deg, rgba(0, 0, 0, 0.25) 0%, rgba(0, 0, 0, 0.65) 40%)'
        opacity={1}
        zIndex={0}
      />
      <Container
        css={{
          height: '85%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
          padding: theme.sizes.pagePadding * 2,
          zIndex: 1,
          position: 'relative',
          gap: mantineTheme.spacing.sm,
        }}
      >
        <Title
          css={{
            fontSize: 60,
            fontWeight: 'bolder',
            color: mantineTheme.colors.neutral[0],
            textShadow: mantineTheme.shadows.md,
          }}
        >
          Take <span css={{ color: mantineTheme.colors.primary[5] }}>control</span> of your music
        </Title>
        <Text
          size='xl'
          css={{ maxWidth: 600, color: mantineTheme.colors.neutral[0], textShadow: mantineTheme.shadows.md }}
        >
          Programatically create and manipulate your Spotify playlists to create the listening experience you deserve.
        </Text>
        <Space h='md' />
        {(loginFF && (
          <Button
            variant='gradient'
            size='md'
            gradient={{
              from: 'primary',
              to: mantineTheme.fn.darken(mantineTheme.fn.themeColor('primary'), 0.15),
              deg: 120,
            }}
            onClick={login}
          >
            Get started
          </Button>
        )) || (
          <form
            onSubmit={newsLetterForm.onSubmit((values) => {
              addEmailToNewsletter(supabaseClient, values.email);
              newsLetterForm.reset();
            })}
          >
            <Group align='flex-start'>
              <TextInput placeholder='Enter your email address' {...newsLetterForm.getInputProps('email')} />
              <Button type='submit' disabled={!newsLetterForm.isValid()}>
                Sign up for updates
              </Button>
            </Group>
          </form>
        )}
      </Container>
    </div>
  );
};
