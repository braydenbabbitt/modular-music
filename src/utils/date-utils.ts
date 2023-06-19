import dayjs from 'dayjs';

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type WeekOfMonth = 1 | 2 | 3 | 4 | 5;
export type MonthOfYear = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

export const findDayOfWeekOfMonth = (
  dayOfWeek: DayOfWeek,
  weekOfMonth: WeekOfMonth,
  month: MonthOfYear,
  year: number,
) => {
  let date = dayjs().date(1).month(month).year(year);
  date = date.add(weekOfMonth - 1, 'week').set('day', dayOfWeek);

  console.log({ result: date.toISOString() });
};
