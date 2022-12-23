import { INTERVAL_MAP } from '../services/supabase/constants';

export const convertRecentlyPlayedToDescription = (quantity: number, interval: string | number) => {
  return quantity === 1
    ? `Last ${INTERVAL_MAP[typeof interval === 'string' ? parseInt(interval) : interval].slice(0, -1)}`
    : `Last ${quantity} ${INTERVAL_MAP[typeof interval === 'string' ? parseInt(interval) : interval]}`;
};
