import { FetchedModuleSchedule } from '../services/supabase/modules/modules.api';
import { DAYS_OF_WEEK } from './constants';
import { getOrdinal } from './ordinal-numbers';

export const formatScheduleText = (
  schedule?: FetchedModuleSchedule,
): { nextRunString?: string; scheduleString?: string } => {
  const nextRunString = schedule?.next_run
    ? `Next run: ${new Date(schedule.next_run).toLocaleString(undefined, {
        dateStyle: 'long',
        timeStyle: 'short',
      })}`
    : undefined;
  const scheduleObj: {
    repetition?: string;
    end?: string;
  } = {};

  if (!schedule?.repetition_config)
    return {
      nextRunString,
    };

  scheduleObj.repetition = `Repeats every ${schedule.repetition_config.quantity} ${schedule.repetition_config.interval}`;

  switch (schedule.repetition_config.interval) {
    case 'months':
      if (schedule.repetition_config.dayOfMonth) {
        scheduleObj.repetition += ` on the ${getOrdinal(schedule.repetition_config.dayOfMonth)}`;
      } else if (schedule.repetition_config.dayOfWeekOfMonth) {
        scheduleObj.repetition += ` on the ${getOrdinal(schedule.repetition_config.dayOfWeekOfMonth.week)} ${
          DAYS_OF_WEEK[schedule.repetition_config.dayOfWeekOfMonth.day]
        }`.trim();
      }
      break;
    case 'weeks':
      if (schedule.repetition_config.daysOfWeek) {
        scheduleObj.repetition += ` on ${schedule.repetition_config.daysOfWeek
          .map((dayNum) => DAYS_OF_WEEK[dayNum].slice(0, 3))
          .join(', ')}`;
      }
  }

  if (schedule.end_date) {
    scheduleObj.end = ` until ${new Date(schedule.end_date).toLocaleDateString(undefined, { dateStyle: 'medium' })}`;
  } else if (schedule.times_to_repeat) {
    scheduleObj.end = `, ${schedule.times_to_repeat} times`;
  }

  return {
    nextRunString,
    scheduleString: `${scheduleObj.repetition}${scheduleObj.end ?? ''}`.trim(),
  };
};
