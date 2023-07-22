import { Center, Loader, Text } from '@mantine/core';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getEmailSubscriptionStatus, unsubscribeEmail } from '../../services/supabase/newsletter/newsletter.api';
import { useAuth } from '../../services/auth/auth.provider';

type ResultStatus = 'error' | 'success' | 'already-unsubscribed';

export const UnsubscribePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { supabaseClient } = useAuth();

  const updateSearchParamsWithResult = (result: ResultStatus) => {
    searchParams.delete('id');
    searchParams.set('result', result);
    setSearchParams(searchParams);
  };

  useEffect(() => {
    const emailId = searchParams.get('id');
    if (emailId) {
      getEmailSubscriptionStatus(supabaseClient, emailId).then((status) => {
        if (status === 'unsubscribed') {
          updateSearchParamsWithResult('already-unsubscribed');
        } else {
          unsubscribeEmail(supabaseClient, emailId)
            .then(() => {
              updateSearchParamsWithResult('success');
            })
            .catch((error) => {
              updateSearchParamsWithResult('error');
              console.error(error);
            });
        }
      });
    } else if (searchParams.get('result') === null) {
      updateSearchParamsWithResult('error');
    }
  }, []);

  if (searchParams.get('id')) {
    return (
      <Center css={{ height: '100%' }}>
        <Loader />
      </Center>
    );
  }

  const result = searchParams.get('result') as ResultStatus | null;
  switch (result) {
    case 'success':
      return (
        <Center css={{ height: '100%' }}>
          <Text>You have been successfully unsubscribed!</Text>
        </Center>
      );
    case 'error':
      return (
        <Center css={{ height: '100%' }}>
          <Text>Something went wrong...</Text>
        </Center>
      );
    case 'already-unsubscribed':
      return (
        <Center css={{ height: '100%' }}>
          <Text>This email has already been unsubscribed.</Text>
        </Center>
      );
    default:
      return (
        <Center css={{ height: '100%' }}>
          <Loader color='danger' />
        </Center>
      );
  }
};
