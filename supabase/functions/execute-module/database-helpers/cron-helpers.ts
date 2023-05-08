import { Database } from '../types/database.ts';
import * as postgres from 'https://deno.land/x/postgres@v0.17.0/mod.ts';
import dayjs from 'https://deno.land/x/deno_dayjs@v0.2.2/mod.ts';

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

export const setUpCronJob = (
  dbPool: postgres.Pool,
  invokationTimestamp: string,
  schedule: Database['public']['Tables']['module_schedules']['Row'],
) => {
  const currentTimestamp = new Date(invokationTimestamp);
  const initTimestamp = new Date(schedule.next_run);
  const repetitionConfig = schedule.repetition_config as RepetitionConfig;
  let test = dayjs(initTimestamp);
  const dayjsInterval = repetitionConfig.interval.slice(undefined, repetitionConfig.interval.length - 1);

  if (repetitionConfig.interval === 'days') {
    test = test.add(repetitionConfig.quantity, dayjsInterval);
  } else if (repetitionConfig.interval === 'weeks') {
    if (repetitionConfig.daysOfWeek) {
      const lastDayOfWeek = initTimestamp.getUTCDay();
      const lastRunWeekConfigIndex = repetitionConfig.daysOfWeek.findIndex((value) => value === lastDayOfWeek);
      if (lastRunWeekConfigIndex < repetitionConfig.daysOfWeek.length - 1) {
        test = test.set('day', repetitionConfig.daysOfWeek[lastRunWeekConfigIndex + 1]);
      } else {
        test = test.add(repetitionConfig.quantity, dayjsInterval).day(repetitionConfig.daysOfWeek[0]);
      }
    }
  } else if (repetitionConfig.interval === 'months') {
    if (repetitionConfig.dayOfMonth) {
      test = test.add(repetitionConfig.quantity, dayjsInterval);
      const daysInMonth = test.daysInMonth();
      if (daysInMonth < repetitionConfig.dayOfMonth) {
        test = test.date(daysInMonth);
      } else {
        test = test.date(repetitionConfig.dayOfMonth);
      }
    } else if (repetitionConfig.dayOfWeekOfMonth) {
      test = test.add(repetitionConfig.quantity, dayjsInterval);
      // const
    }
  } else {
    test = test.add(repetitionConfig.quantity, dayjsInterval);
  }
};

export const unscheduleCronJob = async (dbPool: postgres.Pool, jobName: string) => {
  try {
    const connection = await dbPool.connect();

    try {
      const queryString = `
        select cron.unschedule('${jobName}');
      `;

      await connection.queryObject(queryString);
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error(err);
    throw new Error(err);
  }
};
