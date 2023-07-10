import { Dayjs } from 'https://esm.sh/v96/dayjs@1.11.9';
// import { Dayjs } from 'https://deno.land/x/deno_dayjs@v0.2.2/mod.ts';

export const dayjsToCron = (day: Dayjs) =>
  `${day.get('minutes')} ${day.get('hours')} ${day.get('date')} ${day.get('month') + 1} ${day.get('day')}`;
