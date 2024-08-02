"use client";

import { MdOutlineQueryStats } from "react-icons/md";
import Image from "next/image";
import { useContext } from "react";
import { authContext } from "@/lib/store/auth-context";
import { useCurrency } from "@/lib/store/CurrencyContext"; // Import the currency context
import { currencies } from "@/lib/store/currencies"; // Import the currencies

function Nav() {
  const { user, loading, logout } = useContext(authContext);
  const { currency, setCurrency } = useCurrency(); // Use the currency context

  const handleCurrencyChange = (event) => {
    setCurrency(event.target.value); // Update the selected currency
  };

  const getFirstName = (displayName) => {
    if (!displayName) return "";
    return displayName.split(" ")[0];
  };

  return (
    <header className="container max-w-2xl px-6 py-6 mx-auto">
      {/* PennyTrack_Logo */}
      <div className="flex items-center justify-center py-3">
        <Image
          src="/images/favicon.png"
          alt="logo"
          width={35}
          height={35}
          className="object-cover"
        />
        <Image
          src="/images/pt.png"
          alt="logo"
          width={140}
          height={35}
          className="object-cover"
        />
      </div>
      <div className="flex items-center justify-center">
        <hr className="py-3 w-1/3"></hr>
      </div>

      <div className="flex items-center justify-between">
        {/* User Info */}
        {user && !loading && (
          <div className="flex items-center gap-2">
            <div className="h-[40px] w-[40px] rounded-full overflow-hidden">
              <img
                className="object-cover w-full h-full"
                src={user.photoURL}
                alt={user.displayName}
                referrerPolicy="no-referrer"
              />
            </div>

            <h4>
              <span className="mr-2">Hi,</span>
              <span className="font-bold md:text-sm text-xl">
                {getFirstName(user.displayName)}
              </span>
            </h4>
          </div>
        )}
        {user && !loading && (
          <nav className="flex items-center gap-4">
            <div className="text-2xl">
              <a href="#stats">
                <MdOutlineQueryStats className="hover:scale-110 transition-all duration-200" />
              </a>
            </div>
            <div>
              <button onClick={logout} className="btn btn-danger">
                Logout
              </button>
            </div>
          </nav>
        )}
      </div>

      {/* Currency Selection Dropdown */}
      <div className="mt-4 flex items-center">
        <div className="relative">
          <select
            id="currency-select"
            value={currency}
            onChange={handleCurrencyChange}
            className="block w-20 pl-3 pr-6 py-1 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white appearance-none"
          >
            {currencies.map((curr) => (
              <option
                key={curr.code}
                value={curr.code}
                className="text-gray-900 dark:text-white"
              >
                {curr.code}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Nav;
