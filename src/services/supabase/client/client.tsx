import { createContext, ReactNode } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';
import { SessionContextProvider, useSupabaseClient } from '@supabase/auth-helpers-react';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const SupabaseContext = createContext<SupabaseClient<Database> | undefined>(undefined);

type SupabaseClientProviderProps = {
  children: ReactNode;
};

export const SupabaseClientProvider = ({ children }: SupabaseClientProviderProps) => {
  const supabaseClient = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
    },
  });

  return (
    <SupabaseContext.Provider value={supabaseClient}>
      <SessionContextProvider supabaseClient={supabaseClient}>{children}</SessionContextProvider>
    </SupabaseContext.Provider>
  );
};

export const useSupabase = () => {
  return useSupabaseClient<Database>();
};
