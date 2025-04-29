import { IErrorResponse} from "../types";
import { IUser } from "../types/IResponse";
import { API } from "../utils";

const getUsersAPI = async () => {
  const response = await API.get<IUser[], IErrorResponse>("/users/getUsers");
  if (response.status === 200) {
    return response.data;
  } else {
    throw new Error(response.message);
  }
};
const updateUserAPI = async (id: string, updatedData: Partial<IUser>) => {
  try {
    const response = await API.put<IUser, IErrorResponse>(
      `/users/updateUser/${id}`,
      updatedData
    );
    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error(response.message);
    }
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "Failed to update user");
  }
};

const deleteUserAPI = async (id: string) => {
  const response = await API.delete<IUser, IErrorResponse>(
    `/users/deleteUser/${id}`
  );
  return response;
};

export { getUsersAPI, deleteUserAPI, updateUserAPI };
