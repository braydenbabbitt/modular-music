import shuffle from 'https://deno.land/x/shuffle@v1.0.1/mod.ts';
import { SimpleTrack } from '../types/generics.ts';

export const shuffleSongList = (list: SimpleTrack[]) => {
  return shuffle(list);
};
