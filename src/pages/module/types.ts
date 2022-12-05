import { Database } from '../../services/supabase/types/database.types';

export type DatabaseModule = Database['public']['Tables']['modules']['Row'];
