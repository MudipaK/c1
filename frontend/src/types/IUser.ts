interface IUser {
  username: string;
  email: string;
  role: string;
}

interface IUserSlice {
  user: IUser;
  error: string | undefined;
  isLoading: boolean;
}

export type { IUser, IUserSlice };
