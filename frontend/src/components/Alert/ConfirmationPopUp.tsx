import { FC } from 'react';
import Button from '../Button/Button';

interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

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

export default ConfirmationDialog;