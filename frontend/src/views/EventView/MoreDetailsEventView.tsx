import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import EventNavbar from "./EventNavbar";
import Footer from "../../components/Footer/Footer";
import "./EventView.css";
import { getEventByIdAPI } from "../../services/EventService";
import { IEvent } from "../../types/IResponse";
import { getFileUrl } from "../../services/FileUploadService";
import { 
  MdDateRange, 
  MdAccessTime, 
  MdCategory, 
  MdLocationOn, 
  MdPeople, 
  MdDescription, 
  MdArrowBack,
  MdOutlineEventNote,
  MdOutlineLocationCity,
  MdPerson,
  MdTimer,
  MdFilePresent,
  MdPictureAsPdf,
  MdOpenInNew,
  MdDownload,
  MdClose
} from "react-icons/md";
import { FiFileText } from "react-icons/fi";

const EventDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<IEvent | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showPdfViewer, setShowPdfViewer] = useState<boolean>(false);
  const [proposalUrl, setProposalUrl] = useState<string>("");

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        if (!id) return;
        
        const eventData = await getEventByIdAPI(id);
        
        if (eventData && eventData.eventStatus === "Approved") {
          setEvent(eventData);
          
          // Get the proposal URL using the getFileUrl function
          if (eventData.eventProposal) {
            setProposalUrl(getFileUrl(eventData.eventProposal));
          }
        } else {
          setError("Event not found or not approved.");
        }
      } catch (err) {
        console.error("Error fetching event details:", err);
        setError("Failed to load event details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [id]);

  // Function to handle closing the PDF viewer modal
  const closePdfViewer = () => {
    setShowPdfViewer(false);
  };

  return (
    <div id="events" className="min-h-screen flex flex-col">
      <EventNavbar />
      {/* Background elements with z-index management */}
      <div className="areaEvent -z-10">
        <ul className="circlesEvent">
          {[...Array(10)].map((_, index) => (
            <li key={index} className="circle-event-li"></li>
          ))}
        </ul>
      </div>

      <div className="waveEvent -z-10">
        <svg viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg">
          <path
            fill="#ffffff"
            fillOpacity="1"
            d="M0,224L60,197.3C120,171,240,117,360,101.3C480,85,600,107,720,138.7C840,171,960,213,1080,197.3C1200,181,1320,107,1380,69.3L1440,32L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
          />
        </svg>
      </div>

      {/* PDF Viewer Modal */}
      {showPdfViewer && proposalUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-5xl h-[85vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-semibold text-lg flex items-center">
                <MdPictureAsPdf className="text-red-600 mr-2" />
                Event Proposal - {event?.eventName}
              </h3>
              <button 
                onClick={closePdfViewer}
                className="text-gray-500 hover:text-gray-800 transition-colors"
              >
                <MdClose className="h-6 w-6" />
              </button>
            </div>
            <div className="flex-grow p-1 bg-gray-100">
              <iframe
                src={proposalUrl}
                className="w-full h-full border-0"
                title="Event Proposal PDF"
              />
            </div>
            <div className="p-3 bg-gray-50 rounded-b-xl border-t flex justify-between items-center">
              <span className="text-sm text-gray-500">Viewing event proposal document</span>
              <a
                href={proposalUrl}
                download
                target="_blank" 
                rel="noopener noreferrer"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center text-sm transition-colors"
              >
                <MdDownload className="mr-1" />
                Download PDF
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Container */}
      <div className="relative z-10 flex-grow container mx-auto px-4 py-10 max-w-6xl mt-20">
        {/* Back button with improved visibility */}
        <Link 
          to="/events" 
          className="inline-flex items-center mb-6 text-white bg-blue-600/80 hover:bg-blue-700 px-4 py-2 rounded-lg transition duration-200 shadow-md backdrop-blur-sm"
        >
          <MdArrowBack className="mr-2" size={20} />
          <span>Back to Events</span>
        </Link>

        {loading ? (
          <div className="flex flex-col justify-center items-center h-64 mt-8">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
            <p className="text-white mt-4 font-medium">Loading event details...</p>
          </div>
        ) : error ? (
          <div className="bg-red-100 text-red-800 p-6 rounded-xl shadow-lg max-w-3xl mx-auto border-l-4 border-red-500">
            <h3 className="text-xl font-semibold mb-3">Error</h3>
            <p className="mb-4">{error}</p>
            <Link 
              to="/events" 
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200 shadow-sm"
            >
              <MdArrowBack className="mr-2" />
              Return to Events
            </Link>
          </div>
        ) : event ? (
          <div className="bg-white rounded-xl shadow-xl overflow-hidden mb-10 transition-all duration-300 hover:shadow-2xl">
            {/* Event Header with better image handling */}
            <div className="h-72 md:h-80 bg-gradient-to-r from-blue-600 to-purple-700 relative">
              <img 
                src="/images/default-event.jpg" 
                alt={event.eventName} 
                className="w-full h-full object-cover opacity-90 transition-opacity duration-300"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
              <div className="absolute top-0 right-0 bg-green-500 text-white font-bold px-4 py-2 m-4 rounded-lg shadow-md">
                Approved
              </div>
              
              {/* Event title overlay on image */}
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-md">{event.eventName}</h1>
                {event.organizationName && (
                  <div className="flex items-center text-white/90">
                    <MdOutlineLocationCity className="mr-2" />
                    <span>Organized by: {event.organizationName}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Event Details */}
            <div className="p-6 md:p-8">
              {/* Two column grid for event info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-8">
                <div className="space-y-5">
                  <div className="flex items-start">
                    <div className="p-3 bg-blue-100 rounded-full mr-4 flex-shrink-0">
                      <MdDateRange className="text-blue-600 text-xl" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Date</h3>
                      <p className="text-gray-800 font-semibold">{event.eventDate}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="p-3 bg-green-100 rounded-full mr-4 flex-shrink-0">
                      <MdAccessTime className="text-green-600 text-xl" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Time</h3>
                      <p className="text-gray-800 font-semibold">{event.eventStartTime} - {event.eventFinishTime}</p>
                    </div>
                  </div>
                  
                  {event.timePeriod && (
                    <div className="flex items-start">
                      <div className="p-3 bg-indigo-100 rounded-full mr-4 flex-shrink-0">
                        <MdTimer className="text-indigo-600 text-xl" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Duration</h3>
                        <p className="text-gray-800 font-semibold">{event.timePeriod}</p>
                      </div>
                    </div>
                  )}
                  
                  {event.eventPresident && (
                    <div className="flex items-start">
                      <div className="p-3 bg-yellow-100 rounded-full mr-4 flex-shrink-0">
                        <MdPerson className="text-yellow-700 text-xl" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Event President</h3>
                        <p className="text-gray-800 font-semibold">{event.eventPresident}</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="space-y-5">
                  {event.eventType && (
                    <div className="flex items-start">
                      <div className="p-3 bg-purple-100 rounded-full mr-4 flex-shrink-0">
                        <MdCategory className="text-purple-600 text-xl" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Event Type</h3>
                        <p className="text-gray-800 font-semibold">{event.eventType}</p>
                      </div>
                    </div>
                  )}
                  
                  {event.eventMode && (
                    <div className="flex items-start">
                      <div className="p-3 bg-amber-100 rounded-full mr-4 flex-shrink-0">
                        <MdOutlineEventNote className="text-amber-600 text-xl" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Mode</h3>
                        <p className="text-gray-800 font-semibold">{event.eventMode}</p>
                      </div>
                    </div>
                  )}
                  
                  {event.eventVenue && (
                    <div className="flex items-start">
                      <div className="p-3 bg-red-100 rounded-full mr-4 flex-shrink-0">
                        <MdLocationOn className="text-red-600 text-xl" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Venue</h3>
                        <p className="text-gray-800 font-semibold">{event.eventVenue}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Document Section for Proposal */}
              {proposalUrl && (
                <div className="mb-8 mt-8">
                  <h3 className="font-bold text-lg mb-3 text-blue-700 flex items-center">
                    <FiFileText className="mr-2" />
                    Event Proposal
                  </h3>
                  <div className="p-5 bg-gray-50 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="p-3 bg-red-100 rounded-full mr-4 flex-shrink-0">
                          <MdPictureAsPdf className="text-red-600 text-xl" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-800">Event Proposal Document</h4>
                          <p className="text-gray-500 text-sm">View the official event proposal</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => setShowPdfViewer(true)}
                          className="px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors flex items-center"
                        >
                          <MdOpenInNew className="mr-1" />
                          View
                        </button>
                        <a 
                          href={proposalUrl} 
                          download
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="px-3 py-2 bg-gray-600 text-white text-sm font-medium rounded hover:bg-gray-700 transition-colors flex items-center"
                        >
                          <MdDownload className="mr-1" />
                          Download
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Event Description Section */}
              {event.eventDescription && (
                <div className="border-t border-gray-200 pt-7 mt-3">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                    <MdDescription className="mr-3 text-blue-600 text-2xl" />
                    Event Description
                  </h2>
                  <p className="text-gray-700 whitespace-pre-line leading-relaxed">{event.eventDescription}</p>
                </div>
              )}
              
              {/* Requirements Section */}
              {event.eventRequirements && (
                <div className="mt-8">
                  <div className="p-5 bg-blue-50 rounded-xl border border-blue-100">
                    <h3 className="text-lg font-medium text-blue-800 mb-2 flex items-center">
                      <MdPeople className="mr-2 text-blue-700" />
                      Requirements
                    </h3>
                    <p className="text-gray-700 leading-relaxed">{event.eventRequirements}</p>
                  </div>
                </div>
              )}
              
              {/* Back button */}
              <div className="mt-10 flex justify-center">
                <Link 
                  to="/events" 
                  className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-md flex items-center"
                >
                  <MdArrowBack className="mr-2" />
                  Back to All Events
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white/90 p-8 rounded-xl shadow-lg max-w-lg mx-auto backdrop-blur-sm">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Event Not Found</h3>
            <p className="text-gray-600 mb-5">The event you're looking for doesn't exist or is not approved.</p>
            <Link to="/events" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              <MdArrowBack className="mr-2" />
              Return to Events
            </Link>
          </div>
        )}
      </div>

      <Footer className="mt-auto" />
    </div>
  );
};

export default EventDetail;