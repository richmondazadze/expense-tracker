import Modal from "../modal";

import { useContext } from "react";
import { financeContext } from "@/lib/store/finance-context";
import { currencyFormatter } from "@/lib/utlis";
import { MdOutlineDeleteOutline } from "react-icons/md";

function ViewExpenseModal({ show, onClose, expense }) {
  const { deleteExpenseItem, deleteExpenseCategory } =
    useContext(financeContext);

  const deleteExpenseHandler = async () => {
    try {
      await deleteExpenseCategory(expense.id);
    } catch (error) {
      console.log(error.message);
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
    } catch (error) {
      console.log(error.message);
    }
  };
  return (
    <Modal show={show} onClose={onClose}>
      <div className="flex items-center justify-between">
        <h3 className="capitalize font-bold text-3xl">{expense.title}</h3>
      </div>

      <div>
        <h4 className="my-4 text-2xl">Expense History</h4>
        {expense.items.map((item) => {
          return (
            <div key={item.id} className="flex items-center justify-between">
              <small>
                {item.createdAt.toMillis
                  ? new Date(item.createdAt.toMillis()).toISOString()
                  : item.createdAt.toISOString()}
              </small>
              <p className="flex items-center gap-2">
                {" "}
                {currencyFormatter(item.amount)}
                <button
                  onClick={() => {
                    deleteExpenseItemHandler(item);
                  }}
                >
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