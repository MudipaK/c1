import { useState, useEffect, FC } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Button from "../Button/Button";
import { ICrew } from "../../types/IResponse"; 

interface CrewDialogProps {
  isDialogOpen: boolean;
  editingCrew: ICrew | null; 
  setEditingCrew: (crew: ICrew) => void; 
  setIsDialogOpen: (isOpen: boolean) => void; 
  handleUpdate: (crew: ICrew) => void; 
  isCreating: boolean; 
}

interface ErrorState {
  name: string;
  description: string;
  phone: string;
  email: string;
  workType: string;
  leader: string;
}

interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

// Confirmation Dialog Component
const ConfirmationDialog: FC<ConfirmationDialogProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 backdrop-blur-sm"></div>
      <div className="bg-white p-6 rounded-lg w-full max-w-sm shadow-xl z-10 border-t-4 border-blue-500">
        <h3 className="text-xl font-bold mb-4 text-gray-800">{title}</h3>
        <p className="mb-6 text-gray-600">{message}</p>
        <div className="flex justify-end space-x-3">
          <Button text="Cancel" size="sm" color="danger" onClick={onCancel} />
          <Button text="Confirm" size="sm" onClick={onConfirm} />
        </div>
      </div>
    </div>
  );
};

const CrewDialog: FC<CrewDialogProps> = ({
  isDialogOpen,
  editingCrew,
  setEditingCrew,
  setIsDialogOpen,
  handleUpdate,
  isCreating,
}) => {
  const [errors, setErrors] = useState<ErrorState>({
    name: "",
    description: "",
    phone: "",
    email: "",
    workType: "",
    leader: "",
  });
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationAction, setConfirmationAction] = useState<"close" | "save">("close");

  // Reset errors when dialog opens
  useEffect(() => {
    if (isDialogOpen) {
      setErrors({
        name: "",
        description: "",
        phone: "",
        email: "",
        workType: "",
        leader: "",
      });

      if (isCreating) {
        setEditingCrew({
          _id: "",
          name: "",
          description: "",
          phone: "",
          email: "",
          workType: "",
          leader: "",
          status: "",
          crewMembers: [],
          profilePic: "",
        });
      }
    }
  }, [isDialogOpen, isCreating, setEditingCrew]);

  // Form validation logic
  const validateForm = (): boolean => {
    if (!editingCrew) return false;

    const newErrors: ErrorState = { name: "", description: "", phone: "", email: "", workType: "", leader: "" };

    if (!editingCrew.name) {
      newErrors.name = "Name is required";
    }

    if (!editingCrew.description) {
      newErrors.description = "Description is required";
    }

    if (!editingCrew.phone) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\+?\d{10,15}$/.test(editingCrew.phone)) {
      newErrors.phone = "Invalid phone number format";
    }

    if (!editingCrew.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(editingCrew.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!editingCrew.workType) {
      newErrors.workType = "Work type is required";
    }

    if (!editingCrew.leader) {
      newErrors.leader = "Leader is required";
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== "");
  };

  useEffect(() => {
    if (editingCrew) {
      validateForm();
    }
  }, [editingCrew]);

  // Handler for cancel action
  const handleCancel = (): void => {
    setConfirmationAction("close");
    setShowConfirmation(true);
  };

  // Handler for save action
  const handleSaveClick = (): void => {
    if (validateForm()) {
      setConfirmationAction("save");
      setShowConfirmation(true);
    }
  };

  // Handle the confirmation (save or close)
  const handleConfirm = (): void => {
    setShowConfirmation(false);
    if (confirmationAction === "save" && editingCrew) {
      handleUpdate(editingCrew);  // Pass the editingCrew to handleUpdate
      toast.success(isCreating ? "Crew created successfully!" : "Crew updated successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
    } else if (confirmationAction === "close") {
      setIsDialogOpen(false);
      toast.info("Edit cancelled", { position: "top-right", autoClose: 2000 });
    }
  };

  const handleCancelConfirmation = (): void => {
    setShowConfirmation(false);
  };

  // Don't render dialog if it's not open or no editingCrew
  if (!isDialogOpen || !editingCrew) return null;

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center z-40">
        <div className="absolute inset-0 backdrop-blur-sm"></div>
        <div className="bg-white p-8 rounded-lg w-full max-w-md shadow-xl z-10 border-t-4 border-blue-500">
          <h3 className="text-2xl font-bold mb-6 text-blue-700">
            {isCreating ? "Create Crew" : "Edit Crew"}
          </h3>

          {/* Crew Name */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="name">
              Crew Name
            </label>
            <input
              id="name"
              type="text"
              value={editingCrew.name || ""}
              onChange={(e) => setEditingCrew({ ...editingCrew, name: e.target.value })}
              className={`p-3 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.name ? "border-red-500" : "border-gray-300"}`}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Crew Description */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="description">
              Crew Description
            </label>
            <textarea
              id="description"
              value={editingCrew.description || ""}
              onChange={(e) => setEditingCrew({ ...editingCrew, description: e.target.value })}
              className={`p-3 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.description ? "border-red-500" : "border-gray-300"}`}
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          </div>

          {/* Phone Number */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="phone">
              Phone Number
            </label>
            <input
              id="phone"
              type="text"
              value={editingCrew.phone || ""}
              onChange={(e) => setEditingCrew({ ...editingCrew, phone: e.target.value })}
              className={`p-3 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.phone ? "border-red-500" : "border-gray-300"}`}
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
          </div>

          {/* Email Address */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={editingCrew.email || ""}
              onChange={(e) => setEditingCrew({ ...editingCrew, email: e.target.value })}
              className={`p-3 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email ? "border-red-500" : "border-gray-300"}`}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          {/* Work Type */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="workType">
              Work Type
            </label>
            <input
              id="workType"
              type="text"
              value={editingCrew.workType || ""}
              onChange={(e) => setEditingCrew({ ...editingCrew, workType: e.target.value })}
              className={`p-3 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.workType ? "border-red-500" : "border-gray-300"}`}
            />
            {errors.workType && <p className="text-red-500 text-xs mt-1">{errors.workType}</p>}
          </div>

          {/* Crew Leader */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="leader">
              Crew Leader
            </label>
            <input
              id="leader"
              type="text"
              value={editingCrew.leader || ""}
              onChange={(e) => setEditingCrew({ ...editingCrew, leader: e.target.value })}
              className={`p-3 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.leader ? "border-red-500" : "border-gray-300"}`}
            />
            {errors.leader && <p className="text-red-500 text-xs mt-1">{errors.leader}</p>}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <Button text="Cancel" size="sm" color="danger" onClick={handleCancel} />
            <Button text={isCreating ? "Create" : "Save"} size="sm" onClick={handleSaveClick} />
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showConfirmation}
        title={confirmationAction === "save" ? "Confirm Create" : "Confirm Cancel"}
        message={
          confirmationAction === "save"
            ? isCreating
              ? "Are you sure you want to create this crew?"
              : "Are you sure you want to update this crew?"
            : "Are you sure you want to cancel? Any unsaved changes will be lost."
        }
        onConfirm={handleConfirm}
        onCancel={handleCancelConfirmation}
      />
    </>
  );
};

export default CrewDialog;
