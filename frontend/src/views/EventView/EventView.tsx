import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import EventNavbar from "./EventNavbar";
import "./EventView.css";
import Footer from "../../components/Footer/Footer";
import { getAllEventsAPI } from "../../services/EventService";
import { IEvent } from "../../types/IResponse";
import { MdDateRange, MdAccessTime, MdCategory, MdLocationOn } from "react-icons/md";

const EventView: React.FC = () => {
    const [events, setEvents] = useState<IEvent[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                // Fetch only approved events
                const eventsData = await getAllEventsAPI();
                
                // Filter for approved events if API doesn't already filter them
                const approvedEvents = eventsData.filter(
                    (event) => event.eventStatus === "Approved"
                );
                
                setEvents(approvedEvents);
            } catch (err) {
                console.error("Error fetching events:", err);
                setError("Failed to load events. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    return (
        <div id="events">
            <EventNavbar />
            <div className="areaEvent">
                <ul className="circlesEvent">
                    {[...Array(10)].map((_, index) => (
                        <li key={index} className="circle-event-li"></li>
                    ))}
                </ul>
            </div>

            <div className="waveEvent">
                <svg viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg">
                    <path
                        fill="#ffffff"
                        fillOpacity="1"
                        d="M0,224L60,197.3C120,171,240,117,360,101.3C480,85,600,107,720,138.7C840,171,960,213,1080,197.3C1200,181,1320,107,1380,69.3L1440,32L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
                    />
                </svg>
            </div>

            <div className="relative z-10 flex flex-col items-center justify-start pt-16 px-4 text-center">
                <h1 className="animate-bounce font-poppins mb-8 flex space-x-1 rounded px-4 py-2 text-7xl font-bold tracking-wide text-white mt-20">
                    Events
                </h1>

                {loading ? (
                    <div className="flex justify-center items-center h-64 ">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white"></div>
                    </div>
                ) : error ? (
                    <div className="bg-red-100 text-red-800 p-4 rounded-lg shadow-md">
                        {error}
                    </div>
                ) : events.length === 0 ? (
                    <div className="bg-white/80 p-8 rounded-lg shadow-lg max-w-lg mx-auto backdrop-blur-sm">
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">No Events Found</h3>
                        <p className="text-gray-600">There are no approved events available at the moment. Please check back later.</p>
                    </div>
                ) : (
                    <div className="container mx-auto py-8 mt-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
                            {events.map((event) => (
                                <Link 
                                    to={`/events/${event._id}`} 
                                    key={event._id} 
                                    className="transform transition duration-300 hover:scale-105"
                                >
                                    <div className="bg-white rounded-xl overflow-hidden shadow-lg h-full flex flex-col">
                                        {/* Default event image */}
                                        <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 relative">
                                            <img 
                                                src="/images/default-event.jpg" 
                                                alt={event.eventName} 
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.src = "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80";
                                                }}
                                            />
                                            <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-2 py-1 m-2 rounded">
                                                Approved
                                            </div>
                                        </div>
                                        <div className="p-5 flex-grow">
                                            <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">
                                                {event.eventName}
                                            </h3>
                                            
                                            <div className="space-y-2 text-sm">
                                                <div className="flex items-center text-gray-600">
                                                    <MdDateRange className="text-blue-500 mr-2" />
                                                    <span>{event.eventDate}</span>
                                                </div>
                                                <div className="flex items-center text-gray-600">
                                                    <MdAccessTime className="text-blue-500 mr-2" />
                                                    <span>{event.eventStartTime} - {event.eventFinishTime}</span>
                                                </div>
                                                {event.eventType && (
                                                    <div className="flex items-center text-gray-600">
                                                        <MdCategory className="text-blue-500 mr-2" />
                                                        <span>{event.eventType}</span>
                                                    </div>
                                                )}
                                                {event.eventVenue && (
                                                    <div className="flex items-center text-gray-600">
                                                        <MdLocationOn className="text-blue-500 mr-2" />
                                                        <span className="line-clamp-1">{event.eventVenue}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="px-5 py-3 bg-gray-50 flex justify-end">
                                            <span className="text-blue-600 font-medium text-sm">View Details →</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-20">
                <Footer />
            </div>
        </div>
    );
};

export default EventView;