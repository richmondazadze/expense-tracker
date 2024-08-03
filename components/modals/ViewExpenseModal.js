import Modal from "../modal";

import { useContext } from "react";
import { financeContext } from "@/lib/store/finance-context";
import { currencyFormatter } from "@/lib/utlis";
import { toast } from "react-toastify";
import { MdOutlineDeleteOutline } from "react-icons/md";

function ViewExpenseModal({ show, onClose, expense }) {
  const { deleteExpenseItem, deleteExpenseCategory } =
    useContext(financeContext);

  const deleteExpenseHandler = async () => {
    try {
      await deleteExpenseCategory(expense.id);
      toast.success("Category deleted successfully");
    } catch (error) {
      console.log(error.message);
      toast.error(error.message);
    }
  };
  const deleteExpenseItemHandler = async (item) => {
    try {
      const updatedItems = expense.items.filter((i) => i.id !== item.id);
      const updatedExpense = {
        items: [...updatedItems],
        total: expense.total - item.amount,
      };

      await deleteExpenseItem(updatedExpense, expense.id);
      toast.success("Expense removed successfully");
    } catch (error) {
      console.log(error.message);
      toast.error(error.message);
    }
  };
  return (
    <Modal show={show} onClose={onClose}>
      <div className="flex items-center justify-between">
        <h3 className="capitalize font-bold text-3xl">{expense.title}</h3>
      </div>{" "}
      {/* Added overflow and max height */}
      <h4 className="my-4 text-2xl">Expense History</h4>
      <div className="overflow-y-scroll flex flex-col max-h-[270px] my-4 scrollbar-thumb-rounded-2xl scrollbar-track-rounded-full scrollbar-thin scrollbar-thumb-lime-400 scrollbar-track-slate-900 ">
        {expense.items.map((item) => {
          return (
            <div
              key={item.id}
              className="flex items-center justify-between my-2"
            >
              <small className="text-3xs">
                {new Date(
                  item.createdAt.toMillis
                    ? item.createdAt.toMillis()
                    : item.createdAt
                ).toLocaleDateString()}{" "}
                ||{" "}
                {new Date(
                  item.createdAt.toMillis
                    ? item.createdAt.toMillis()
                    : item.createdAt
                ).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </small>
              <p className="flex font-bold items-left justify-start text-lg gap-1">
                {currencyFormatter(item.amount)}
                <button onClick={() => deleteExpenseItemHandler(item)}>
                  <MdOutlineDeleteOutline className="text-xl font-bold" />
                </button>
              </p>
            </div>
          );
        })}
      </div>
      <div className="flex flex-col gap-6 items-center justify-center my-7">
        <h4 className="capitalize font-bold text-3xl">
          Total = {currencyFormatter(expense.total)}
        </h4>
        <button onClick={deleteExpenseHandler} className="btn btn-danger">
          Delete Category
        </button>
      </div>
    </Modal>
  );
}

export default ViewExpenseModal;
