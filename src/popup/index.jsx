import ModalProvider from "./modal/ModalContext";
import Popup from "./Popup";

export default function PopupIndex() {
  return (
    <ModalProvider>
      <Popup/>
    </ModalProvider>
  )
}