import { Loader } from '@mantine/core';
import { useSupabase } from '@root/providers';
import { useNavigate } from '@root/router';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

const LoginPage = () => {
  const { isLoggedIn } = useSupabase();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (isLoggedIn) {
      navigate('/dashboard', { replace: true });
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (searchParams.get('error')) {
      navigate('/error', { replace: true, state: { ...searchParams } });
    }
  }, [searchParams]);

  return (
    <div
      css={{
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Loader />
    </div>
  );
};

export default LoginPage;
