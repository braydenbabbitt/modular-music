// import dayjs from 'https://deno.land/x/deno_dayjs@v0.2.2/mod.ts';

// type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;
// type WeekOfMonth = 1 | 2 | 3 | 4 | 5;
// type MonthOfYear = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

// export const findDayOfWeekOfMonth = (
//   dayOfWeek: DayOfWeek,
//   weekOfMonth: WeekOfMonth,
//   month: MonthOfYear,
//   year: number,
// ): Date => {
//   let date = dayjs().date(1).month(month).year(year);
//   date = date.add(weekOfMonth - 1, 'week');
//   const dayOfWeekOffset = date.day();
// };
