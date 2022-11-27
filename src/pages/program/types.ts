import { Database } from '../../services/supabase/types/database.types';

export type DatabaseProgram = Database['public']['Tables']['programs']['Row'];
