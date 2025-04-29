import React, { useEffect } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  Button,
  Stack,
} from "@mui/material";
import NiceModal, { useModal } from "@ebay/nice-modal-react";
import { ErrorRounded } from "@mui/icons-material";

interface IErrorPopUp {
  title: string;
  subTitle: string;
  content: string;
}

export const Modal: React.FC<IErrorPopUp> = ({ title, subTitle, content }) => {
  const handleRefresh = () => {
    window.location.reload();
  };

  const modal = useModal();

  useEffect(() => {}, [modal.visible, subTitle]);

  const handleClose = () => {
    handleRefresh();
    modal.hide();
  };

  const color = "#ef5350";
  const border = `2px ${color} solid`;

  return (
    <Dialog onClose={modal.hide} open={true} disableEscapeKeyDown={true}>
      <DialogTitle>
        <Typography variant="h4">{title}</Typography>
      </DialogTitle>
      <DialogContent
        sx={{ borderBottom: border, padding: "20px", margin: "0px 10px" }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <ErrorRounded sx={{ color: "red" }} fontSize="large" />
          <Typography variant="h6" sx={{ fontFamily: "Inter" }}>
            {subTitle}
          </Typography>
        </Stack>
        <Typography variant="subtitle2">{content}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} variant="contained" color="error">
          Refresh
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const ErrorPopUp = NiceModal.create(Modal);

export default ErrorPopUp;
