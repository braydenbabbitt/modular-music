import { SimpleTrack } from '../types/generics.ts';
import { MAPPED_ACTION_IDS } from './constants.ts';
import { filterSongList } from './filter-song-list.ts';
import { shuffleSongList } from './shuffle-song-list.ts';

export const runAction = (actionTypeId: string, list: SimpleTrack[]): SimpleTrack[] => {
  switch (actionTypeId) {
    case MAPPED_ACTION_IDS.SHUFFLE:
      return shuffleSongList(list);
    case MAPPED_ACTION_IDS.FILTER:
      // return filterSongList();
      return list;
    default:
      return list;
  }
};
