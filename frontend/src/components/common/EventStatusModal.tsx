import { useState, useEffect } from 'react';
import Button from '../Button/Button';
import { IEvent } from '../../types/IResponse';
import { FiCheckCircle, FiXCircle, FiAlertCircle } from 'react-icons/fi';
import { MdPending } from 'react-icons/md';

interface EventStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate: (eventId: string, status: string) => Promise<void>;
  event: IEvent | null;
}

const EventStatusModal = ({ isOpen, onClose, onStatusUpdate, event }: EventStatusModalProps) => {
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Initialize the selected status when the event changes
    if (event) {
      setSelectedStatus(event.eventStatus || 'Pending');
    }
  }, [event]);

  if (!isOpen || !event) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate status selection
    if (!selectedStatus || selectedStatus === event.eventStatus) {
      setError('Please select a different status');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await onStatusUpdate(event._id, selectedStatus);
      onClose();
    } catch (error: any) {
      setError(error.message || 'Failed to update status');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Approved':
        return <FiCheckCircle className="text-green-500" />;
      case 'Rejected':
        return <FiXCircle className="text-red-500" />;
      case 'Pending':
      default:
        return <MdPending className="text-yellow-500" />;
    }
  };

  const getStatusClass = (status: string) => {
    if (status === selectedStatus) {
      switch (status) {
        case 'Approved': return 'ring-2 ring-green-500 bg-green-50';
        case 'Rejected': return 'ring-2 ring-red-500 bg-red-50';
        case 'Pending': return 'ring-2 ring-yellow-500 bg-yellow-50';
        default: return '';
      }
    }
    return 'hover:bg-gray-50';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Update Event Status</h2>
        
        <div className="mb-4">
          <h3 className="font-semibold text-gray-700">{event.eventName}</h3>
          <p className="text-sm text-gray-500">
            Current Status: 
            <span className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
              ${event.eventStatus === 'Approved' ? 'bg-green-100 text-green-800' : 
                event.eventStatus === 'Rejected' ? 'bg-red-100 text-red-800' : 
                'bg-yellow-100 text-yellow-800'}`}>
              {getStatusIcon(event.eventStatus || 'Pending')}
              <span className="ml-1">{event.eventStatus || 'Pending'}</span>
            </span>
          </p>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md flex items-center">
            <FiAlertCircle className="mr-2" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Select New Status:</label>
            <div className="space-y-2">
              {['Pending', 'Approved', 'Rejected'].map((status) => (
                <div
                  key={status}
                  className={`p-3 border rounded-md cursor-pointer flex items-center transition ${getStatusClass(status)}`}
                  onClick={() => setSelectedStatus(status)}
                >
                  <input
                    type="radio"
                    name="status"
                    checked={selectedStatus === status}
                    onChange={() => setSelectedStatus(status)}
                    className="mr-3"
                  />
                  {getStatusIcon(status)}
                  <span className="ml-2">{status}</span>
                  
                  {status === 'Approved' && (
                    <span className="ml-auto text-xs text-green-600">Will send approval notification</span>
                  )}
                  
                  {status === 'Rejected' && (
                    <span className="ml-auto text-xs text-red-600">Will send rejection notification</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <Button
              text="Cancel"
              color="secondary"
              onClick={onClose}
              disabled={isSubmitting}
            />
            <Button
              text={isSubmitting ? "Updating..." : "Update Status"}
              onClick={handleSubmit}
              type="submit"
              disabled={isSubmitting || selectedStatus === event.eventStatus}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventStatusModal;