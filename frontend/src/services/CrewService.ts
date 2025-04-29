import { IErrorResponse } from "../types";
import { ICrew, ICrewMember } from "../types/IResponse";
import { API } from "../utils";

// Create a new crew
const createCrewAPI = async (newCrewData: ICrew) => {
  const response = await API.post<ICrew, IErrorResponse>("/crews/createCrew", newCrewData);
  if (response.status === 201) {
    return response.data; // Return the created crew data
  } else {
    throw new Error(response.message);
  }
};

// Add a crew member to a specific crew
const addCrewMemberAPI = async (crewId: string, newMemberData: ICrewMember) => {
  const response = await API.post<ICrew, IErrorResponse>(`/crews/addCrewMember/${crewId}`, newMemberData);
  if (response.status === 200) {
    return response.data; // Return the updated crew data
  } else {
    throw new Error(response.message);
  }
};

// Get a list of all crews
const getCrewsAPI = async () => {
  const response = await API.get<ICrew[], IErrorResponse>("/crews/getCrews");
  if (response.status === 200) {
    return response.data; // Return the list of crews
  } else {
    throw new Error(response.message);
  }
};

// Update crew status (Active/Inactive)
const updateCrewStatusAPI = async (crewId: string, status: string) => {
  const response = await API.put<ICrew, IErrorResponse>(`/crews/updateCrewStatus/${crewId}`, { status });
  if (response.status === 200) {
    return response.data; // Return the updated crew status
  } else {
    throw new Error(response.message);
  }
};

// Update crew details
const updateCrewAPI = async (crewId: string, updatedCrewData: ICrew) => {
  const response = await API.put<ICrew, IErrorResponse>(`/crews/updateCrew/${crewId}`, updatedCrewData);
  if (response.status === 200) {
    return response.data; // Return the updated crew data
  } else {
    throw new Error(response.message);
  }
};

// Delete a crew
const deleteCrewAPI = async (crewId: string) => {
  const response = await API.delete<IErrorResponse>(`/crews/deleteCrew/${crewId}`);
  if (response.status === 200) {
    return response.data; // Return the success message on delete
  } else {
    throw new Error(response.message);
  }
};

// Update crew member details
const updateCrewMemberAPI = async (crewId: string, memberId: string, updatedMemberData: ICrewMember) => {
  const response = await API.put<ICrew, IErrorResponse>(`/crews/updateCrewMember/${crewId}/${memberId}`, updatedMemberData);
  if (response.status === 200) {
    return response.data; // Return the updated crew member data
  } else {
    throw new Error(response.message);
  }
};

// Remove a crew member from a crew
const removeCrewMemberAPI = async (crewId: string, memberId: string) => {
  const response = await API.delete<IErrorResponse>(`/crews/removeCrewMember/${crewId}/${memberId}`);
  if (response.status === 200) {
    return response.data; // Return the updated crew data after member removal
  } else {
    throw new Error(response.message);
  }
};

export {
  createCrewAPI,
  addCrewMemberAPI,
  getCrewsAPI,
  updateCrewStatusAPI,
  updateCrewAPI,
  deleteCrewAPI,
  updateCrewMemberAPI,
  removeCrewMemberAPI,
};
