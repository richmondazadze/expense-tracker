import { useState, useContext, useRef, useEffect } from "react";
import { financeContext } from "@/lib/store/finance-context";

import { v4 as uuidv4 } from "uuid";
import Modal from "../modal";

import { toast } from "react-toastify";

function AddExpensesModal({ show, onClose }) {
  const [expenseAmount, setExpenseAmount] = useState("");
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isSliding, setIsSliding] = useState(false);
  const toggleAddExpense = () => {
    setIsSliding(true);
    setShowAddExpense((prev) => !prev);
  };

  useEffect(() => {
    if (isSliding) {
      const timer = setTimeout(() => {
        setIsSliding(false);
      }, 300); // Match this with the transition duration
      return () => clearTimeout(timer);
    }
  }, [isSliding]);

  const { expenses, addExpenseItem, addCategory } = useContext(financeContext);

  const titleRef = useRef();
  const colorRef = useRef();
  const addExpenseItemHanlder = async () => {
    const expense = expenses.find((e) => {
      return e.id === selectedCategory;
    });
    const newExpense = {
      color: expense.color,
      title: expense.title,
      total: expense.total + +expenseAmount,
      items: [
        ...expense.items,
        {
          amount: +expenseAmount,
          createdAt: new Date(),
          id: uuidv4(),
        },
      ],
    };

    try {
      await addExpenseItem(selectedCategory, newExpense);

      // console.log(newExpense);

      setExpenseAmount("");
      setSelectedCategory(null);
      onClose();
      toast.success("Expense Recorded ");
    } catch (error) {
      console.log(error.message);
      toast.error(error.message);
    }
  };

  const addCategoryHandler = async () => {
    const title = titleRef.current.value;
    const color = colorRef.current.value;

    try {
      await addCategory({ title, color, total: 0 });
      setShowAddExpense(false);
      toast.success("Category created ");
    } catch (error) {
      console.log(error.message);
      toast.error(error.message);
    }
  };

  return (
    <Modal show={show} onClose={onClose}>
      <div className="flex flex-col gap-4">
        <label>Enter an amount..</label>
        <input
          type="number"
          min={1.0}
          step={1.0}
          placeholder="Enter expense amount"
          value={expenseAmount}
          onChange={(e) => {
            setExpenseAmount(e.target.value);
          }}
        />
      </div>

      {/* ExpensesCategory */}

      {expenseAmount > 0 && (
        <div className="flex flex-col gap-4 mt-6 relative">
          <div className="flex items-center justify-between">
            <h5 className="text-l capitalize">Select expense category</h5>
            <button
              onClick={() => {
                setShowAddExpense(true);
                toggleAddExpense;
              }}
              className="text-lime-400"
            >
              + New Category
            </button>
          </div>

          {(showAddExpense || isSliding) && (
            <div className="absolute top-[5px] left-0 right-0 bg-slate-800 border-lime-500 rounded-2xl mx -5 p-4 transition-transform duration-300 ease-out transform -translate-x-2">
              <input type="text" placeholder="Enter title" ref={titleRef} />
              <div className="flex items-center justify-between my-3">
                <div className="flex items-center gap-4 mx-2">
                  <label>Pick Color</label>
                  <input className="w-20 h-10" type="color" ref={colorRef} />
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={addCategoryHandler}
                    className="btn btn-primary-outline"
                  >
                    Create
                  </button>
                  <button
                    onClick={() => {
                      setShowAddExpense(false);
                    }}
                    className="btn btn-danger"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
          <div className="overflow-y-scroll flex flex-col max-h-[250px] my-4 scrollbar-thumb-rounded-2xl scrollbar-track-rounded-full scrollbar-thin scrollbar-thumb-lime-400 scrollbar-track-slate-900 ">
            {" "}
            {/* Added scrollable container */}
            {expenses.map((expense) => {
              return (
                <button
                  key={expense.id}
                  onClick={() => {
                    setSelectedCategory(expense.id);
                  }}
                  className="w-3/4 mx-auto my-2"
                >
                  <div
                    style={{
                      boxShadow:
                        expense.id === selectedCategory
                          ? "1px 1px 4px"
                          : "none",
                    }}
                    className="flex items-center justify-between px-4 py-4 w-full bg-slate-700 rounded-3xl"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-[25px] h-[25px] rounded-full"
                        style={{ backgroundColor: expense.color }}
                      />
                      <h4 className="capitalize">{expense.title}</h4>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {expenseAmount > 0 && selectedCategory && (
        <div className="mt-6">
          <button className="btn btn-primary" onClick={addExpenseItemHanlder}>
            Add Expense
          </button>
        </div>
      )}
    </Modal>
  );
}

export default AddExpensesModal;
