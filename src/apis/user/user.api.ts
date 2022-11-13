import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '../../services/firebase/config';

export const getUser = async (id: string) => {
  return (await getDoc(doc(firestore, 'users', id))).data();
};
