import { IErrorResponse } from "../types";
import { IOrganization } from "../types/IResponse";
import { API } from "../utils";

// Get all organizations
const getOrganizationsAPI = async () => {
  const response = await API.get<IOrganization[], IErrorResponse>("/organizations/getOrganizations");
  if (response.status === 200) {
    return response.data;
  } else {
    throw new Error(response.message);
  }
};

// Create a new organization
const createOrganizationAPI = async (newOrganization: IOrganization) => {
  const response = await API.post<IOrganization, IErrorResponse>(
    "/organizations/createOrganization",
    newOrganization
  );
  if (response.status === 201) {
    return response.data;
  } else {
    return response; // Return the error response directly
  }
};

// Get a specific organization by ID
const getOrganizationByIdAPI = async (id: string) => {
  const response = await API.get<IOrganization, IErrorResponse>(
    `/organizations/getOrganization/${id}`
  );
  if (response.status === 200) {
    return response.data;
  } else {
    throw new Error(response.message);
  }
};

// Update an organization by ID
const updateOrganizationAPI = async (id: string, updatedData: Partial<IOrganization>) => {
  try {
    const response = await API.put<IOrganization, IErrorResponse>(
      `/organizations/updateOrganization/${id}`,
      updatedData
    );
    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error(response.message);
    }
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "Failed to update organization");
  }
};

// Delete an organization by ID
const deleteOrganizationAPI = async (id: string) => {
  const response = await API.delete<IOrganization, IErrorResponse>(
    `/organizations/deleteOrganization/${id}`
  );
  if (response.status === 200) {
    return response.data;
  } else {
    throw new Error(response.message);
  }
};

export { getOrganizationsAPI, createOrganizationAPI, getOrganizationByIdAPI, updateOrganizationAPI, deleteOrganizationAPI };
