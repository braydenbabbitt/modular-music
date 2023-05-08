export type SimpleTrack = {
  id: string;
  uri: string;
};

export const ACTION_TYPE_IDS = {
  SHUFFLE: '35671195-8273-4614-90c7-f5bb4886b742',
  FILTER: '7380d20f-0b72-46d5-b9e8-f9670e9134f4',
};

export type TsPrimitive = 'string' | 'number' | 'bigint' | 'boolean' | 'symbol' | 'undefined' | 'object' | 'function';
