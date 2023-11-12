import { useContext } from "react";
import { useState } from "react";
import { createContext } from "react";
import "./modal.scss";

const ModalContext = createContext();


export default function ModalProvider(props) {
  const [modals, setModals] = useState([]);

  const openModal = (content) => {
    setModals([...modals, content]);
  };

  const closeModal = () => {
    setModals(modals.slice(0, -1));
  };

  return (
    <ModalContext.Provider value={{ openModal, closeModal }}>
      {props.children}
      {modals.map((modal, index) => (
        <div key={index} className="modal">
          {modal}
        </div>
      ))}
    </ModalContext.Provider>
  );
};


export function useModal() {
  return useContext(ModalContext);
};