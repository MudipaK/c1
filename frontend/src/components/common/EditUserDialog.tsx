import { useState, useEffect, FC } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Button from '../Button/Button';
import { IUser } from '../../types/IResponse';

type UserRole = "staff admin" | "organizer" | "staff advisor";

interface EditUserDialogProps {
  isDialogOpen: boolean;
  editingUser: IUser | null;
  setEditingUser: (user: IUser) => void;
  setIsDialogOpen: (isOpen: boolean) => void;
  handleUpdate: () => void;
}

interface ErrorState {
  username: string;
  email: string;
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
  onCancel
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 backdrop-blur-sm"></div>
      <div className="bg-white p-6 rounded-lg w-full max-w-sm shadow-xl z-10 border-t-4 border-blue-500">
        <h3 className="text-xl font-bold mb-4 text-gray-800">{title}</h3>
        <p className="mb-6 text-gray-600">{message}</p>
        <div className="flex justify-end space-x-3">
          <Button
            text="Cancel"
            size="sm"
            color="danger"
            onClick={onCancel}
          />
          <Button
            text="Confirm"
            size="sm"
            onClick={onConfirm}
          />
        </div>
      </div>
    </div>
  );
};

const EditUserDialog: FC<EditUserDialogProps> = ({
  isDialogOpen,
  editingUser,
  setEditingUser,
  setIsDialogOpen,
  handleUpdate,
}) => {
  const [errors, setErrors] = useState<ErrorState>({
    username: '',
    email: '',
  });
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationAction, setConfirmationAction] = useState<'close' | 'save'>('close');

  // Reset errors when dialog opens with new user
  useEffect(() => {
    if (isDialogOpen && editingUser) {
      setErrors({ username: '', email: '' });
    }
  }, [isDialogOpen, editingUser]);

  // Validate when user data changes
  useEffect(() => {
    if (editingUser) {
      validateForm();
    }
  }, [editingUser]);

  const validateForm = (): boolean => {
    if (!editingUser) return false;

    const newErrors: ErrorState = {
      username: '',
      email: '',
    };

    // Username validation
    if (!editingUser.username) {
      newErrors.username = 'Username is required';
    } else if (editingUser.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    // Email validation
    if (!editingUser.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(editingUser.email)) {
      newErrors.email = 'Email is invalid';
    }

    setErrors(newErrors);
    return !newErrors.username && !newErrors.email;
  };

  const handleCancel = (): void => {
    setConfirmationAction('close');
    setShowConfirmation(true);
  };

  const handleSaveClick = (): void => {
    if (validateForm()) {
      setConfirmationAction('save');
      setShowConfirmation(true);
    }
  };

  const handleConfirm = (): void => {
    setShowConfirmation(false);
    if (confirmationAction === 'save') {
      handleUpdate();
      // Show success notification
      toast.success('User updated successfully!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
      });
    } else if (confirmationAction === 'close') {
      setIsDialogOpen(false);
      // Show info notification
      toast.info('Edit cancelled', {
        position: "top-right",
        autoClose: 2000
      });
    }
  };

  const handleCancelConfirmation = (): void => {
    setShowConfirmation(false);
  };

  if (!isDialogOpen || !editingUser) return null;

  // Ensure the role is one of the allowed literals
  const safeRole: UserRole = (editingUser.role as string === "staff admin" || editingUser.role as string === "organizer" || editingUser.role as string === "staff advisor") 
    ? (editingUser.role as UserRole) 
    : "organizer"; // Default to "client" if role is invalid

  const handleRoleChange = (newRole: string): void => {
    // Only allow valid roles
    if (newRole === "staff admin" || newRole === "organizer" || newRole === "staff advisor") {
      setEditingUser({ ...editingUser, role: newRole as UserRole });
    }
  };

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center z-40">
        <div className="absolute inset-0 backdrop-blur-sm"></div>
        
        <div className="bg-white p-8 rounded-lg w-full max-w-md shadow-xl z-10 border-t-4 border-blue-500">
          <h3 className="text-2xl font-bold mb-6 text-blue-700">Edit User</h3>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={editingUser.username || ''}
              onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
              className={`p-3 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.username ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.username && (
              <p className="text-red-500 text-xs mt-1">{errors.username}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={editingUser.email || ''}
              onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
              className={`p-3 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

             <div className="mb-6">
                <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="role">
                     Role
                    </label>
                        <div className="relative">
                        <select
                          id="role"
                          value={safeRole}
                          onChange={(e) => handleRoleChange(e.target.value)}
                          className="p-3 pr-10 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                        >
                          <option value="staff admin">Staff Admin</option>
                          <option value="organizer">Organizer</option>
                          <option value="staff advisor">Staff Advisor</option>
                        </select>
              
                   <div className="absolute top-0 right-0 px-3 py-3 text-gray-500 pointer-events-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>

          </div>

          <div className="flex justify-end space-x-3">
            <Button
              text="Cancel"
              size="sm"
              color="danger"
              onClick={handleCancel}
            />
            <Button
              text="Save"
              size="sm"
              onClick={handleSaveClick}
            />
          </div>
        </div>
      </div>

      <ConfirmationDialog
        isOpen={showConfirmation}
        title={confirmationAction === 'save' ? "Confirm Update" : "Confirm Cancel"}
        message={
          confirmationAction === 'save' 
            ? "Are you sure you want to update this user?" 
            : "Are you sure you want to cancel? Any unsaved changes will be lost."
        }
        onConfirm={handleConfirm}
        onCancel={handleCancelConfirmation}
      />
    </>
  );
};

export default EditUserDialog;