import { useState, useEffect } from "react";
import Select from "react-select";
import { IOrganization, IUser } from "../../types/IResponse";
import Button from "../Button/Button";

interface EditOrganizationDialogProps {
  isDialogOpen: boolean;
  editingOrganization: IOrganization | null;
  setEditingOrganization: (organization: IOrganization | null) => void;
  setIsDialogOpen: (isOpen: boolean) => void;
  handleSubmit: () => void;
  isCreating: boolean;
  organizerUsers: IUser[];
  staffAdvisorUsers: IUser[];
  loadingUsers: boolean;
}

interface SelectOption {
  value: string;
  label: string;
}

const EditOrganizationDialog = ({
  isDialogOpen,
  editingOrganization,
  setEditingOrganization,
  setIsDialogOpen,
  handleSubmit,
  isCreating,
  organizerUsers,
  staffAdvisorUsers,
  loadingUsers
}: EditOrganizationDialogProps) => {
  const [presidentOptions, setPresidentOptions] = useState<SelectOption[]>([]);
  const [staffAdvisorOptions, setStaffAdvisorOptions] = useState<SelectOption[]>([]);
  const [selectedPresident, setSelectedPresident] = useState<SelectOption | null>(null);
  const [selectedStaffAdvisor, setSelectedStaffAdvisor] = useState<SelectOption | null>(null);

  useEffect(() => {
    // Convert users to select options
    const presOptions = organizerUsers.map(user => ({
      value: user._id,
      label: `${user.username} (${user.email})`
    }));
    setPresidentOptions(presOptions);

    const advisorOptions = staffAdvisorUsers.map(user => ({
      value: user._id,
      label: `${user.username} (${user.email})`
    }));
    setStaffAdvisorOptions(advisorOptions);

    // Set initial selections if editing
    if (editingOrganization && !isCreating) {
      const presId = typeof editingOrganization.president === 'string' 
        ? editingOrganization.president 
        : editingOrganization.president?._id;
        
      const advId = typeof editingOrganization.staffAdvisor === 'string'
        ? editingOrganization.staffAdvisor
        : editingOrganization.staffAdvisor?._id;

      if (presId) {
        const presOption = presOptions.find(opt => opt.value === presId);
        setSelectedPresident(presOption || null);
      }
      
      if (advId) {
        const advOption = advisorOptions.find(opt => opt.value === advId);
        setSelectedStaffAdvisor(advOption || null);
      }
    }
  }, [editingOrganization, organizerUsers, staffAdvisorUsers, isCreating]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editingOrganization) {
      setEditingOrganization({
        ...editingOrganization,
        [e.target.name]: e.target.value,
      });
    }
  };

  const handlePresidentChange = (selected: SelectOption | null) => {
    setSelectedPresident(selected);
    if (editingOrganization && selected) {
      setEditingOrganization({
        ...editingOrganization,
        president: selected.value,
      });
    }
  };

  const handleStaffAdvisorChange = (selected: SelectOption | null) => {
    setSelectedStaffAdvisor(selected);
    if (editingOrganization && selected) {
      setEditingOrganization({
        ...editingOrganization,
        staffAdvisor: selected.value,
      });
    }
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedPresident(null);
    setSelectedStaffAdvisor(null);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">
          {isCreating ? "Create Organization" : "Edit Organization"}
        </h2>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Organization Name
          </label>
          <input
            type="text"
            name="name"
            value={editingOrganization?.name || ""}
            onChange={handleInputChange}
            placeholder="Organization name"
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            President (Organizer Role)
          </label>
          {loadingUsers ? (
            <div className="p-2 border border-gray-300 rounded">Loading users...</div>
          ) : (
            <Select
              value={selectedPresident}
              onChange={handlePresidentChange}
              options={presidentOptions}
              className="text-sm"
              placeholder="Select a president..."
              isSearchable
              isClearable
            />
          )}
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Staff Advisor
          </label>
          {loadingUsers ? (
            <div className="p-2 border border-gray-300 rounded">Loading users...</div>
          ) : (
            <Select
              value={selectedStaffAdvisor}
              onChange={handleStaffAdvisorChange}
              options={staffAdvisorOptions}
              className="text-sm"
              placeholder="Select a staff advisor..."
              isSearchable
              isClearable
            />
          )}
        </div>
        
        <div className="flex justify-end space-x-2 mt-6">
          <Button
            text="Cancel"
            onClick={closeDialog}
            color="secondary"
            size="sm"
          />
          <Button
            text={isCreating ? "Create" : "Update"}
            onClick={handleSubmit}
            color="primary"
            size="sm"
            disabled={!editingOrganization?.name || !selectedPresident || !selectedStaffAdvisor}
          />
        </div>
      </div>
    </div>
  );
};

export default EditOrganizationDialog;