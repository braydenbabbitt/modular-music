import { ModuleSourceOptions } from './../../services/supabase/modules/sources.api';
import { Database } from '../../services/supabase/types/database.types';

export type DatabaseModule = Database['public']['Tables']['modules']['Row'];
export type DatabaseModuleSources = Database['public']['Tables']['module_sources']['Row'][];
export type CreateDatabaseModuleSource = Database['public']['Tables']['module_sources']['Insert'];
export type CustomCreateDatabaseModuleSource = Omit<CreateDatabaseModuleSource, 'options'> & {
  options: ModuleSourceOptions;
};
export type CreateDatabaseModuleAction = Database['public']['Tables']['module_actions']['Insert'] & {
  sources?: CustomCreateDatabaseModuleSource[];
};
