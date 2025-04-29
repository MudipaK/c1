import { FiCalendar, FiClock, FiUser, FiFileText, FiX } from "react-icons/fi";
import { MdOutlineEventNote, MdModeOfTravel, MdCategory, MdLocationOn } from "react-icons/md";
import { IEvent } from "../../types/IResponse";
import Button from "../Button/Button";
import { getFileUrl } from "../../services/FileUploadService";

interface ViewEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: IEvent | null;
}

const ViewEventModal = ({ isOpen, onClose, event }: ViewEventModalProps) => {
  if (!isOpen || !event) return null;

  const proposalUrl = event.eventProposal ? getFileUrl(event.eventProposal) : "";
  const formUrl = event.eventForm ? getFileUrl(event.eventForm) : "";
  
  // Format date for better display
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold flex items-center">
            <MdOutlineEventNote className="mr-2 text-blue-600" />
            {event.eventName}
          </h2>
          <Button 
            text="Close" 
            color="secondary" 
            size="sm"
            onClick={onClose} 
            icon={<FiX />} 
          />
        </div>

        {/* Status badge */}
        <div className="mb-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            event.eventStatus === "Approved"
              ? "bg-green-100 text-green-800"
              : event.eventStatus === "Rejected"
              ? "bg-red-100 text-red-800"
              : "bg-yellow-100 text-yellow-800"
          }`}>
            {event.eventStatus}
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="font-bold text-lg mb-3 text-blue-700 flex items-center">
              <FiCalendar className="mr-2" />
              Event Details
            </h3>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Date</p>
                <p className="font-medium">{formatDate(event.eventDate)}</p>
              </div>
              
              <div className="flex space-x-4">
                <div>
                  <p className="text-sm text-gray-600">Start Time</p>
                  <p className="font-medium">{event.eventStartTime}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">End Time</p>
                  <p className="font-medium">{event.eventFinishTime}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Duration</p>
                <p className="font-medium">{event.timePeriod}</p>
              </div>
              
              {/* Event Venue */}
              {event.eventVenue && (
                <div>
                  <p className="text-sm text-gray-600 flex items-center">
                    <MdLocationOn className="mr-1 text-red-500" />
                    Venue
                  </p>
                  <p className="font-medium">{event.eventVenue}</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="font-bold text-lg mb-3 text-blue-700 flex items-center">
              <MdCategory className="mr-2" />
              Event Type
            </h3>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Category</p>
                <p className="font-medium">{event.eventType}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Mode</p>
                <p className="font-medium">{event.eventMode}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">President</p>
                <p className="font-medium">{event.eventPresident}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Documents section */}
        <div className="mb-6">
          <h3 className="font-bold text-lg mb-3 text-blue-700 flex items-center">
            <FiFileText className="mr-2" />
            Event Documents
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a 
              href={proposalUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center p-4 border border-blue-200 rounded-md hover:bg-blue-50 transition-colors"
            >
              <div className="bg-blue-100 p-2 rounded-md mr-3">
                <FiFileText className="text-blue-600 text-xl" />
              </div>
              <div>
                <p className="font-medium">Event Proposal</p>
                <p className="text-sm text-gray-600">View PDF document</p>
              </div>
            </a>
            
            <a 
              href={formUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center p-4 border border-blue-200 rounded-md hover:bg-blue-50 transition-colors"
            >
              <div className="bg-blue-100 p-2 rounded-md mr-3">
                <FiFileText className="text-blue-600 text-xl" />
              </div>
              <div>
                <p className="font-medium">Event Form</p>
                <p className="text-sm text-gray-600">View PDF document</p>
              </div>
            </a>
          </div>
        </div>
        
        {/* Creation details */}
        <div className="text-sm text-gray-600 border-t pt-4">
          <p>Created: {new Date(event.createdAt).toLocaleString()}</p>
          {event.updatedAt && event.updatedAt !== event.createdAt && (
            <p>Last updated: {new Date(event.updatedAt).toLocaleString()}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewEventModal;