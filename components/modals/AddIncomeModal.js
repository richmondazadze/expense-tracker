import { useRef, useEffect, useContext } from "react";

import { currencyFormatter } from "@/lib/utlis";

import { MdOutlineDeleteOutline } from "react-icons/md";

import Modal from "../modal";
import { financeContext } from "@/lib/store/finance-context";

function AddIncomeModal({ show, onClose }) {
  const amountRef = useRef();
  const descriptionRef = useRef();

  const { income, addIncomeItem, removeIncomeItem } =
    useContext(financeContext);

  const addIncomeHandler = async (e) => {
    e.preventDefault();
    const newIncome = {
      amount: +amountRef.current.value,
      description: descriptionRef.current.value,
      createdAt: new Date(),
    };

    try {
      addIncomeItem(newIncome);
      descriptionRef.current.value = "";
      amountRef.current.value = "";
    } catch (error) {
      console.log(error.message);
    }
  };

  const deleteIncomeEntryHandler = async (incomeId) => {
    try {
      removeIncomeItem(incomeId);
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

        <div className="flex flex-col gap-4 py-6">
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
        {income.map((i) => {
          return (
            <div className="flex item-center justify-between" key={i.id}>
              <div>
                <p className="font-semibold">{i.description}</p>
                <small className="text-xs">{i.createdAt.toISOString()}</small>
              </div>

              <p className="flex items-center gap-4">
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
    </Modal>
  );
}

export default AddIncomeModal;
