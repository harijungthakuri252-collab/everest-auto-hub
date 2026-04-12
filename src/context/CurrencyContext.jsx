import { createContext, useContext, useState } from 'react';

export const CURRENCIES = [
  { code: 'AUD', symbol: 'A$',  name: 'Australian Dollar' },
  { code: 'USD', symbol: '$',   name: 'US Dollar' },
  { code: 'GBP', symbol: '\u00a3',   name: 'British Pound' },
  { code: 'EUR', symbol: '\u20ac',   name: 'Euro' },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar' },
  { code: 'NPR', symbol: 'Rs.', name: 'Nepalese Rupee' },
  { code: 'INR', symbol: '\u20b9',   name: 'Indian Rupee' },
];

const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(() => {
    try {
      const saved = localStorage.getItem('everest_currency');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Validate it's a proper currency object
        if (parsed && parsed.code && parsed.symbol && parsed.name) return parsed;
      }
    } catch {}
    return CURRENCIES[0]; // default AUD
  });

  const changeCurrency = (code) => {
    const found = CURRENCIES.find(c => c.code === code);
    if (found) {
      setCurrency(found);
      localStorage.setItem('everest_currency', JSON.stringify(found));
    }
  };

  const formatPrice = (amount) => {
    if (amount === null || amount === undefined || amount === '') return '';
    return `${currency.symbol}${Number(amount).toLocaleString()}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, changeCurrency, formatPrice, CURRENCIES }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);
