import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Database } from './types/database.ts';

export const shouldBeRescheduled = async (
  supabaseClient: SupabaseClient<Database>,
  schedule: Database['public']['Tables']['module_schedules']['Row'],
) => {
  const currentDateTime = new Date();
  const isPastEndDate = schedule.end_date ? new Date(schedule.end_date).getTime() < currentDateTime.getTime() : false;
  const runsCount = await supabaseClient
    .from('module_runs_log')
    .select('*', { count: 'exact', head: true })
    .eq('scheduled', true)
    .eq('error', false)
    .eq('module_id', schedule.id);

  const hasCompletedRunCountLimit =
    runsCount.count && schedule.times_to_repeat !== null && runsCount.count >= schedule.times_to_repeat;

  return !isPastEndDate || !!hasCompletedRunCountLimit;
};
