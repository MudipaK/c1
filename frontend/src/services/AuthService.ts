import {
  IErrorResponse,
  IGetUserDetailsResponse,
  ILoginRequest,
  ILoginResponse,
  ISignupRequest,
  ISignupResponse,
} from "../types";
import { API } from "../utils";

const loginAPI = async ({ email, password }: ILoginRequest) => {
  const response = await API.post<ILoginResponse, IErrorResponse>(
    "/auth/login",
    { email, password }
  );
  return response;
};

const signupAPI = async ({ email, password, username,role}: ISignupRequest) => {
  const response = await API.post<ISignupResponse, IErrorResponse>(
    "/auth/register",
    { email, password, username,role }
  );
  return response;
};

const getUserDetailsAPI = async () => {
  const response = await API.get<IGetUserDetailsResponse, IErrorResponse>(
    "/auth/getUserDetails"
  );
  console.log(response);
  return response;
};

export { loginAPI, getUserDetailsAPI, signupAPI };
