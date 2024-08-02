// utils.js
import { useCurrency } from './store/CurrencyContext';

export const currencyFormatter = (amount) => {
  const { currency } = useCurrency();
  const formatter = new Intl.NumberFormat("en-US", {
    currency: currency,
    style: "currency",
  });

  let formattedAmount = formatter.format(amount);
  
  // Add space after the currency symbol
  formattedAmount = formattedAmount.replace(/^(\D+)/, '$1 ');

  return formattedAmount;
};