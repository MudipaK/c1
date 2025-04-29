import NiceModal from "@ebay/nice-modal-react";
import {ErrorPopUp} from "./index";

export const showReload = (message: string) => {
    if (message) {
      NiceModal.show(ErrorPopUp, { isOpen: true, subTitle: message });
    }
  };