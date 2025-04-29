interface ILoginRequest {
  email: string;
  password: string;
}

interface ISignupRequest {
  email: string;
  password: string;
  username: string;
  role?:string;
}

export type { ILoginRequest, ISignupRequest };
