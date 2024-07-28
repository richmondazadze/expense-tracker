"use client";

import { currencyFormatter } from "@/lib/utlis";

import ExpenseCategoryItem from "@/components/ExpenseCategoryItem";

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

const DUMMY_DATA = [
  { id: 1, title: "Food", color: "#097", amount: 200 },
  { id: 1, title: "Gas", color: "#bf3", amount: 150 },
  { id: 1, title: "Meds", color: "#fff", amount: 600 },
  { id: 1, title: "Movies", color: "#045", amount: 600 },
];

export default function Home() {
  return (
    <main className="container max-w-2xl px-6 mx-auto">
      <section className="py-3">
        <small className="text-gray-400 text-xl">My Balance</small>
        <h2 className="text-4xl font-bold">{currencyFormatter(100000)}</h2>
      </section>

      <section className="flex items-center gap-2 py-3">
        <button className="btn btn-primary">+ Expenses</button>
        <button className="btn btn-primary-outline">+ Income</button>
      </section>

      {/* {Expenses} */}
      <section className="py-6">
        <h3 className="text-2xl">My Expenses</h3>
        <div className="flex flex-col gap-6 mt-7">
          {DUMMY_DATA.map((expense) => {
            return (
              <ExpenseCategoryItem
                color={expense.color}
                title={expense.title}
                amount={expense.amount}
              />
            );
          })}
        </div>
      </section>

      {/* Chart */}
      <section className="py-6">
        <h3 className="text-2xl">Stats</h3>
        <div className="w-1/2 mx-auto">
          <Doughnut
            data={{
              labels: DUMMY_DATA.map((expense) => expense.title),
              datasets: [
                {
                  label: "Expenses",
                  data: DUMMY_DATA.map((expense) => expense.amount),
                  backgroundColor: DUMMY_DATA.map((expense) => expense.color),
                  borderColor: ["#18b318"],
                  borderWidth: 5,
                },
              ],
            }}
          />
        </div>
      </section>
    </main>
  );
}
