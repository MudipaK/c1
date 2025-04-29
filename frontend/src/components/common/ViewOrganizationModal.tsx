import { useState, useEffect } from "react";
import Select from "react-select";
import { IOrganization, IUser, IEvent } from "../types/IResponse"; 
import { FiCalendar, FiClock, FiUser, FiFileText, FiX } from "react-icons/fi";
import { MdOutlineEventNote, MdPerson, MdSupervisorAccount, MdEvent } from "react-icons/md";
import { getFileUrl } from "../../services/FileUploadService";
import Button from "../Button/Button";

const ViewOrganizationModal = ({ 
  organization, 
  isOpen, 
  onClose 
}: { 
  organization: IOrganization | null,
  isOpen: boolean,
  onClose: () => void
}) => {
  if (!isOpen || !organization) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-blue-700 flex items-center">
            <MdEvent className="mr-2" />
            {organization.name}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FiX size={24} />
          </button>
        </div>

        <div className="mb-6">
          <div className="grid grid-cols-2 gap-4 mb-4 bg-blue-50 p-4 rounded-md">
            <div>
              <h3 className="text-lg font-semibold flex items-center mb-2">
                <MdPerson className="mr-2 text-blue-600" />
                President
              </h3>
              <p>{organization.president?.username || "Not assigned"}</p>
              {organization.president?.email && (
                <p className="text-sm text-gray-600">{organization.president.email}</p>
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold flex items-center mb-2">
                <MdSupervisorAccount className="mr-2 text-blue-600" />
                Staff Advisor
              </h3>
              <p>{organization.staffAdvisor?.username || "Not assigned"}</p>
              {organization.staffAdvisor?.email && (
                <p className="text-sm text-gray-600">{organization.staffAdvisor.email}</p>
              )}
            </div>
          </div>
        </div>

        <h3 className="text-xl font-bold mb-4 flex items-center">
          <MdOutlineEventNote className="mr-2 text-blue-600" />
          Organization Events ({organization.eventIds?.length || 0})
        </h3>

        {organization.eventIds && organization.eventIds.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-blue-50">
                <tr>
                  <th className="py-2 px-3 text-left">Event Name</th>
                  <th className="py-2 px-3 text-left">Date</th>
                  <th className="py-2 px-3 text-left">Time</th>
                  <th className="py-2 px-3 text-left">President</th>
                  <th className="py-2 px-3 text-left">Mode</th>
                  <th className="py-2 px-3 text-left">Type</th>
                  <th className="py-2 px-3 text-left">Status</th>
                  <th className="py-2 px-3 text-left">Documents</th>
                </tr>
              </thead>
              <tbody>
                {organization.eventIds.map((event) => (
                  <tr key={event._id} className="border-t border-gray-200 hover:bg-gray-50">
                    <td className="py-3 px-3">{event.eventName}</td>
                    <td className="py-3 px-3">{event.eventDate}</td>
                    <td className="py-3 px-3">
                      {event.eventStartTime} - {event.eventFinishTime}
                    </td>
                    <td className="py-3 px-3">{event.eventPresident}</td>
                    <td className="py-3 px-3">{event.eventMode}</td>
                    <td className="py-3 px-3">{event.eventType}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        event.eventStatus === "Approved" ? "bg-green-100 text-green-800" : 
                        event.eventStatus === "Rejected" ? "bg-red-100 text-red-800" : 
                        "bg-yellow-100 text-yellow-800"
                      }`}>
                        {event.eventStatus}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex space-x-2">
                        <a 
                          href={getFileUrl(event.eventProposal)} 
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                          title="View Proposal"
                        >
                          <FiFileText /> Proposal
                        </a>
                        <a 
                          href={getFileUrl(event.eventForm)} 
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                          title="View Form"
                        >
                          <FiFileText /> Form
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 italic">No events found for this organization.</p>
        )}

        <div className="mt-6 flex justify-end">
          <Button 
            text="Close" 
            size="md"
            onClick={onClose} 
          />
        </div>
      </div>
    </div>
  );
};

export default ViewOrganizationModal;