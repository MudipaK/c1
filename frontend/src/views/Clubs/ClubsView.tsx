import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ClubsNavbar from "./ClubsNavbar";
import "./clubs.css"
import Footer from "../../components/Footer/Footer";
import { getOrganizationsAPI } from "../../services/OrganizationService";
import { IOrganization, IUser } from "../../types/IResponse";
import { MdPerson, MdSchool, MdEvent } from "react-icons/md";
import { toast } from "react-hot-toast";

const ClubsView: React.FC = () => {
    const [organizations, setOrganizations] = useState<IOrganization[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchOrganizations = async () => {
        try {
            console.log("Fetching organizations...");
            const organizationsData = await getOrganizationsAPI();
            console.log("Organizations data:", organizationsData);
            setOrganizations(organizationsData);
        } catch (err) {
            console.error("Error fetching organizations:", err);
            setError("Failed to load organizations. Please try again later.");
            toast.error("Failed to load organizations");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrganizations();

        // Set up event listeners for organization updates
        const handleOrganizationUpdate = () => {
            console.log("Organization updated, refreshing data...");
            fetchOrganizations();
        };

        // Listen for custom events
        window.addEventListener('organizationCreated', handleOrganizationUpdate);
        window.addEventListener('organizationUpdated', handleOrganizationUpdate);
        window.addEventListener('organizationDeleted', handleOrganizationUpdate);

        // Cleanup
        return () => {
            window.removeEventListener('organizationCreated', handleOrganizationUpdate);
            window.removeEventListener('organizationUpdated', handleOrganizationUpdate);
            window.removeEventListener('organizationDeleted', handleOrganizationUpdate);
        };
    }, []);

    const getUserName = (user: string | IUser | null | undefined): string => {
        if (!user) return 'Not assigned';
        if (typeof user === 'string') return 'Not assigned';
        if (typeof user === 'object' && 'username' in user) {
            return user.username || 'Not assigned';
        }
        return 'Not assigned';
    };

    const getClubImage = (org: IOrganization): string => {
        // If organization has a logo/image URL, use it
        if (org.logoUrl) {
            return org.logoUrl;
        }
        
        // Default club images based on organization name
        const defaultImages: { [key: string]: string } = {
            'pathfinders': 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1471&q=80',
            'seds': 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1471&q=80',
            'gta': 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1471&q=80',
            'itsc': 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1471&q=80',
        };

        // Check if organization name matches any default image
        const orgName = org.name.toLowerCase();
        for (const [key, url] of Object.entries(defaultImages)) {
            if (orgName.includes(key)) {
                return url;
            }
        }

        // Fallback to a generic club image
        return 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1471&q=80';
    };

    return (
        <div id="clubs">
            <ClubsNavbar />

            <div className="areaEvent">
                <ul className="circlesEvent">
                    {[...Array(10)].map((_, index) => (
                        <li key={index} className="circle-event-li"></li>
                    ))}
                </ul>
            </div>

            <div className="waveEvent">
                <svg
                    viewBox="0 0 1440 320"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        fill="#ffffff"
                        fillOpacity="1"
                        d="M0,224L60,197.3C120,171,240,117,360,101.3C480,85,600,107,720,138.7C840,171,960,213,1080,197.3C1200,181,1320,107,1380,69.3L1440,32L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
                    />
                </svg>
            </div>

            <div className="relative z-10 flex flex-col items-center justify-start pt-16 px-4 text-center">
                <h1 className="animate-bounce font-poppins mb-8 flex space-x-1 rounded px-4 py-2 text-7xl font-bold tracking-wide text-white mt-20">
                    Clubs & Societies
                </h1>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white"></div>
                    </div>
                ) : error ? (
                    <div className="bg-red-100 text-red-800 p-4 rounded-lg shadow-md">
                        {error}
                    </div>
                ) : organizations.length === 0 ? (
                    <div className="bg-white/80 p-8 rounded-lg shadow-lg max-w-lg mx-auto backdrop-blur-sm">
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">No Organizations Found</h3>
                        <p className="text-gray-600">There are no organizations available at the moment.</p>
                        <p className="text-gray-500 text-sm mt-2">Please check if the organizations are properly set up in the database.</p>
                    </div>
                ) : (
                    <div className="container mx-auto py-8 mt-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
                            {organizations.map((org) => (
                                <div 
                                    key={org._id} 
                                    className="transform transition duration-300 hover:scale-105"
                                >
                                    <div className="bg-white rounded-xl overflow-hidden shadow-lg h-full flex flex-col">
                                        <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 relative">
                                            <img 
                                                src={getClubImage(org)}
                                                alt={org.name} 
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.src = 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1471&q=80';
                                                }}
                                            />
                                        </div>
                                        <div className="p-6 flex flex-col flex-grow">
                                            <h2 className="text-xl font-bold text-gray-800 mb-2">{org.name}</h2>
                                            
                                            <div className="flex items-center text-gray-600 mb-2">
                                                <MdPerson className="mr-2" />
                                                <span>President: {getUserName(org.president)}</span>
                                            </div>
                                            
                                            <div className="flex items-center text-gray-600 mb-2">
                                                <MdSchool className="mr-2" />
                                                <span>Advisor: {getUserName(org.staffAdvisor)}</span>
                                            </div>
                                            
                                            <div className="flex items-center text-gray-600 mb-4">
                                                <MdEvent className="mr-2" />
                                                <span>Events: {org.eventIds?.length || 0}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
};

export default ClubsView;
