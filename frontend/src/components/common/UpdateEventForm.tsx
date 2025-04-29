import { useState, useEffect } from "react";
import { IEvent } from "../../types/IResponse";
import Button from "../Button/Button";
import { uploadFile } from "../../services/FileUploadService";
import { 
  FiCalendar, FiClock, FiUser, FiFileText, 
  FiCheck, FiX, FiAlertCircle, FiEdit 
} from "react-icons/fi";
import { 
  MdOutlineEventNote, MdModeOfTravel, MdCategory, 
  MdWarning, MdLocationOn
} from "react-icons/md";
import { BsInfoCircle } from "react-icons/bs";

interface UpdateEventFormProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (eventData: IEvent) => Promise<void>;
  event: IEvent | null;
  userRole: "president" | "staffAdvisor" | "";
}

interface ValidationErrors {
  eventName?: string;
  eventDate?: string;
  eventStartTime?: string;
  eventFinishTime?: string;
  timePeriod?: string;
  eventPresident?: string;
  eventProposal?: string;
  eventForm?: string;
  eventStatus?: string;
  eventVenue?: string; // Added eventVenue validation
}

const UpdateEventForm = ({
  isOpen,
  onClose,
  onUpdate,
  event,
  userRole,
}: UpdateEventFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [eventData, setEventData] = useState<Partial<IEvent>>({});
  const [originalEventData, setOriginalEventData] = useState<Partial<IEvent>>({});
  
  // File states
  const [proposalFile, setProposalFile] = useState<File | null>(null);
  const [formFile, setFormFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [attemptedClose, setAttemptedClose] = useState(false);

  // Initialize form data when event changes
  useEffect(() => {
    if (event && isOpen) {
      setEventData({
        ...event,
        oldOrganizationId: event.organizationId, // Store original org ID for backend
      });
      setOriginalEventData({...event});
      setHasChanges(false);
      setError("");
      setValidationErrors({});
      setProposalFile(null);
      setFormFile(null);
      setAttemptedClose(false);
    }
  }, [event, isOpen]);

  // Track changes between original and current data
  useEffect(() => {
    if (Object.keys(originalEventData).length === 0) return;
    
    const changesDetected = 
      JSON.stringify(filterEventData(eventData)) !== 
      JSON.stringify(filterEventData(originalEventData)) ||
      proposalFile !== null ||
      formFile !== null;
    
    setHasChanges(changesDetected);
  }, [eventData, originalEventData, proposalFile, formFile]);

  // Helper to filter out non-comparable fields
  const filterEventData = (data: Partial<IEvent>) => {
    const { _id, createdAt, updatedAt, oldOrganizationId, ...rest } = data;
    return rest;
  };

  if (!isOpen || !event) return null;

  // Validate form fields
  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};
    
    if (!eventData.eventName?.trim()) {
      errors.eventName = "Event name is required";
    }
    
    if (!eventData.eventDate) {
      errors.eventDate = "Event date is required";
    } else {
      // Validate date is not in past
      const selectedDate = new Date(eventData.eventDate);
      selectedDate.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        errors.eventDate = "Event date cannot be in the past";
      }
    }
    
    if (!eventData.eventStartTime) {
      errors.eventStartTime = "Start time is required";
    }
    
    if (!eventData.eventFinishTime) {
      errors.eventFinishTime = "End time is required";
    } else if (
      eventData.eventDate && 
      eventData.eventStartTime && 
      eventData.eventFinishTime &&
      `${eventData.eventDate}T${eventData.eventStartTime}` >= 
      `${eventData.eventDate}T${eventData.eventFinishTime}`
    ) {
      errors.eventFinishTime = "End time must be after start time";
    }
    
    if (!eventData.timePeriod?.trim()) {
      errors.timePeriod = "Time period is required";
    }
    
    if (!eventData.eventPresident?.trim()) {
      errors.eventPresident = "Event president is required";
    }

    // Validate event venue (if provided) isn't too long
    if (eventData.eventVenue && eventData.eventVenue.length > 100) {
      errors.eventVenue = "Venue must be less than 100 characters";
    }
    
    // Only validate status change if user is staff advisor
    if (userRole === "staffAdvisor" && 
        eventData.eventStatus !== originalEventData.eventStatus &&
        !["Pending", "Approved", "Rejected"].includes(eventData.eventStatus || "")) {
      errors.eventStatus = "Status must be Pending, Approved, or Rejected";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEventData((prev) => ({ ...prev, [name]: value }));
    
    // Clear specific validation error when field is updated
    if (validationErrors[name as keyof ValidationErrors]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "proposal" | "form"
  ) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      if (type === "proposal") {
        setProposalFile(files[0]);
        setValidationErrors(prev => ({
          ...prev,
          eventProposal: undefined
        }));
      } else {
        setFormFile(files[0]);
        setValidationErrors(prev => ({
          ...prev,
          eventForm: undefined
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      setError("Please fix the validation errors");
      return;
    }
    
    if (!hasChanges) {
      setError("No changes detected");
      return;
    }
    
    setIsSubmitting(true);
    setError("");

    try {
      let updatedEventData = { ...eventData };
      
      // Handle file uploads if needed
      if (proposalFile || formFile) {
        setUploading(true);
        console.log("Uploading updated files...");
        
        if (proposalFile) {
          const proposalPath = await uploadFile(proposalFile, "proposal");
          updatedEventData.eventProposal = proposalPath;
        }
        
        if (formFile) {
          const formPath = await uploadFile(formFile, "form");
          updatedEventData.eventForm = formPath;
        }
        
        setUploading(false);
      }

      await onUpdate(updatedEventData as IEvent);
      setHasChanges(false);
      setAttemptedClose(false);
      onClose();
    } catch (error: any) {
      console.error("Error updating event:", error);
      setError(error.message || "Failed to update event");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAttemptClose = () => {
    if (hasChanges) {
      setAttemptedClose(true);
    } else {
      onClose();
    }
  };

  const confirmClose = () => {
    setAttemptedClose(false);
    onClose();
  };

  const cancelClose = () => {
    setAttemptedClose(false);
  };
  
  const renderFieldError = (fieldName: keyof ValidationErrors) => {
    return validationErrors[fieldName] ? (
      <p className="mt-1 text-xs text-red-500 flex items-center">
        <FiAlertCircle className="mr-1" />
        {validationErrors[fieldName]}
      </p>
    ) : null;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header with title and role indicator */}
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold flex items-center">
            <FiEdit className="mr-2 text-blue-600" />
            Update Event
          </h2>
          {userRole && (
            <span className={`px-3 py-1 text-sm rounded-full ${
              userRole === "president" 
                ? "bg-blue-100 text-blue-700" 
                : "bg-green-100 text-green-700"
            }`}>
              {userRole === "president" ? "Organization President" : "Staff Advisor"}
            </span>
          )}
        </div>
        
        {hasChanges && (
          <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded-md flex items-center">
            <BsInfoCircle className="mr-2 flex-shrink-0" />
            <span>You have unsaved changes</span>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md flex items-center">
            <FiX className="mr-2 flex-shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Confirmation dialog when trying to close with unsaved changes */}
        {attemptedClose && (
          <div className="mb-4 p-4 bg-yellow-50 text-yellow-800 rounded-md">
            <div className="flex items-center mb-3">
              <MdWarning className="text-yellow-700 text-xl mr-2" />
              <h3 className="font-bold">Unsaved Changes</h3>
            </div>
            <p className="mb-3">You have unsaved changes that will be lost if you close this form. What would you like to do?</p>
            <div className="flex justify-end space-x-2">
              <Button 
                text="Continue Editing" 
                color="secondary" 
                onClick={cancelClose}
              />
              <Button 
                text="Discard Changes" 
                color="danger" 
                onClick={confirmClose}
              />
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Event Name */}
            <div>
              <label className="block text-sm font-medium mb-1 flex items-center">
                <MdOutlineEventNote className="mr-1 text-blue-600" />
                Event Name
              </label>
              <input
                type="text"
                name="eventName"
                value={eventData.eventName || ""}
                onChange={handleChange}
                required
                className={`w-full p-2 border rounded-md ${
                  validationErrors.eventName ? "border-red-500" : ""
                }`}
              />
              {renderFieldError("eventName")}
            </div>

            {/* Event Date */}
            <div>
              <label className="block text-sm font-medium mb-1 flex items-center">
                <FiCalendar className="mr-1 text-blue-600" />
                Event Date
              </label>
              <input
                type="date"
                name="eventDate"
                value={eventData.eventDate || ""}
                onChange={handleChange}
                required
                className={`w-full p-2 border rounded-md ${
                  validationErrors.eventDate ? "border-red-500" : ""
                }`}
              />
              {renderFieldError("eventDate")}
            </div>

            {/* Start Time */}
            <div>
              <label className="block text-sm font-medium mb-1 flex items-center">
                <FiClock className="mr-1 text-blue-600" />
                Start Time
              </label>
              <input
                type="time"
                name="eventStartTime"
                value={eventData.eventStartTime || ""}
                onChange={handleChange}
                required
                className={`w-full p-2 border rounded-md ${
                  validationErrors.eventStartTime ? "border-red-500" : ""
                }`}
              />
              {renderFieldError("eventStartTime")}
            </div>

            {/* End Time */}
            <div>
              <label className="block text-sm font-medium mb-1 flex items-center">
                <FiClock className="mr-1 text-blue-600" />
                End Time
              </label>
              <input
                type="time"
                name="eventFinishTime"
                value={eventData.eventFinishTime || ""}
                onChange={handleChange}
                required
                className={`w-full p-2 border rounded-md ${
                  validationErrors.eventFinishTime ? "border-red-500" : ""
                }`}
              />
              {renderFieldError("eventFinishTime")}
            </div>

            {/* Time Period */}
            <div>
              <label className="block text-sm font-medium mb-1 flex items-center">
                <FiClock className="mr-1 text-blue-600" />
                Time Period
              </label>
              <input
                type="text"
                name="timePeriod"
                value={eventData.timePeriod || ""}
                onChange={handleChange}
                placeholder="e.g., 2 hours"
                required
                className={`w-full p-2 border rounded-md ${
                  validationErrors.timePeriod ? "border-red-500" : ""
                }`}
              />
              {renderFieldError("timePeriod")}
            </div>

            {/* Event President */}
            <div>
              <label className="block text-sm font-medium mb-1 flex items-center">
                <FiUser className="mr-1 text-blue-600" />
                Event President
              </label>
              <input
                type="text"
                name="eventPresident"
                value={eventData.eventPresident || ""}
                onChange={handleChange}
                required
                className={`w-full p-2 border rounded-md ${
                  validationErrors.eventPresident ? "border-red-500" : ""
                }`}
              />
              {renderFieldError("eventPresident")}
            </div>

            {/* Event Venue - New field */}
            <div>
              <label className="block text-sm font-medium mb-1 flex items-center">
                <MdLocationOn className="mr-1 text-red-500" />
                Event Venue
              </label>
              <input
                type="text"
                name="eventVenue"
                value={eventData.eventVenue || ""}
                onChange={handleChange}
                placeholder="e.g., Main Auditorium"
                className={`w-full p-2 border rounded-md ${
                  validationErrors.eventVenue ? "border-red-500" : ""
                }`}
              />
              <p className="mt-1 text-xs text-gray-500">Optional. Max 100 characters.</p>
              {renderFieldError("eventVenue")}
            </div>

            {/* Event Mode */}
            <div>
              <label className="block text-sm font-medium mb-1 flex items-center">
                <MdModeOfTravel className="mr-1 text-blue-600" />
                Event Mode
              </label>
              <select
                name="eventMode"
                value={eventData.eventMode || "Physical"}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded-md"
              >
                <option value="Physical">Physical</option>
                <option value="Online">Online</option>
              </select>
            </div>

            {/* Event Type */}
            <div>
              <label className="block text-sm font-medium mb-1 flex items-center">
                <MdCategory className="mr-1 text-blue-600" />
                Event Type
              </label>
              <select
                name="eventType"
                value={eventData.eventType || "Academic"}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded-md"
              >
                <option value="Academic">Academic</option>
                <option value="Non-Academic">Non-Academic</option>
                <option value="Hackathon">Hackathon</option>
              </select>
            </div>

            {/* Event Status - Only show to staff advisors */}
            {userRole === "staffAdvisor" && (
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1 flex items-center">
                  <MdOutlineEventNote className="mr-1 text-blue-600" />
                  Event Status
                </label>
                <select
                  name="eventStatus"
                  value={eventData.eventStatus || "Pending"}
                  onChange={handleChange}
                  required
                  className={`w-full p-2 border rounded-md ${
                    validationErrors.eventStatus ? "border-red-500" : ""
                  }`}
                >
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
                {renderFieldError("eventStatus")}
              </div>
            )}
          </div>

          {/* File uploads - Optional for updates */}
          <div className="mb-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 flex items-center">
                <FiFileText className="mr-1 text-blue-600" />
                Event Proposal (PDF) - Optional
              </label>
              <div className={`border rounded-md ${
                validationErrors.eventProposal ? "border-red-500" : ""
              }`}>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handleFileChange(e, "proposal")}
                  className="w-full p-2"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                {eventData.eventProposal ? 
                  "Current file already uploaded. Upload a new file only if you want to replace it." : 
                  "No file currently uploaded. Please upload a proposal PDF."}
              </p>
              {proposalFile && (
                <p className="mt-1 text-sm text-green-600 flex items-center">
                  <FiCheck className="mr-1" />
                  New file selected: {proposalFile.name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 flex items-center">
                <FiFileText className="mr-1 text-blue-600" />
                Event Form (PDF) - Optional
              </label>
              <div className={`border rounded-md ${
                validationErrors.eventForm ? "border-red-500" : ""
              }`}>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handleFileChange(e, "form")}
                  className="w-full p-2"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                {eventData.eventForm ? 
                  "Current file already uploaded. Upload a new file only if you want to replace it." : 
                  "No file currently uploaded. Please upload an event form PDF."}
              </p>
              {formFile && (
                <p className="mt-1 text-sm text-green-600 flex items-center">
                  <FiCheck className="mr-1" />
                  New file selected: {formFile.name}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              text="Cancel"
              color="secondary"
              onClick={handleAttemptClose}
              disabled={isSubmitting || uploading}
            />
            <Button
              text={
                uploading
                  ? "Uploading..."
                  : isSubmitting
                  ? "Updating..."
                  : "Update Event"
              }
              type="submit"
              onClick={handleSubmit}
              disabled={isSubmitting || uploading || !hasChanges}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateEventForm;