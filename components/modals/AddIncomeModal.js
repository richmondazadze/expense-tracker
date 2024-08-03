import { useRef, useEffect, useContext } from "react";

import { currencyFormatter } from "@/lib/utlis";

import { MdOutlineDeleteOutline } from "react-icons/md";

import { toast } from "react-toastify";

import Modal from "../modal";
import { financeContext } from "@/lib/store/finance-context";

import { authContext } from "@/lib/store/auth-context";

function AddIncomeModal({ show, onClose }) {
  const amountRef = useRef();
  const descriptionRef = useRef();

  const { income, addIncomeItem, removeIncomeItem } =
    useContext(financeContext);

  const { user } = useContext(authContext);
  const addIncomeHandler = async (e) => {
    e.preventDefault();
    const newIncome = {
      amount: +amountRef.current.value,
      description: descriptionRef.current.value,
      createdAt: new Date(),
      uid: user.uid,
    };

    try {
      addIncomeItem(newIncome);
      descriptionRef.current.value = "";
      amountRef.current.value = "";
      toast.success("Income added successfully ");
    } catch (error) {
      console.log(error.message);
      toast.error(error.message);
    }
  };

  const deleteIncomeEntryHandler = async (incomeId) => {
    try {
      removeIncomeItem(incomeId);
      toast.success("Income deleted successfully");
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <Modal show={show} onClose={onClose}>
      <form onSubmit={addIncomeHandler}>
        <div className="input-group">
          <label htmlFor="amount">Income Amount</label>
          <input
            type="number"
            name="amount"
            ref={amountRef}
            min={1.0}
            step={1.0}
            placeholder="Enter income amount"
            required
          />
        </div>

        <div className="flex flex-col gap-3 py-6">
          <label htmlFor="amount">Description</label>
          <input
            type="text"
            name="description"
            ref={descriptionRef}
            placeholder="Enter income description. E.g. Salary"
            required
          />
        </div>

        <button className="btn btn-primary" type="submit">
          Add Entry
        </button>
      </form>

      <div className="flex flex-col gap 4 mt-6">
        <h3 className="text-2xl font-bold">Income History</h3>
        <div className="overflow-y-scroll flex flex-col max-h-[170px] my-4 scrollbar-thumb-rounded-2xl scrollbar-track-rounded-full scrollbar-thin scrollbar-thumb-lime-400 scrollbar-track-slate-900 ">
          {income.map((i) => {
            return (
              <div className="flex item-center justify-between" key={i.id}>
                <div className="flex flex-col my-1">
                  <p className="font-semibold capitalize">{i.description}</p>
                  <small className="text-2xs">
                    {new Date(
                      i.createdAt.toMillis
                        ? i.createdAt.toMillis()
                        : i.createdAt
                    ).toLocaleDateString()}{" "}
                    ||{" "}
                    {new Date(
                      i.createdAt.toMillis
                        ? i.createdAt.toMillis()
                        : i.createdAt
                    ).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </small>
                </div>

                <p className="flex font-bold items-center text-l gap-1">
                  {currencyFormatter(i.amount)}
                  <button
                    onClick={() => {
                      deleteIncomeEntryHandler(i.id);
                    }}
                  >
                    <MdOutlineDeleteOutline className="text-xl font-bold" />
                  </button>
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
}

export default AddIncomeModal;
