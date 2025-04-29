import { FC, useState } from "react";
import { ICrew, ICrewMember } from "../../types/IResponse";
import Button from "../Button/Button";
import MemberFormDialog from "./CrewFormDialog"; // Import MemberFormDialog

// Interface for the Member Dialog props
interface MemberDialogProps {
  isOpen: boolean;
  crew: ICrew;
  onClose: () => void;
  onCreateMember: (crewId: string, member: ICrewMember) => void;
  onEditMember: (memberId: string, crewId: string) => void;
  onDeleteMember: (memberId: string, crewId: string) => void;
}

const MemberDialog: FC<MemberDialogProps> = ({
  isOpen,
  crew,
  onClose,
  onCreateMember,
  onEditMember,
  onDeleteMember,
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false); // Control the visibility of the MemberFormDialog
  const [selectedMember, setSelectedMember] = useState<ICrewMember | null>(null); // Manage which member to edit

  // Open the form to add a new member
  const handleAddNewMember = () => {
    setSelectedMember(null);
    setIsFormOpen(true);
  };

  // Open the form to edit an existing member
  const handleEditMember = (member: ICrewMember) => {
    setSelectedMember(member);
    setIsFormOpen(true);
  };

  // Handle the save action from the MemberFormDialog
  const handleSaveMember = (member: ICrewMember) => {
    if (selectedMember && selectedMember._id) {
      onEditMember(selectedMember._id, crew._id);
    } else {
      onCreateMember(crew._id, member);
    }
    setIsFormOpen(false); // Close the form dialog
  };

  const handleDeleteMember = (memberId: string) => {
    onDeleteMember(memberId, crew._id);
  };

  if (!isOpen) return null;

  return (
    <div>
      {/* Render the MemberFormDialog at the top level with z-index to overlay on top */}
      <MemberFormDialog
        isOpen={isFormOpen}
        member={selectedMember}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveMember}
      />

      <div className="fixed inset-0 flex items-center justify-center z-10">
        {/* Create a backdrop with blur effect */}
        <div className="absolute inset-0 bg-blue-900/20 backdrop-blur-sm"></div>

        {/* Main Dialog Content */}
        <div className="bg-white p-8 rounded-lg w-full max-w-md shadow-xl z-20 border-t-4 border-blue-600">
          {/* Crew Details Section */}
          <h3 className="text-2xl font-bold text-blue-700 mb-6 pb-2 border-b border-blue-100">
            {crew.name} - Details
          </h3>
          
          <div className="mb-6 bg-blue-50 p-4 rounded-lg">
            <div className="space-y-2">
              <p className="flex">
                <span className="font-medium text-blue-800 w-28">Description:</span> 
                <span className="text-gray-700">{crew.description || "No description available."}</span>
              </p>
              <p className="flex">
                <span className="font-medium text-blue-800 w-28">Phone:</span> 
                <span className="text-gray-700">{crew.phone || "N/A"}</span>
              </p>
              <p className="flex">
                <span className="font-medium text-blue-800 w-28">Email:</span> 
                <span className="text-gray-700">{crew.email || "N/A"}</span>
              </p>
              <p className="flex">
                <span className="font-medium text-blue-800 w-28">Work Type:</span> 
                <span className="text-gray-700">{crew.workType || "N/A"}</span>
              </p>
              <p className="flex">
                <span className="font-medium text-blue-800 w-28">Leader:</span> 
                <span className="text-gray-700">{crew.leader || "N/A"}</span>
              </p>
            </div>
          </div>

          {/* Members List Section */}
          <div className="mb-6">
            <h4 className="text-xl font-semibold text-blue-600 mb-3 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
              Members
            </h4>
            
            {crew.crewMembers && crew.crewMembers.length > 0 ? (
              <ul className="divide-y divide-blue-100">
                {crew.crewMembers.map((member) => (
                  <li key={member._id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-gray-500">{member.email}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {/* <button
                        onClick={() => handleEditMember(member)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button> */}
                      <button
                        onClick={() => member._id && handleDeleteMember(member._id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-8 bg-blue-50 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-blue-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <p className="text-blue-600 font-medium">No members added yet</p>
                <p className="text-blue-400 text-sm mt-1">Click "Add Member" to add someone to this crew</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex justify-end space-x-3">
            <button
              onClick={handleAddNewMember}
              className="px-4 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 transition-colors flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
              </svg>
              Add Member
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white text-blue-600 border border-blue-200 rounded-md shadow hover:bg-blue-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberDialog;