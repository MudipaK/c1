import { IErrorResponse } from "../types";
import { IEvent } from "../types/IResponse";
import { API } from "../utils";

const createEventAPI = async (newEventData: IEvent) => {
  const response = await API.post<IEvent, IErrorResponse>("/eventsAdmin/createEvent", newEventData);
  if (response.status === 201) {
    return response.data; // Return the created event data
  } else {
    return response; // Return the error response directly
  }
};

// Get a list of all events for a specific organization
const getEventsAPI = async (organizationId: string) => {  
  const response = await API.get<IEvent[], IErrorResponse>(`/eventsAdmin/getEvents/${organizationId}`);
  if (response.status === 200) {
    return response.data; // Return the list of events
  } else {
    throw new Error(response.message);
  }
};

export const getEventByIdAPI = async (id: string): Promise<IEvent | null> => {
  const response = await API.get<IEvent[], IErrorResponse>(`/eventsAdmin/getEventById/${id}`);
  if (response.status === 200) {
    return response.data; // Return the list of events
  } else {
    throw new Error(response.message);
  }
};

// Get all events across all organizations (for admins)
const getAllEventsAPI = async () => {  
  const response = await API.get<IEvent[], IErrorResponse>("/eventsAdmin/getAllEvents");
  if (response.status === 200) {
    return response.data;
  } else {
    throw new Error(response.message);
  }
};

// Get events for a specific organization
const getEventsByOrganizationAPI = async (organizationId: string) => {
  return getEventsAPI(organizationId); // Reuse the same implementation
};

// Update event details
const updateEventAPI = async (eventId: string, updatedEventData: Partial<IEvent>) => {
  const response = await API.put<IEvent, IErrorResponse>(
    `/eventsAdmin/updateEvent/${eventId}`,
    updatedEventData
  );
  if (response.status === 200) {
    return response.data; // Return the updated event data
  } else {
    throw new Error(response.message);
  }
};


const updateEventStatusAPI = async (eventId: string, newStatus: IEvent): Promise<IEvent> => {
  try {
    const response = await API.put<IEvent, IErrorResponse>(
      `/eventsAdmin/updateEventStatus/${eventId}`,
      { eventStatus: newStatus }
    );
    
    if (response.status === 200) {
      return response.data; // Return the updated event data
    } else {
      throw new Error(response.message || "Failed to update event status");
    }
  } catch (error: any) {
    // Check if the error has a response with data
    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || "Error updating event status");
    }
    // Generic error handling
    throw new Error(error.message || "An unexpected error occurred");
  }
};

// Delete an event
const deleteEventAPI = async (eventId: string) => {
  const response = await API.delete<IErrorResponse>(`/eventsAdmin/deleteEvent/${eventId}`);
  if (response.status === 200) {
    return response.data; // Return the success message on delete
  } else {
    throw new Error(response.message);
  }
};

export {
  createEventAPI,
  getEventsAPI,
  getAllEventsAPI,
  getEventsByOrganizationAPI,
  updateEventStatusAPI,
  updateEventAPI,
  deleteEventAPI
};