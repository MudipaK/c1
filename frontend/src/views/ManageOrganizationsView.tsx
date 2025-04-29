import { useState, useEffect } from "react";
import Select from "react-select";
import { IOrganization, IUser, IEvent } from "../types/IResponse"; 
import { 
  deleteOrganizationAPI, 
  getOrganizationsAPI, 
  updateOrganizationAPI, 
  createOrganizationAPI 
} from "../services/OrganizationService";
import { getUsersAPI } from "../services/UserService";
import EditOrganizationDialog from "../components/common/EditOrganizationDialog";
import { 
  FiCalendar, FiClock, FiUser, FiFileText, FiX, FiSearch,
  FiEdit3, FiEye, FiTrash2, FiUsers, FiUserCheck, FiGrid
} from "react-icons/fi";
import { MdOutlineEventNote, MdPerson, MdSupervisorAccount, MdEvent, MdAdd } from "react-icons/md";
import { getFileUrl } from "../services/FileUploadService";
import ViewOrganizationModal from "../components/common/ViewOrganizationModal";
import { toast } from "react-toastify";
import Button from "../components/Button/IconButton";

const ManageOrganizations = () => {
  // Organization states
  const [organizations, setOrganizations] = useState<IOrganization[]>([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingOrganization, setEditingOrganization] = useState<IOrganization | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreatingOrganization, setIsCreatingOrganization] = useState(false);
  
  // New states for viewing organization details
  const [viewingOrganization, setViewingOrganization] = useState<IOrganization | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  
  // User states
  const [users, setUsers] = useState<IUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  
  // Display state (table or grid view)
  const [displayMode, setDisplayMode] = useState<'table' | 'grid'>('table');

  useEffect(() => {
    fetchOrganizations();
    fetchUsers();
    
    // Check screen size for initial display mode
    const handleResize = () => {
      setDisplayMode(window.innerWidth < 768 ? 'grid' : 'table');
    };
    
    // Set initial display mode
    handleResize();
    
    // Add resize event listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchOrganizations = async () => {
    setLoading(true);
    try {
      const response = await getOrganizationsAPI();
      if (Array.isArray(response)) {
        setOrganizations(response);
      } else {
        setError("Failed to load organizations");
      }
    } catch {
      setError("Failed to load organizations");
      setOrganizations([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await getUsersAPI();
      if (Array.isArray(response)) {
        setUsers(response);
      } else {
        console.error("Failed to load users");
      }
    } catch (err) {
      console.error("Failed to load users", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Filter users by role
  const organizerUsers = users.filter(user => user.role === "organizer");
  const staffAdvisorUsers = users.filter(user => user.role === "staff advisor");

  const handleDelete = async (id: string) => {
    try {
      await deleteOrganizationAPI(id);
      setOrganizations((prevOrgs) => prevOrgs.filter((org) => org._id !== id));
      toast.success("Organization deleted successfully");
    } catch {
      toast.error("Failed to delete organization");
    }
  };

  const handleEdit = (organization: IOrganization) => {
    setEditingOrganization(organization);
    setIsDialogOpen(true);
    setIsCreatingOrganization(false);
  };

  // Handler for viewing organization details
  const handleView = (organization: IOrganization) => {
    setViewingOrganization(organization);
    setIsViewModalOpen(true);
  };

  const handleCreate = () => {
    setEditingOrganization({
      name: "",
      president: "",
      staffAdvisor: "",
      eventIds: []
    } as IOrganization);
    setIsDialogOpen(true);
    setIsCreatingOrganization(true);
  };

  const handleUpdate = async () => {
    if (editingOrganization) {
      try {
        await updateOrganizationAPI(editingOrganization._id, editingOrganization);
        fetchOrganizations();
        setIsDialogOpen(false);
        toast.success("Organization updated successfully");
      } catch {
        toast.error("Failed to update organization");
      }
    }
  };

  const handleCreateOrganization = async () => {
    if (editingOrganization) {
      try {
        const newOrg = await createOrganizationAPI(editingOrganization);
        if(newOrg.status === 400) {
          toast.error(newOrg.originalError.message || "Failed to create organization");
          return;
        }
        fetchOrganizations();
        setIsDialogOpen(false);
        toast.success("Organization created successfully");
      } catch {
        toast.error("Failed to create organization");
      }
    }
  };

  const filteredOrganizations = organizations.filter((org) =>
    org.name?.toLowerCase().includes(search.toLowerCase())
  );
  
  // Statistics calculations
  const totalOrgs = organizations.length;
  const totalEvents = organizations.reduce((sum, org) => sum + (org.eventIds?.length || 0), 0);
  const orgsWithPresident = organizations.filter(org => org.president).length;

  return (
    <div className="p-4 md:p-6 bg-gray-100 min-h-screen w-full max-w-full overflow-x-hidden">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-blue-700 flex items-center">
          <MdOutlineEventNote className="mr-2" />
          Manage Organizations
        </h2>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-blue-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-500 text-sm">Total Organizations</p>
                <p className="text-2xl font-bold">{totalOrgs}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <FiGrid className="text-blue-500 text-xl" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-green-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-500 text-sm">Total Events</p>
                <p className="text-2xl font-bold">{totalEvents}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <MdEvent className="text-green-500 text-xl" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-purple-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-500 text-sm">Organizations with President</p>
                <p className="text-2xl font-bold">{orgsWithPresident} of {totalOrgs}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <MdPerson className="text-purple-500 text-xl" />
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div
            className="mb-4 p-3 rounded-md text-center"
            style={{ 
              backgroundColor: error.includes("successfully") ? "#f0fdf4" : "#fef2f2",
              color: error.includes("successfully") ? "#166534" : "#b91c1c"
            }}
          >
            {error}
          </div>
        )}

        {/* Search and Controls */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by organization name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 p-3 border border-gray-300 rounded-md w-full"
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setDisplayMode('table')}
                  className={`p-2 rounded ${displayMode === 'table' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
                  aria-label="Table view"
                >
                  <FiGrid />
                </button>
                <button 
                  onClick={() => setDisplayMode('grid')}
                  className={`p-2 rounded ${displayMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
                  aria-label="Grid view"
                >
                  <FiUsers />
                </button>
              </div>
              
              <Button
                text="Create Organization"
                icon={<MdAdd />}
                size="sm"
                onClick={handleCreate}
              />
            </div>
          </div>
        </div>

        {/* Organizations List */}
        {loading ? (
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="animate-spin h-12 w-12 border-t-2 border-blue-500 rounded-full mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading organizations...</p>
          </div>
        ) : (
          <>
            {displayMode === 'table' ? (
              <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-blue-50 text-left border-b border-blue-100">
                      <tr>
                        <th className="p-4 text-blue-700">Name</th>
                        <th className="p-4 text-blue-700">President</th>
                        <th className="p-4 text-blue-700">Staff Advisor</th>
                        <th className="p-4 text-blue-700">Events</th>
                        <th className="p-4 text-blue-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrganizations.length ? (
                        filteredOrganizations.map((org) => (
                          <tr key={org._id} className="border-b hover:bg-gray-50 transition duration-150">
                            <td className="p-4 font-medium">{org.name}</td>
                            <td className="p-4">
                              <div className="flex items-center">
                                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                                  <MdPerson className="text-blue-500" />
                                </div>
                                <span>{org.president?.username || "Not assigned"}</span>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center">
                                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center mr-2">
                                  <MdSupervisorAccount className="text-green-500" />
                                </div>
                                <span>{org.staffAdvisor?.username || "Not assigned"}</span>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                {org.eventIds?.length || 0} Events
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex space-x-2">
                                <Button 
                                  text="View" 
                                  icon={<FiEye />}
                                  size="sm" 
                                  onClick={() => handleView(org)} 
                                />
                                <Button 
                                  text="Edit" 
                                  icon={<FiEdit3 />}
                                  size="sm" 
                                  onClick={() => handleEdit(org)} 
                                />
                                <Button
                                  text="Delete"
                                  icon={<FiTrash2 />}
                                  size="sm"
                                  color="danger"
                                  onClick={() => handleDelete(org._id)}
                                />
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="text-center p-6 text-gray-500">
                            No organizations found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredOrganizations.length ? (
                  filteredOrganizations.map((org) => (
                    <div key={org._id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 transition-transform transform hover:scale-[1.02]">
                      <div className="p-4 border-b bg-blue-50">
                        <h3 className="text-lg font-semibold">{org.name}</h3>
                      </div>
                      <div className="p-4 space-y-3">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                            <MdPerson className="text-blue-500" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">President</p>
                            <p>{org.president?.username || "Not assigned"}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center mr-2">
                            <MdSupervisorAccount className="text-green-500" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Staff Advisor</p>
                            <p>{org.staffAdvisor?.username || "Not assigned"}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center mr-2">
                            <MdEvent className="text-purple-500" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Events</p>
                            <p>{org.eventIds?.length || 0} Events</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 bg-gray-50 border-t flex justify-between">
                        <Button 
                          text="View" 
                          icon={<FiEye />}
                          size="sm" 
                          onClick={() => handleView(org)} 
                        />
                        <Button 
                          text="Edit" 
                          icon={<FiEdit3 />}
                          size="sm" 
                          onClick={() => handleEdit(org)} 
                        />
                        <Button
                          text="Delete"
                          icon={<FiTrash2 />}
                          size="sm"
                          color="danger"
                          onClick={() => handleDelete(org._id)}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full p-8 bg-white rounded-lg shadow-md text-center">
                    <p className="text-gray-500">No organizations found.</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {isDialogOpen && (
        <EditOrganizationDialog
          isDialogOpen={isDialogOpen}
          editingOrganization={editingOrganization}
          setEditingOrganization={setEditingOrganization}
          setIsDialogOpen={setIsDialogOpen}
          handleSubmit={isCreatingOrganization ? handleCreateOrganization : handleUpdate}
          isCreating={isCreatingOrganization}
          organizerUsers={organizerUsers}
          staffAdvisorUsers={staffAdvisorUsers}
          loadingUsers={loadingUsers}
        />
      )}

      <ViewOrganizationModal
        organization={viewingOrganization}
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
      />
    </div>
  );
};

export default ManageOrganizations;