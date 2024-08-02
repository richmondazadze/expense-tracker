import { IoClose } from "react-icons/io5";

function Modal({ show, onClose, children }) {
  return (
    <div
      style={{
        transform: show ? "translateX(0%)" : "translateX(-200%)",
      }}
      className="absolute top-7 left-0 w-full h-full z-10 transition-all duration-700"
    >
      <div className="container mx-auto max-w-xl h-[85vh] rounded-3xl bg-slate-800 py-6 px-5 mt-6 modal-content">
        <button
          onClick={() => {
            onClose(false);
          }}
          className="flex flex-col items-center justify-center w-10 h-10 mb-4 font-bold rounded-full bg-slate-600"
        >
          <IoClose className="text-3xl font-bold" />
        </button>
        {children}
      </div>
    </div>
  );
}

export default Modal;
