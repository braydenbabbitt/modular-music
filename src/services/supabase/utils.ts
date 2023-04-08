import { showNotification } from '@mantine/notifications';
import { PostgrestMaybeSingleResponse, PostgrestResponse, PostgrestSingleResponse } from '@supabase/supabase-js';

export const supabaseResponseHandler = <T>(response: PostgrestResponse<T>, errorMessage?: string) => {
  if (response.data) {
    return response.data;
  } else if (response.error) {
    console.error(response.error);
    if (errorMessage) {
      showNotification({
        color: 'danger',
        title: 'Error',
        message: errorMessage,
      });
    }
  }
};

export const supabaseSingleResponseHandler = <T>(
  response: PostgrestSingleResponse<T> | PostgrestMaybeSingleResponse<T>,
  errorMessage?: string,
) => {
  if (response.data || (!response.data && !response.error)) {
    return response.data;
  } else if (response.error) {
    console.error(response.error);
    if (errorMessage) {
      showNotification({
        color: 'danger',
        title: 'Error',
        message: errorMessage,
      });
    }
  }
};
