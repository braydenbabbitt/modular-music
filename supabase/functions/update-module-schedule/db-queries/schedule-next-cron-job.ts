import * as postgres from 'https://deno.land/x/postgres@v0.17.0/mod.ts';
import { Database } from '../types/database.ts';
import dayjs, { ManipulateType } from 'https://esm.sh/v96/dayjs@1.11.9';
import { dayjsToCron } from '../utils/dayjs-to-cron.ts';

const SUPABASE_PROJECT_REF = Deno.env.get('SUPABASE_PROJECT_REF');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

type RepetitionConfig = {
  interval: 'days' | 'weeks' | 'months' | 'years';
  quantity: number;
  daysOfWeek?: number[];
  dayOfMonth?: number;
  dayOfWeekOfMonth?: {
    day: number;
    week: number;
  };
};

export const setUpCronJob = async (
  dbPool: postgres.Pool,
  schedule: Database['public']['Tables']['module_schedules']['Row'],
  isNew: boolean,
) => {
  if (schedule.next_run === null) {
    return;
  }
  const initTimestamp = new Date(schedule.next_run);
  const repetitionConfig = schedule.repetition_config as RepetitionConfig;
  let nextDay = dayjs(initTimestamp);
  const dayjsInterval = repetitionConfig.interval.slice(
    undefined,
    repetitionConfig.interval.length - 1,
  ) as ManipulateType;

  if (!isNew) {
    if (repetitionConfig.interval === 'days') {
      nextDay = nextDay.add(repetitionConfig.quantity, dayjsInterval);
    } else if (repetitionConfig.interval === 'weeks') {
      if (repetitionConfig.daysOfWeek) {
        const lastDayOfWeek = initTimestamp.getUTCDay();
        const lastRunWeekConfigIndex = repetitionConfig.daysOfWeek.findIndex((value) => value === lastDayOfWeek);
        if (lastRunWeekConfigIndex < repetitionConfig.daysOfWeek.length - 1) {
          nextDay = nextDay.set('day', repetitionConfig.daysOfWeek[lastRunWeekConfigIndex + 1]);
        } else {
          nextDay = nextDay.add(repetitionConfig.quantity, dayjsInterval).day(repetitionConfig.daysOfWeek[0]);
        }
      }
    } else if (repetitionConfig.interval === 'months') {
      if (repetitionConfig.dayOfMonth) {
        nextDay = nextDay.add(repetitionConfig.quantity, dayjsInterval);
        const daysInMonth = nextDay.daysInMonth();
        if (daysInMonth < repetitionConfig.dayOfMonth) {
          nextDay = nextDay.date(daysInMonth);
        } else {
          nextDay = nextDay.date(repetitionConfig.dayOfMonth);
        }
      } else if (repetitionConfig.dayOfWeekOfMonth) {
        nextDay = nextDay.add(repetitionConfig.quantity, dayjsInterval);
        nextDay = nextDay.set('date', 1);
        nextDay = nextDay.set('day', repetitionConfig.dayOfWeekOfMonth.day);
        const daysInNextMonth = nextDay.daysInMonth();
        let daysToAdd = (repetitionConfig.dayOfWeekOfMonth.week - 1) * 7;
        if (nextDay.date() + daysToAdd > daysInNextMonth) {
          daysToAdd -= 7;
        }
        nextDay = nextDay.add(daysToAdd, 'day');
      }
    } else {
      nextDay = nextDay.add(repetitionConfig.quantity, dayjsInterval);
    }
  }

  try {
    const connection = await dbPool.connect();
    try {
      const queryString = `
        select
          cron.schedule(
            '${schedule.id}',
            '${dayjsToCron(nextDay)}',
            $$
            select
              net.http_post(
                url:='https://${SUPABASE_PROJECT_REF}.functions.supabase.co/execute-module',
                headers:='{"Content-Type": "application/json", "Authorization": "Bearer ${SUPABASE_SERVICE_ROLE_KEY}"}'::jsonb,
                body:='{"moduleId": "${schedule.module_id}", "scheduleId": "${schedule.id}"}'::jsonb
              ) as request_id;
            $$
          );
      `;
      await connection.queryObject(queryString);
    } catch (error) {
      console.error(error);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};
