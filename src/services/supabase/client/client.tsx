import { createContext, ReactNode, useContext } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const SupabaseContext = createContext<SupabaseClient<Database> | undefined>(undefined);

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

  return <SupabaseContext.Provider value={supabaseClient}>{children}</SupabaseContext.Provider>;
};

export const useSupabase = () => {
  const supabaseClient = useContext(SupabaseContext);

  if (supabaseClient === undefined) {
    throw Error('useSupabase must be used within SupabaseClientProvider');
  }

  return supabaseClient;
};
