import { showNotification } from '@mantine/notifications';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database';

export const addEmailToNewsletter = async (supabaseClient: SupabaseClient<Database>, email: string) => {
  await supabaseClient
    .from('newsletter_signups')
    .insert({
      email,
    })
    .then((response) => {
      if (response.status === 200) {
        showNotification({
          color: 'primary',
          title: 'Successfully Subscribed',
          message: `Your email, ${email}, has been added to the newsletter.`,
        });
      } else if (response.status === 409) {
        showNotification({
          color: 'danger',
          title: 'Already Subscribed',
          message: `Your email, ${email}, is already subscribed to the newsletter`,
        });
      } else {
        showNotification({
          color: 'danger',
          title: 'Error',
          message: 'Something went wrong adding your email to the newsletter',
        });
      }
    });
};

export const getEmailSubscriptionStatus = async (supabaseClient: SupabaseClient<Database>, id: string) => {
  return await supabaseClient
    .from('newsletter_signups')
    .select()
    .eq('id', id)
    .single()
    .then((response) => {
      if (response.data) {
        return response.data.unsubscribed_at === null ? 'subscribed' : 'unsubscribed';
      } else if (response.error) {
        return undefined;
      }
    });
};

export const unsubscribeEmail = async (supabaseClient: SupabaseClient<Database>, id: string) => {
  return await supabaseClient
    .from('newsletter_signups')
    .update({ unsubscribed_at: new Date().toISOString() })
    .eq('id', id);
};
