import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  IErrorResponse,
  IGetUserDetailsResponse,
  ILoginRequest,
  ILoginResponse,
  ISignupRequest,
  ISignupResponse,
  IUserSlice,
} from "../../types";
import { getUserDetailsAPI, loginAPI, signupAPI } from "../../services";

const initialState: IUserSlice = {
  error: "",
  isLoading: false,
  user: {
    email: "",
    role: "",
    username: "",
  },
};

export const userLogin = createAsyncThunk<
  ILoginResponse,
  ILoginRequest,
  { rejectValue: IErrorResponse }
>("user/login", async ({ email, password }, { rejectWithValue }) => {
  const response = await loginAPI({ email, password });

  if (response.status === 200) {
    return response.data;
  } else {
    return rejectWithValue(response);
  }
});

export const userSignup = createAsyncThunk<
  ISignupResponse,
  ISignupRequest,
  { rejectValue: IErrorResponse }
>("user/signup", async ({ email, password, username, role }, { rejectWithValue }) => {
  const response = await signupAPI({ email, password, username ,role });

  if (response.status === 200) {
    return response.data;
  } else {
    return rejectWithValue(response);
  }
});

export const getUserDetails = createAsyncThunk<
  IGetUserDetailsResponse,
  void,
  { rejectValue: IErrorResponse }
>("user/getUserDetails", async (_, { rejectWithValue }) => {
  const response = await getUserDetailsAPI();
  if (response.status === 200) {
    return response.data;
  } else {
    return rejectWithValue(response);
  }
});

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(userLogin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = "";
        state.user = {
          username: action.payload.username,
          email: action.payload.email,
          role: action.payload.role,
        };
        localStorage.setItem("token", action.payload.token);

        return state;
      })
      .addCase(userLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.originalError.message;
        state.user = {
          username: "",
          email: "",
          role: "",
        };
        return state;
      })
      .addCase(userLogin.pending, (state) => {
        state.isLoading = true;
        state.error = "";
        state.user = {
          username: "",
          email: "",
          role: "",
        };
        return state;
      })
      .addCase(userSignup.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = "";
        state.user = {
          username: action.payload.username,
          email: action.payload.email,
          role: action.payload.role,
        };
        localStorage.setItem("token", action.payload.token);

        return state;
      })
      .addCase(userSignup.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.originalError.message;
        state.user = {
          username: "",
          email: "",
          role: "",
        };
        return state;
      })
      .addCase(userSignup.pending, (state) => {
        state.isLoading = true;
        state.error = "";
        state.user = {
          username: "",
          email: "",
          role: "",
        };
        return state;
      })
      .addCase(getUserDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = "";
        state.user = {
          username: action.payload.username,
          email: action.payload.email,
          role: action.payload.role,
        };
      })
      .addCase(getUserDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.originalError.message;
        state.user = {
          username: "",
          email: "",
          role: "",
        };
        localStorage.removeItem("token");
        return state;
      })
      .addCase(getUserDetails.pending, (state) => {
        state.isLoading = true;
        state.error = "";
        state.user = {
          username: "",
          email: "",
          role: "",
        };
        return state;
      });
  },
});

export default userSlice.reducer;
