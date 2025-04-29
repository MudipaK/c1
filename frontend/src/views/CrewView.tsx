import { useState, useEffect } from "react";
import { ICrew, ICrewMember } from "../types/IResponse";
import CrewDialog from "../components/common/CrewDialog";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import MemberDialog from "../components/common/MemberDialog";
import { getCrewsAPI, createCrewAPI, updateCrewAPI, updateCrewMemberAPI, addCrewMemberAPI, removeCrewMemberAPI, deleteCrewAPI } from "../services/CrewService";
import ConfirmationDialog from "../components/Alert/ConfirmationPopUp";

const CrewPage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editingCrew, setEditingCrew] = useState<ICrew | null>(null);
  const [crewList, setCrewList] = useState<ICrew[]>([]);
  const [selectedCrew, setSelectedCrew] = useState<ICrew | null>(null);
  const [selectedMember, setSelectedMember] = useState<ICrewMember | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  // Add states for delete confirmation
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [crewToDelete, setCrewToDelete] = useState<ICrew | null>(null);

  useEffect(() => {
    const fetchCrewData = async () => {
      setIsLoading(true);
      try {
        const data = await getCrewsAPI();
        setCrewList(data);
      } catch (error) {
        toast.error("Error fetching crew data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCrewData();
  }, []);

  const handleCreateNewCrew = () => {
    setIsCreating(true);
    setEditingCrew(null); 
    setIsDialogOpen(true);
  };

  const handleEditCrew = (crew: ICrew) => {
    setEditingCrew(crew);
    setIsCreating(false);
    setIsDialogOpen(true);
  };

  // Add delete crew handler
  const handleDeleteCrew = (crew: ICrew) => {
    setCrewToDelete(crew);
    setIsDeleteConfirmOpen(true);
  };

  // Add confirm delete function
  const confirmDeleteCrew = async () => {
    if (!crewToDelete) return;
    
    try {
      await deleteCrewAPI(crewToDelete._id);
      
      // Remove the deleted crew from the list
      setCrewList((prevList) => prevList.filter((crew) => crew._id !== crewToDelete._id));
      toast.success("Crew deleted successfully");
    } catch (error) {
      console.error("Error deleting crew:", error);
      toast.error("An error occurred while deleting the crew. Please try again.");
    } finally {
      setIsDeleteConfirmOpen(false);
      setCrewToDelete(null);
    }
  };

  // Add cancel delete function
  const cancelDeleteCrew = () => {
    setIsDeleteConfirmOpen(false);
    setCrewToDelete(null);
  };

  const handleViewCrewDetails = (crew: ICrew) => {
    setSelectedCrew(crew);
    setIsDetailsDialogOpen(true);
  };

  const handleCloseDetailsDialog = () => {
    setIsDetailsDialogOpen(false);
    setSelectedCrew(null);

    const fetchCrewData = async () => {
      try {
        const data = await getCrewsAPI();
        setCrewList(data);
      } catch (error) {
        toast.error("Error fetching crew data");
      }
    };

    fetchCrewData();
  };

  const handleCreateNewMember = async (crewId: string, member: ICrewMember) => {
    try {
      const updatedCrew = await addCrewMemberAPI(crewId, member);
      setSelectedCrew(updatedCrew);
    } catch (error) {
      console.error("Error saving member:", error);
      toast.error("An error occurred while saving the member. Please try again.");
    }
    setSelectedMember(null); 
    handleCloseDetailsDialog();
  };

  const handleEditMember = (memberId: string, crewId: string) => {
    const member = selectedCrew?.crewMembers.find((m) => m._id === memberId);
    if (member) {
      setSelectedMember(member); 
    }
  };

  const handleDeleteMember = async (memberId: string, crewId: string) => {
    try {
      const updatedCrew = await removeCrewMemberAPI(crewId, memberId);
    } catch (error) {
      console.error("Error removing member:", error);
      toast.error("An error occurred while removing the member. Please try again.");
    }
    setSelectedMember(null); 
    handleCloseDetailsDialog();
  };
  
  // Handle saving or updating the crew
  const handleUpdateCrew = async (crew: ICrew) => {
    try {
      if (isCreating) {
        // Create new crew
        const newCrew = await createCrewAPI(crew);
        
        // Optimistically add the new crew to the list
        setCrewList((prevList) => [...prevList, newCrew]);
        toast.success("Crew created successfully");
      } else if (editingCrew) {
        // Update existing crew
        const updatedCrew = await updateCrewAPI(crew._id, crew);
        
        // Optimistically update the crew in the list
        setCrewList((prevList) =>
          prevList.map((item) => (item._id === updatedCrew._id ? updatedCrew : item))
        );
        toast.success("Crew updated successfully");
      }
    } catch (error) {
      // Handle error gracefully, in case it's not an Error object
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      toast.error(errorMessage);
    } finally {
      setIsDialogOpen(false); // Close dialog after operation
    }
  };
  
  return (
    <div className="bg-gradient-to-b from-blue-50 to-white min-h-screen">
      <div className="w-full p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 border-b border-blue-100 pb-4">
          <h1 className="text-3xl font-bold text-blue-800">Crew Management</h1>
          <button 
            onClick={handleCreateNewCrew}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow transition-colors flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
            </svg>
            Create New Crew
          </button>
        </div>

        {/* Crew List Section */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden w-full">
          <div className="px-6 py-4 bg-blue-600 text-white">
            <h2 className="text-xl font-semibold flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Crew List
            </h2>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center p-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : crewList.length === 0 ? (
            <div className="text-center py-12">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-blue-200 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <p className="text-lg text-gray-600">No crews available</p>
              <p className="text-gray-500 mt-1">Create a new crew to get started</p>
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <table className="w-full table-fixed divide-y divide-blue-100">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="w-1/6 px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Crew Name</th>
                    <th className="w-1/6 px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Leader</th>
                    <th className="w-1/6 px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Contact Email</th>
                    <th className="w-1/6 px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Contact Phone</th>
                    <th className="w-1/6 px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Work Type</th>
                    <th className="w-1/6 px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Members</th>
                    <th className="w-1/6 px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-blue-100">
                  {crewList.map((crew) => (
                    <tr key={crew._id} className="hover:bg-blue-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap truncate">
                        <div className="font-medium text-blue-800">{crew.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap truncate">
                        <div className="text-gray-700">{crew.leader || "—"}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap truncate">
                        <div className="text-gray-700">{crew.email || "—"}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap truncate">
                        <div className="text-gray-700">{crew.phone || "—"}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap truncate">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {crew.workType || "General"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap truncate">
                        <div className="text-gray-700">
                          {crew.crewMembers?.length || 0} members
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-4">
                          <button
                            onClick={() => handleEditCrew(crew)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Edit Crew"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleViewCrewDetails(crew)}
                            className="text-green-600 hover:text-green-800"
                            title="View Details"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                            </svg>
                          </button>
                          {/* Add delete button */}
                          <button
                            onClick={() => handleDeleteCrew(crew)}
                            className="text-red-600 hover:text-red-800"
                            title="Delete Crew"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Crew Dialog */}
      <CrewDialog
        isDialogOpen={isDialogOpen}
        editingCrew={editingCrew}
        setEditingCrew={setEditingCrew}
        setIsDialogOpen={setIsDialogOpen}
        handleUpdate={handleUpdateCrew}
        isCreating={isCreating}
      />

      {/* Member Details Dialog */}
      {selectedCrew && (
        <MemberDialog
          isOpen={isDetailsDialogOpen}
          crew={selectedCrew}
          onClose={handleCloseDetailsDialog}
          onCreateMember={handleCreateNewMember}
          onEditMember={handleEditMember}
          onDeleteMember={handleDeleteMember}
        />
      )}

      {/* Delete Confirmation Dialog - Using the provided ConfirmationDialog component */}
      <ConfirmationDialog
        isOpen={isDeleteConfirmOpen}
        title="Delete Crew"
        message={`Are you sure you want to delete. This action cannot be undone and all associated crew member data will be permanently removed.`}
        onConfirm={confirmDeleteCrew}
        onCancel={cancelDeleteCrew}
      />
    </div>
  );
};

export default CrewPage;
