import React, { FC, useState, useEffect } from "react";
import { ICrewMember } from "../../types/IResponse";
import Button from "../Button/Button";

interface MemberFormDialogProps {
  isOpen: boolean;
  member: ICrewMember | null;
  onClose: () => void;
  onSave: (member: ICrewMember) => void;
}

interface ValidationErrors {
  name?: string;
  email?: string;
  phone?: string;
}

const MemberFormDialog: FC<MemberFormDialogProps> = ({
  isOpen,
  member,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<ICrewMember>({
    _id: member ? member._id : "",
    name: member ? member.name : "",
    email: member ? member.email : "",
    phone: member ? member.phone : "",
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (member) {
      setFormData({ ...member });
    } else {
      setFormData({
        _id: "",
        name: "",
        email: "",
        phone: "",
      });
    }
    // Reset errors and touched state when member changes
    setErrors({});
    setTouched({});
  }, [member]);

  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case "name":
        return !value.trim() ? "Name is required" : undefined;
      case "email":
        if (!value.trim()) return "Email is required";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return !emailRegex.test(value) ? "Invalid email format" : undefined;
      case "phone":
        if (!value.trim()) return "Phone is required";
        const phoneRegex = /^\+?[0-9]{10,15}$/;
        return !phoneRegex.test(value) ? "Invalid phone number format" : undefined;
      default:
        return undefined;
    }
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};
    
    // Validate all fields
    Object.entries(formData).forEach(([key, value]) => {
      if (key === "_id") return; // Don't validate ID
      const error = validateField(key, value as string);
      if (error) newErrors[key as keyof ValidationErrors] = error;
      
      // Mark all fields as touched for validation display
      setTouched(prev => ({ ...prev, [key]: true }));
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Validate field on change if it's been touched
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Validate on blur
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSave = () => {
    const isValid = validateForm();
    if (isValid) {
      onSave(formData);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-40">
      <div className="absolute inset-0 backdrop-blur-sm"></div>
      <div className="bg-white p-8 rounded-lg w-full max-w-md shadow-xl z-10 border-t-4 border-blue-500">
        <h3 className="text-2xl font-bold mb-6 text-blue-700">
          {formData._id ? "Edit Member" : "Create New Member"}
        </h3>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            name="name"
            className={`mt-1 p-2 border rounded w-full ${
              touched.name && errors.name ? "border-red-500" : ""
            }`}
            value={formData.name}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          {touched.name && errors.name && (
            <p className="mt-1 text-sm text-red-500">{errors.name}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            name="email"
            className={`mt-1 p-2 border rounded w-full ${
              touched.email && errors.email ? "border-red-500" : ""
            }`}
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          {touched.email && errors.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Phone</label>
          <input
            type="text"
            name="phone"
            className={`mt-1 p-2 border rounded w-full ${
              touched.phone && errors.phone ? "border-red-500" : ""
            }`}
            value={formData.phone}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          {touched.phone && errors.phone && (
            <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
          )}
        </div>

        <div className="mt-4 flex justify-end space-x-4">
          <Button text="Cancel" onClick={onClose} />
          <Button text="Save" onClick={handleSave} />
        </div>
      </div>
    </div>
  );
};

export default MemberFormDialog;