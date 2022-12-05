import { Database } from '../../services/supabase/types/database.types';

export type DatabaseModule = Database['public']['Tables']['modules']['Row'];
export type DatabaseModuleSources = Database['public']['Tables']['module_sources']['Row'][];
export type CreateDatabaseModuleSource = Database['public']['Tables']['module_sources']['Insert'];
