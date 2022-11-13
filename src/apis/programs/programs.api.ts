import { WriteUserProgramRequest, GetUserProgramsRequest, RemoveUserProgramRequest } from './types';
import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, setDoc } from 'firebase/firestore';
import { Program } from '../../pages/dashboard/components/programs-block.component';
import { firestore } from '../../services/firebase/config';

export const getUserPrograms = async ({ userId }: GetUserProgramsRequest) => {
  const querySnapshot = await getDocs(query(collection(firestore, 'users', userId, 'programs'), orderBy('created_at')));

  return querySnapshot.docs.map(
    (doc) =>
      ({
        id: doc.id,
        ...doc.data(),
      } as Program),
  );
};

export const removeUserProgram = async ({ userId, programId }: RemoveUserProgramRequest) => {
  return await deleteDoc(doc(firestore, 'users', userId, 'programs', programId)).then(() => {
    return getUserPrograms({ userId });
  });
};

export const writeUserProgram = async ({ userId, name, programId }: WriteUserProgramRequest) => {
  const userProgramsCollection = collection(firestore, 'users', userId, 'programs');
  if (programId) {
    return await setDoc(
      doc(userProgramsCollection, programId),
      {
        name,
        edited_at: Date.now(),
      },
      { merge: true },
    ).then(() => {
      return getUserPrograms({ userId });
    });
  } else {
    return await addDoc(userProgramsCollection, {
      name,
      created_at: Date.now(),
    }).then(() => {
      return getUserPrograms({ userId });
    });
  }
};
