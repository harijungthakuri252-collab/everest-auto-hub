import { createContext, useContext, useState, useEffect } from 'react';

export const CURRENCIES = [
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'USD', symbol: '$',  name: 'US Dollar' },
  { code: 'GBP', symbol: '£',  name: 'British Pound' },
  { code: 'EUR', symbol: '€',  name: 'Euro' },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar' },
  { code: 'NPR', symbol: 'Rs.', name: 'Nepalese Rupee' },
  { code: 'INR', symbol: '₹',  name: 'Indian Rupee' },
];

const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(() => {
    const saved = localStorage.getItem('everest_currency');
    return saved ? JSON.parse(saved) : CURRENCIES[0]; // default AUD
  });

  const changeCurrency = (code) => {
    const found = CURRENCIES.find(c => c.code === code);
    if (found) {
      setCurrency(found);
      localStorage.setItem('everest_currency', JSON.stringify(found));
    }
  };

  // Format a price with the selected currency symbol
  const formatPrice = (amount) => {
    if (!amount && amount !== 0) return '';
    return `${currency.symbol}${Number(amount).toLocaleString()}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, changeCurrency, formatPrice, CURRENCIES }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);
