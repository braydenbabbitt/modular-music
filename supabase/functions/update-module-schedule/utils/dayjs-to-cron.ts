import { Dayjs } from 'dayjs';

export const dayjsToCron = (day: Dayjs) =>
  `${day.get('minutes')} ${day.get('hours')} ${day.get('date')} ${day.get('month') + 1} ${day.get('day')}`;
