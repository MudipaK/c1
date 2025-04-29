import { IEvent } from "../../types/IResponse";
import CreateEventForm from "./CreateEventForm";

interface CreateEventDialogProps {
  isDialogOpen: boolean;
  setIsDialogOpen: (isOpen: boolean) => void;
  handleCreate: (newEvent: IEvent) => void;
  organizationId: string;
}

const CreateEventDialog = ({
  isDialogOpen,
  setIsDialogOpen,
  handleCreate,
  organizationId
}: CreateEventDialogProps) => {
  
  return (
    <CreateEventForm
      isOpen={isDialogOpen}
      onClose={() => setIsDialogOpen(false)}
      onSubmit={handleCreate}
      organizationId={organizationId}
    />
  );
};

export default CreateEventDialog;