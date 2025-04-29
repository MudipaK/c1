import { useState, useEffect } from "react";
import { IEvent } from "../../types/IResponse";
import Button from "../Button/Button";
import { uploadFile } from "../../services/FileUploadService";
import { FiCalendar, FiClock, FiUser, FiFileText, FiCheck, FiX, FiAlertCircle } from "react-icons/fi";
import { MdOutlineEventNote, MdModeOfTravel, MdCategory, MdLocationOn } from "react-icons/md";

interface CreateEventFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (eventData: IEvent) => void;
  organizationId: string;
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
  eventVenue?: string; // Added eventVenue validation
}

const CreateEventForm = ({
  isOpen,
  onClose,
  onSubmit,
  organizationId,
}: CreateEventFormProps) => {
  const initialEventData = {
    eventName: "",
    eventDate: "",
    eventStartTime: "",
    eventFinishTime: "",
    timePeriod: "",
    eventPresident: "",
    eventProposal: "",
    eventForm: "",
    eventMode: "Physical",
    eventType: "Academic",
    eventStatus: "Pending",
    eventVenue: "", // Initialize venue as empty string
  };
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [eventData, setEventData] = useState<Partial<IEvent>>({
    eventName: "",
    eventDate: "",
    eventStartTime: "",
    eventFinishTime: "",
    timePeriod: "",
    eventPresident: "",
    eventProposal: "",
    eventForm: "",
    eventMode: "Physical",
    eventType: "Academic",
    eventStatus: "Pending",
    eventVenue: "", // Initialize venue in state
  });

  // File states
  const [proposalFile, setProposalFile] = useState<File | null>(null);
  const [formFile, setFormFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [formTouched, setFormTouched] = useState(false);
  const [formProgress, setFormProgress] = useState(0);

  // Calculate form progress
  useEffect(() => {
    if (isOpen) {
      // Optional: If you want to keep the form pristine when opened
      resetForm();
    }
  }, [isOpen]);
  
  useEffect(() => {
    if (!formTouched) return;

    const requiredFields = [
      "eventName",
      "eventDate",
      "eventStartTime",
      "eventFinishTime",
      "timePeriod",
      "eventPresident",
    ];
    
    const filledFields = requiredFields.filter(field => 
      eventData[field as keyof Partial<IEvent>] !== ""
    ).length;
    
    const filesCount = (proposalFile ? 1 : 0) + (formFile ? 1 : 0);
    
    // Calculate progress as percentage (fields + files)
    const totalProgress = Math.round(
      ((filledFields + filesCount) / (requiredFields.length + 2)) * 100
    );
    
    setFormProgress(totalProgress);
  }, [eventData, proposalFile, formFile, formTouched]);

  if (!isOpen) return null;

  // Validate all fields
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
    
    if (!proposalFile) {
      errors.eventProposal = "Event proposal is required";
    }
    
    if (!formFile) {
      errors.eventForm = "Event form is required";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormTouched(true);
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
    setFormTouched(true);
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

  const resetForm = () => {
    setEventData(initialEventData);
    setProposalFile(null);
    setFormFile(null);
    setError("");
    setValidationErrors({});
    setFormTouched(false);
    setFormProgress(0);
    setIsSubmitting(false);
    setUploading(false);
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormTouched(true);
    
    // Validate form before submission
    if (!validateForm()) {
      setError("Please fix the validation errors");
      return;
    }
    
    setIsSubmitting(true);
    setError("");

    try {
      setUploading(true);
      console.log("Starting file uploads...");

      // Upload proposal file
      let proposalPath = "";
      if (proposalFile) {
        console.log("Uploading proposal file:", proposalFile.name);
        proposalPath = await uploadFile(proposalFile, "proposal");
        console.log("Proposal path:", proposalPath);
      } else {
        throw new Error("Event proposal PDF is required");
      }

      // Upload form file
      let formPath = "";
      if (formFile) {
        console.log("Uploading form file:", formFile.name);
        formPath = await uploadFile(formFile, "form");
        console.log("Form path:", formPath);
      } else {
        throw new Error("Event form PDF is required");
      }

      setUploading(false);
      console.log("Files uploaded successfully");

      // Combine form data with file paths and organizationId
      const completeEventData: IEvent = {
        ...(eventData as IEvent),
        eventProposal: proposalPath,
        eventForm: formPath,
        organizationId,
      };

      console.log("Submitting event data:", completeEventData);

      // Submit to parent component
      await onSubmit(completeEventData);
      console.log("Event created successfully");
      resetForm();
      onClose();
    } catch (error: any) {
      console.error("Error creating event:", error);
      setError(error.message || "Failed to create event");
      setIsSubmitting(false);
      setUploading(false);
    }
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
        <h2 className="text-2xl font-bold mb-1 flex items-center">
          <MdOutlineEventNote className="mr-2 text-blue-600" />
          Create New Event
        </h2>
        
        {/* Progress bar */}
        {formTouched && (
          <div className="mb-4 mt-2">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Form completion</span>
              <span>{formProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                style={{ width: `${formProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md flex items-center">
            <FiX className="mr-2 flex-shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1 flex items-center">
                <MdOutlineEventNote className="mr-1 text-blue-600" />
                Event Name
              </label>
              <input
                type="text"
                name="eventName"
                value={eventData.eventName}
                onChange={handleChange}
                required
                className={`w-full p-2 border rounded-md ${
                  validationErrors.eventName ? "border-red-500" : ""
                }`}
              />
              {renderFieldError("eventName")}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 flex items-center">
                <FiCalendar className="mr-1 text-blue-600" />
                Event Date
              </label>
              <input
                type="date"
                name="eventDate"
                value={eventData.eventDate}
                onChange={handleChange}
                required
                className={`w-full p-2 border rounded-md ${
                  validationErrors.eventDate ? "border-red-500" : ""
                }`}
              />
              {renderFieldError("eventDate")}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 flex items-center">
                <FiClock className="mr-1 text-blue-600" />
                Start Time
              </label>
              <input
                type="time"
                name="eventStartTime"
                value={eventData.eventStartTime}
                onChange={handleChange}
                required
                className={`w-full p-2 border rounded-md ${
                  validationErrors.eventStartTime ? "border-red-500" : ""
                }`}
              />
              {renderFieldError("eventStartTime")}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 flex items-center">
                <FiClock className="mr-1 text-blue-600" />
                End Time
              </label>
              <input
                type="time"
                name="eventFinishTime"
                value={eventData.eventFinishTime}
                onChange={handleChange}
                required
                className={`w-full p-2 border rounded-md ${
                  validationErrors.eventFinishTime ? "border-red-500" : ""
                }`}
              />
              {renderFieldError("eventFinishTime")}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 flex items-center">
                <FiClock className="mr-1 text-blue-600" />
                Time Period
              </label>
              <input
                type="text"
                name="timePeriod"
                value={eventData.timePeriod}
                onChange={handleChange}
                placeholder="e.g., 2 hours"
                required
                className={`w-full p-2 border rounded-md ${
                  validationErrors.timePeriod ? "border-red-500" : ""
                }`}
              />
              {renderFieldError("timePeriod")}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 flex items-center">
                <FiUser className="mr-1 text-blue-600" />
                Event President
              </label>
              <input
                type="text"
                name="eventPresident"
                value={eventData.eventPresident}
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
                value={eventData.eventVenue}
                onChange={handleChange}
                placeholder="e.g., Main Auditorium"
                className={`w-full p-2 border rounded-md ${
                  validationErrors.eventVenue ? "border-red-500" : ""
                }`}
              />
              <p className="mt-1 text-xs text-gray-500">Optional. Max 100 characters.</p>
              {renderFieldError("eventVenue")}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 flex items-center">
                <MdModeOfTravel className="mr-1 text-blue-600" />
                Event Mode
              </label>
              <select
                name="eventMode"
                value={eventData.eventMode}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded-md"
              >
                <option value="Physical">Physical</option>
                <option value="Online">Online</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 flex items-center">
                <MdCategory className="mr-1 text-blue-600" />
                Event Type
              </label>
              <select
                name="eventType"
                value={eventData.eventType}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded-md"
              >
                <option value="Academic">Academic</option>
                <option value="Non-Academic">Non-Academic</option>
                <option value="Hackathon">Hackathon</option>
              </select>
            </div>
          </div>

          {/* File uploads */}
          <div className="mb-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 flex items-center">
                <FiFileText className="mr-1 text-blue-600" />
                Event Proposal (PDF)
              </label>
              <div className={`border rounded-md ${
                  validationErrors.eventProposal ? "border-red-500" : ""
                }`}>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handleFileChange(e, "proposal")}
                  required
                  className="w-full p-2"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Upload a PDF document (max 5MB)
              </p>
              {proposalFile ? (
                <p className="mt-1 text-sm text-green-600 flex items-center">
                  <FiCheck className="mr-1" />
                  Selected: {proposalFile.name}
                </p>
              ) : renderFieldError("eventProposal")}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 flex items-center">
                <FiFileText className="mr-1 text-blue-600" />
                Event Form (PDF)
              </label>
              <div className={`border rounded-md ${
                  validationErrors.eventForm ? "border-red-500" : ""
                }`}>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handleFileChange(e, "form")}
                  required
                  className="w-full p-2"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Upload a PDF document (max 5MB)
              </p>
              {formFile ? (
                <p className="mt-1 text-sm text-green-600 flex items-center">
                  <FiCheck className="mr-1" />
                  Selected: {formFile.name}
                </p>
              ) : renderFieldError("eventForm")}
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              text="Cancel"
              color="secondary"
              onClick={onClose}
              disabled={isSubmitting || uploading}
            />
            <Button
              text={
                uploading
                  ? "Uploading..."
                  : isSubmitting
                  ? "Creating..."
                  : "Create Event"
              }
              type="submit"
              onClick={handleSubmit}
              disabled={isSubmitting || uploading}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEventForm;