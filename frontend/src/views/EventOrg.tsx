import { useState, useEffect } from "react";
import {
  getEventsAPI,
  createEventAPI,
  updateEventAPI,
  deleteEventAPI,
  updateEventStatusAPI,
} from "../services/EventService";
import { IEvent } from "../types/IResponse";
import EditUserDialog from "../components/common/EditUserDialog";
import CreateEventDialog from "../components/common/CreateEventDialog";
import SideBarOrg from "../components/SideBar/SideBarOrg";
import { IUser } from "../types";
import { getUserDetailsAPI } from "../services";
import { getUsersAPI } from "../services/UserService";
import { getOrganizationsAPI } from "../services/OrganizationService";
import ViewEventModal from "../components/common/ViewEventModal";
import {
  FiCalendar,
  FiClock,
  FiFilter,
  FiUser,
  FiSearch,
  FiEdit3,
  FiEye,
  FiTrash2,
  FiCheckSquare,
  FiXSquare,
} from "react-icons/fi";
import {
  MdOutlineEventNote,
  MdEvent,
  MdPending,
  MdDateRange,
  MdAccessTime,
  MdCategory,
  MdAdd,
  MdVerified,
} from "react-icons/md";
import Button from "../components/Button/IconButton";
import { toast } from "react-toastify";
import UpdateEventForm from "../components/common/UpdateEventForm";
import EventStatusModal from "../components/common/EventStatusModal";

const ManageEvents = () => {
  const [events, setEvents] = useState<IEvent[]>([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  // Add these state variables near your other state declarations
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<IEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingEvent, setEditingEvent] = useState<IEvent | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [userDetails, setUserDetails] = useState<IUser | null>(null);
  const [organisationID, setOrganisationID] = useState<string>("");
  const [viewingEvent, setViewingEvent] = useState<IEvent | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeletingEvent, setIsDeletingEvent] = useState(false);
  const [userRole, setUserRole] = useState<"president" | "staffAdvisor" | "">(
    ""
  );
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [orgName, setOrgName] = useState<string>("");
  const [handleStatusEditModal, setHandleStatusEditModal] = useState(false);
  const [handleStatusEditEvent, setHandleStatusEditEvent] =
    useState<IEvent | null>(null);
  const [displayMode, setDisplayMode] = useState<"table" | "grid">("table");

  useEffect(() => {
    // Check screen size for initial display mode
    const handleResize = () => {
      setDisplayMode(window.innerWidth < 768 ? "grid" : "table");
    };

    // Set initial display mode
    handleResize();

    // Add resize event listener
    window.addEventListener("resize", handleResize);

    // Initialize the component data flow
    const initData = async () => {
      try {
        await fetchUserDetails();
      } catch (error) {
        console.error("Failed to initialize component data:", error);
        setLoading(false);
      }
    };

    initData();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // When userDetails is updated, fetch organizations
  useEffect(() => {
    if (userDetails && userDetails._id) {
      fetchOrganizations();
    }
  }, [userDetails]);

  const fetchUserDetails = async () => {
    try {
      // Get current user's details (including email)
      const currentUser = await getUserDetailsAPI();

      if (!currentUser || !currentUser.data || !currentUser.data.email) {
        console.error("Failed to get current user details or email");
        setLoading(false);
        return;
      }

      // Get all users
      const allUsers = await getUsersAPI();

      // Find the user with matching email
      const matchedUser = allUsers.find(
        (user) => user.email === currentUser.data.email
      );

      if (matchedUser) {
        // Set the full user details including ID and any other properties
        setUserDetails(matchedUser);
        console.log("User details matched and set:", matchedUser);
      } else {
        console.error(
          "No matching user found with email:",
          currentUser.data.email
        );
        // Set error state and stop loading
        setError("User not found in the system");
        setLoading(false);
      }
    } catch (error) {
      console.error("Failed to fetch user details", error);
      setError("Failed to load user information");
      setLoading(false);
    }
  };

  const fetchOrganizations = async () => {
    try {
      // First check if userDetails exists
      if (!userDetails || !userDetails._id) {
        console.error("User details not available");
        setLoading(false);
        return;
      }

      // Get all organizations
      const response = await getOrganizationsAPI();

      if (!Array.isArray(response) || response.length === 0) {
        console.error(
          "Invalid organization data received or no organizations found"
        );
        setError("No organizations found");
        setLoading(false);
        return;
      }

      // Find organization where user is president or staff advisor
      const userOrg = response.find((org) => {
        const isPresident =
          org.president &&
          (org.president._id === userDetails._id ||
            org.president === userDetails._id);

        const isStaffAdvisor =
          org.staffAdvisor &&
          (org.staffAdvisor._id === userDetails._id ||
            org.staffAdvisor === userDetails._id);

        // Save the user's role in the organization
        if (isPresident) {
          setUserRole("president");
        } else if (isStaffAdvisor) {
          setUserRole("staffAdvisor");
        }

        return isPresident || isStaffAdvisor;
      });

      if (userOrg) {
        console.log("Found user's organization:", userOrg.name);
        setOrganisationID(userOrg._id);
        setOrgName(userOrg.name);

        // Now that we have the organization ID, we can fetch events for this organization
        fetchEventsForOrganization(userOrg._id);
      } else {
        console.log("User is not assigned to any organization");
        setError("You are not assigned to any organization");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching organizations:", error);
      setError("Failed to load organizations");
      setLoading(false);
    }
  };

  // Helper function to fetch events for a specific organization
  const fetchEventsForOrganization = async (orgId) => {
    try {
      const events = await getEventsAPI(orgId);
      if (Array.isArray(events)) {
        setEvents(events);
      } else {
        setError("Failed to load events");
      }
    } catch (error) {
      console.error("Error fetching events for organization:", error);
      setError("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingEvent) return;
    if (!organisationID) {
      showMessage("No organization selected", true);
      return;
    }

    try {
      // Include organization ID in the update
      const updatedEvent = {
        ...editingEvent,
        organizationId: organisationID,
      };

      const updated = await updateEventAPI(editingEvent.eventID, updatedEvent);
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.eventID === editingEvent.eventID ? updated : event
        )
      );
      setIsEditDialogOpen(false);
      showMessage("Event updated successfully");
    } catch (error) {
      console.error("Update error:", error);
      showMessage("Failed to update event", true);
    }
  };

  const handleCreate = async (newEvent: IEvent) => {
    if (!organisationID) {
      showMessage("No organization selected", true);
      return;
    }

    try {
      // Include the organization ID
      const eventData = {
        ...newEvent,
        organizationId: organisationID,
      };

      const createdEvent = await createEventAPI(eventData);
      if (createdEvent.status === 400) {
        toast.error(createdEvent.originalError.message);
        return;
      }
      if (!createdEvent) {
        throw new Error("Failed to create event");
      }
      // Update the events state with the newly created event
      fetchUserDetails(); // Refresh user details to get the latest events
      fetchOrganizations(); // Refresh organizations to get the latest events
      setIsCreateDialogOpen(false);
      setEvents((prev) => [...prev, createdEvent]);
      showMessage("Event created successfully");
    } catch (error) {
      console.error("Create error:", error);
      showMessage("Failed to create event", true);
    }
  };

  const showMessage = (msg: string, isError = false) => {
    setError(msg);
    setTimeout(() => {
      setError("");
    }, 3000);
  };

  const filteredEvents = events
    .filter((event) =>
      event.eventName?.toLowerCase().includes(search.toLowerCase())
    )
    .filter((event) =>
      statusFilter === "all" ? true : event.eventStatus === statusFilter
    )
    .filter((event) =>
      typeFilter === "all" ? true : event.eventType === typeFilter
    );

  // Get unique event types for filter
  const eventTypes = Array.from(
    new Set(events.map((event) => event.eventType))
  ).filter(Boolean);

  // Only show create button for presidents
  const canCreateEvent =
    userRole === "president" || userRole === "staffAdvisor";
  // Only presidents can edit and delete events
  const canManageEvents =
    userRole === "president" || userRole === "staffAdvisor";
  // Only staff advisors can update event status
  const canUpdateStatus = userRole === "staffAdvisor";

  // Stats calculations
  const totalEvents = events.length;
  const pendingEvents = events.filter(
    (e) => e.eventStatus === "Pending"
  ).length;
  const approvedEvents = events.filter(
    (e) => e.eventStatus === "Approved"
  ).length;
  const rejectedEvents = events.filter(
    (e) => e.eventStatus === "Rejected"
  ).length;

  const handleViewEvent = (event: IEvent) => {
    setViewingEvent(event);
    setIsViewModalOpen(true);
  };

  // Modified handleEdit function
  const handleEdit = (event: IEvent) => {
    setEditingEvent(event);
    setIsEditDialogOpen(true);
  };

  const handleStatusEdit = (event: IEvent) => {
    setHandleStatusEditEvent(event);
    setHandleStatusEditModal(true);
  };

  // New function to handle event updates from UpdateEventForm
  const handleUpdateEvent = async (updatedEvent: IEvent): Promise<void> => {
    if (!organisationID) {
      toast.error("No organization selected");
      throw new Error("No organization selected");
    }

    try {
      // Include organization ID in the update
      const eventWithOrgId = {
        ...updatedEvent,
        organizationId: organisationID,
      };

      // Keep track of the old status if it exists for notifications
      const oldStatus = events.find(
        (e) => e._id === updatedEvent._id
      )?.eventStatus;

      // Call API to update the event
      const updated = await updateEventAPI(updatedEvent._id, eventWithOrgId);
      fetchUserDetails(); // Refresh user details to get the latest events
      fetchOrganizations(); // Refresh organizations to get the latest events
      // Update the events state
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event._id === updatedEvent._id ? updated : event
        )
      );

      toast.success("Event updated successfully");
      return Promise.resolve();
    } catch (error: any) {
      console.error("Update error:", error);
      toast.error(error.message || "Failed to update event");
      throw error;
    }
  };

  const handleUpdateEventStatus = async (
    eventId: string,
    newStatus: string
  ): Promise<void> => {
    if (!organisationID) {
      toast.error("No organization selected");
      throw new Error("No organization selected");
    }

    try {
      // Find the event to update
      const eventToUpdate = events.find((e) => e._id === eventId);
      if (!eventToUpdate) {
        throw new Error("Event not found");
      }

      // Keep track of the old status for notifications
      const oldStatus = eventToUpdate.eventStatus;

      // Create payload with just the status change
      const statusUpdatePayload = {
        ...eventToUpdate,
        eventStatus: newStatus,
        organizationId: organisationID,
      };

      // Call API to update the event
      const updated = await updateEventStatusAPI(eventId, statusUpdatePayload);
      fetchUserDetails(); // Refresh user details to get the latest events
      fetchOrganizations(); // Refresh organizations to get the latest events

      // Show success notification
      toast.success(`Event status updated to ${newStatus}`);

      // Close the modal
      setHandleStatusEditModal(false);

      return Promise.resolve();
    } catch (error: any) {
      console.error("Status update error:", error);
      toast.error(error.message || "Failed to update event status");
      throw error;
    }
  };

  // Replace the existing handleDelete function
  const handleDelete = async (eventID: string) => {
    if (!organisationID) {
      showMessage("No organization selected", true);
      setIsDeletingEvent(false); // Reset loading state if there's no organization
      return;
    }

    try {
      await deleteEventAPI(eventID);
      fetchUserDetails(); // Refresh user details to get the latest events
      fetchOrganizations(); // Refresh organizations to get the latest events
      toast.success("Event deleted successfully");
      setEvents((prev) =>
        prev.filter((e) => e.eventID !== eventID || e._id !== eventID)
      );
      showMessage("Event deleted successfully");
      // Close the modal after successful deletion
      setIsDeleteModalOpen(false);
      setEventToDelete(null);
    } catch (error) {
      console.error("Delete error:", error);
      showMessage("Failed to delete event", true);
    } finally {
      setIsDeletingEvent(false); // Always reset the loading state
    }
  };

  // Add a new function to handle delete button click
  const handleDeleteClick = (event: IEvent) => {
    setEventToDelete(event);
    setIsDeleteModalOpen(true);
  };

  const DeleteConfirmationModal = () => {
    if (!isDeleteModalOpen || !eventToDelete) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-xl font-bold mb-4 text-gray-800">
            Confirm Deletion
          </h2>

          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete the following event? This action
              cannot be undone.
            </p>

            <div className="bg-red-50 p-4 rounded-md border-l-4 border-red-500">
              <p className="font-semibold text-gray-800">
                {eventToDelete.eventName}
              </p>
              <div className="mt-2 flex items-center text-sm text-gray-600">
                <MdDateRange className="mr-2 text-gray-500" />
                <span>{eventToDelete.eventDate}</span>
              </div>
              <div className="mt-1 flex items-center text-sm text-gray-600">
                <MdAccessTime className="mr-2 text-gray-500" />
                <span>
                  {eventToDelete.eventStartTime} -{" "}
                  {eventToDelete.eventFinishTime}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => {
                setIsDeleteModalOpen(false);
                setEventToDelete(null);
              }}
              disabled={isDeletingEvent}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setIsDeletingEvent(true);
                handleDelete(eventToDelete._id);
              }}
              disabled={isDeletingEvent}
              className={`px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center ${
                isDeletingEvent ? "opacity-75 cursor-not-allowed" : ""
              }`}
            >
              {isDeletingEvent ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Deleting...
                </>
              ) : (
                <>
                  <FiTrash2 className="mr-2" />
                  Delete Event
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Fixed sidebar - now properly styled */}
      <div className="w-64 fixed inset-y-0 left-0 z-10 shadow-lg bg-white">
        <SideBarOrg />
      </div>

      {/* Main content - with proper offset to account for fixed sidebar */}
      <main className="flex-grow pl-64 w-full mt-18">
        <div className="p-6 max-w-screen-2xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-blue-700 flex items-center">
                <MdOutlineEventNote className="mr-2 text-3xl" />
                Manage Events
              </h2>
              <p className="text-gray-500 mt-1">
                {orgName
                  ? `Managing events for ${orgName}`
                  : "No organization selected"}
              </p>
            </div>

            {userRole && (
              <div className="mt-2 md:mt-0 px-4 py-2 bg-blue-50 text-blue-700 rounded-md flex items-center">
                <MdVerified className="mr-2" />
                <p>
                  {userRole === "president"
                    ? "Organization President"
                    : "Staff Advisor"}
                </p>
              </div>
            )}
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-blue-500">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-500 text-sm">Total Events</p>
                  <p className="text-2xl font-bold">{totalEvents}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <MdEvent className="text-blue-500 text-xl" />
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-yellow-500">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-500 text-sm">Pending</p>
                  <p className="text-2xl font-bold">{pendingEvents}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <MdPending className="text-yellow-500 text-xl" />
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-green-500">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-500 text-sm">Approved</p>
                  <p className="text-2xl font-bold">{approvedEvents}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <FiCheckSquare className="text-green-500 text-xl" />
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-red-500">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-500 text-sm">Rejected</p>
                  <p className="text-2xl font-bold">{rejectedEvents}</p>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <FiXSquare className="text-red-500 text-xl" />
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div
              className={`mb-4 p-3 rounded-md ${
                error.includes("successfully")
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {error}
            </div>
          )}

          {/* Search and Filter Controls */}
          <div className="bg-white p-4 rounded-lg shadow-md mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by event name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 p-3 border border-gray-300 rounded-md w-full"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <div className="flex items-center">
                  <FiFilter className="mr-2 text-gray-500" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="p-2 border border-gray-300 rounded-md bg-white"
                  >
                    <option value="all">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                {eventTypes.length > 0 && (
                  <div className="flex items-center">
                    <MdCategory className="mr-2 text-gray-500" />
                    <select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      className="p-2 border border-gray-300 rounded-md bg-white"
                    >
                      <option value="all">All Types</option>
                      {eventTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {canCreateEvent && (
                  <Button
                    text="Create Event"
                    icon={<MdAdd />}
                    size="sm"
                    onClick={() => setIsCreateDialogOpen(true)}
                  />
                )}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="animate-spin h-12 w-12 border-t-2 border-blue-500 rounded-full mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading events...</p>
            </div>
          ) : (
            <>
              {displayMode === "table" ? (
                <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="bg-blue-50 text-left border-b border-blue-100">
                        <tr>
                          <th className="p-4 text-blue-700">Name</th>
                          <th className="p-4 text-blue-700">Date</th>
                          <th className="p-4 text-blue-700">Time</th>
                          <th className="p-4 text-blue-700">Type</th>
                          <th className="p-4 text-blue-700">Status</th>
                          <th className="p-4 text-blue-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredEvents.length ? (
                          filteredEvents.map((event) => (
                            <tr
                              key={event.eventID}
                              className="border-b hover:bg-gray-50 transition-colors"
                            >
                              <td className="p-4 font-medium">
                                {event.eventName}
                              </td>
                              <td className="p-4">
                                <div className="flex items-center">
                                  <MdDateRange className="mr-2 text-gray-500" />
                                  {event.eventDate}
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center">
                                  <MdAccessTime className="mr-2 text-gray-500" />
                                  {event.eventStartTime} -{" "}
                                  {event.eventFinishTime}
                                </div>
                              </td>
                              <td className="p-4">
                                <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                                  {event.eventType}
                                </span>
                              </td>
                              <td className="p-4">
                                <span
                                  className={`px-3 py-1 rounded-full text-sm font-medium inline-flex items-center ${
                                    event.eventStatus === "Approved"
                                      ? "bg-green-100 text-green-800"
                                      : event.eventStatus === "Rejected"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-yellow-100 text-yellow-800"
                                  }`}
                                >
                                  {event.eventStatus === "Approved" ? (
                                    <FiCheckSquare className="mr-1" />
                                  ) : event.eventStatus === "Rejected" ? (
                                    <FiXSquare className="mr-1" />
                                  ) : (
                                    <MdPending className="mr-1" />
                                  )}
                                  {event.eventStatus}
                                </span>
                              </td>
                              <td className="p-4">
                                <div className="flex flex-wrap gap-2">
                                  <Button
                                    text="View"
                                    icon={<FiEye />}
                                    size="xs"
                                    onClick={() => handleViewEvent(event)}
                                  />
                                  {canManageEvents && (
                                    <>
                                      <Button
                                        text="Edit"
                                        icon={<FiEdit3 />}
                                        size="xs"
                                        onClick={() => handleEdit(event)}
                                      />
                                      <Button
                                        text="Delete"
                                        icon={<FiTrash2 />}
                                        size="xs"
                                        color="danger"
                                        onClick={() => handleDeleteClick(event)}
                                      />
                                    </>
                                  )}
                                  {canUpdateStatus &&
                                    event.eventStatus === "Pending" && (
                                      <Button
                                        text="Status"
                                        size="xs"
                                        color="secondary"
                                        onClick={() => handleStatusEdit(event)}
                                      />
                                    )}
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan={6}
                              className="text-center p-6 text-gray-500"
                            >
                              No events found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredEvents.length ? (
                    filteredEvents.map((event) => (
                      <div
                        key={event.eventID}
                        className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 flex flex-col"
                      >
                        <div className="p-4 border-b bg-blue-50">
                          <h3 className="text-lg font-semibold">
                            {event.eventName}
                          </h3>
                          <span
                            className={`mt-2 px-3 py-1 rounded-full text-sm font-medium inline-flex items-center ${
                              event.eventStatus === "Approved"
                                ? "bg-green-100 text-green-800"
                                : event.eventStatus === "Rejected"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {event.eventStatus === "Approved" ? (
                              <FiCheckSquare className="mr-1" />
                            ) : event.eventStatus === "Rejected" ? (
                              <FiXSquare className="mr-1" />
                            ) : (
                              <MdPending className="mr-1" />
                            )}
                            {event.eventStatus}
                          </span>
                        </div>

                        <div className="p-4 space-y-3 flex-grow">
                          <div className="flex items-center">
                            <MdDateRange className="text-blue-500 mr-2" />
                            <div>
                              <p className="text-xs text-gray-500">Date</p>
                              <p>{event.eventDate}</p>
                            </div>
                          </div>

                          <div className="flex items-center">
                            <MdAccessTime className="text-green-500 mr-2" />
                            <div>
                              <p className="text-xs text-gray-500">Time</p>
                              <p>
                                {event.eventStartTime} - {event.eventFinishTime}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center">
                            <MdCategory className="text-purple-500 mr-2" />
                            <div>
                              <p className="text-xs text-gray-500">Type</p>
                              <p>{event.eventType}</p>
                            </div>
                          </div>
                        </div>

                        <div className="p-3 bg-gray-50 border-t flex justify-between flex-wrap gap-2">
                          <Button
                            text="View"
                            icon={<FiEye />}
                            size="xs"
                            color="info"
                            onClick={() => handleViewEvent(event)}
                          />
                          {canManageEvents && (
                            <>
                              <Button
                                text="Edit"
                                icon={<FiEdit3 />}
                                size="xs"
                                onClick={() => handleEdit(event)}
                              />
                              <Button
                                text="Delete"
                                icon={<FiTrash2 />}
                                size="xs"
                                color="danger"
                                onClick={() => handleDeleteClick(event)}
                              />
                            </>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full p-8 bg-white rounded-lg shadow-md text-center">
                      <p className="text-gray-500">
                        No events found matching your filters.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Edit Event Dialog */}
      <UpdateEventForm
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onUpdate={handleUpdateEvent}
        event={editingEvent}
        userRole={userRole}
      />

      {/* Create Event Dialog */}
      <CreateEventDialog
        isDialogOpen={isCreateDialogOpen}
        setIsDialogOpen={setIsCreateDialogOpen}
        handleCreate={handleCreate}
        organizationId={organisationID}
      />

      {/* View Event Modal */}
      <ViewEventModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        event={viewingEvent}
      />

      <EventStatusModal
        isOpen={handleStatusEditModal}
        onClose={() => setHandleStatusEditModal(false)}
        onStatusUpdate={handleUpdateEventStatus}
        event={handleStatusEditEvent}
      />

      <DeleteConfirmationModal />
    </div>
  );
};

export default ManageEvents;
