import {
  PostgrestMaybeSingleResponse,
  PostgrestResponse,
  PostgrestSingleResponse,
} from 'https://esm.sh/v113/@supabase/postgrest-js@1.4.1';

export const supabaseMaybeResponseHandler = <T>(response: PostgrestResponse<T>, errorMessage?: string): T[] | null => {
  if (response.error) {
    console.error(response.error);
    if (errorMessage) {
      throw new Error(errorMessage ?? response.error);
    }
  }
  return response.data;
};

export const supabaseResponseHandler = <T>(response: PostgrestResponse<T>, errorMessage: string): T[] => {
  const resolvedRes = supabaseMaybeResponseHandler(response, errorMessage);

  if (resolvedRes === null) {
    throw new Error(errorMessage ?? 'Expected at least 1 row in response, found 0.');
  }

  return resolvedRes;
};

export const supabaseMaybeSingleResponseHandler = <T>(
  response: PostgrestSingleResponse<T> | PostgrestMaybeSingleResponse<T>,
  errorMessage?: string,
): T | null => {
  if (response.error) {
    console.error(response.error);
    if (errorMessage) {
      throw new Error(errorMessage ?? response.error);
    }
  }
  return response.data;
};

export const supabaseSingleResponseHandler = <T>(
  response: PostgrestSingleResponse<T> | PostgrestMaybeSingleResponse<T>,
  errorMessage?: string,
): T => {
  const resolvedRes = supabaseMaybeSingleResponseHandler(response, errorMessage);

  if (resolvedRes === null) {
    throw new Error(errorMessage ?? 'Expected 1 row in response, found 0.');
  }
  return resolvedRes;
};
