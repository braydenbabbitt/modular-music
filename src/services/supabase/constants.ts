export const SOURCE_TYPE_IDS = {
  USER_PLAYLIST: 'e6273f47-8dfc-485c-b594-0bb4dc80a1d3',
  USER_LIKED_TRACKS: 'c8ccb32b-60b8-4c0e-9685-29063e63e755',
  USER_RECENTLY_LISTENED: 'f27db10a-fcb4-430f-aa24-88059e7aedd3',
};

export const ACTION_TYPE_IDS = {
  SHUFFLE: '35671195-8273-4614-90c7-f5bb4886b742',
  FILTER: '7380d20f-0b72-46d5-b9e8-f9670e9134f4',
};

export const INTERVAL_MAP = {
  1: 'days',
  7: 'weeks',
  30: 'months',
  365: 'years',
} as const;
