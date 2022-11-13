export type GetUserProgramsRequest = {
  userId: string;
};

export type RemoveUserProgramRequest = {
  userId: string;
  programId: string;
};

export type WriteUserProgramRequest = {
  userId: string;
  name: string;
  programId?: string;
};
