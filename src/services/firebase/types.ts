import { User } from '../auth/types';

type FirestoreUser = {
  id: string;
  spotify_user: User;
};
