import { filterSongList } from './filter-song-list.ts';
import { shuffleSongList } from './shuffle-song-list.ts';

export const MAPPED_ACTIONS = {
  '35671195-8273-4614-90c7-f5bb4886b742': shuffleSongList,
  '7380d20f-0b72-46d5-b9e8-f9670e9134f4': filterSongList,
} as const;
