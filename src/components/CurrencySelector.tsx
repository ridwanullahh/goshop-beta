import React from 'react';
import { useCommerce } from '@/context/CommerceContext';

export const CurrencySelector = () => {
  const { currency, setCurrency, currencies } = useCommerce();

  if (!currencies || currencies.length === 0) return null;

  return (
    <div className="flex items-center">
      <select
        value={currency}
        onChange={(e) => setCurrency(e.target.value)}
        className="bg-transparent text-sm text-muted-foreground hover:text-foreground focus:outline-none"
      >
        {currencies.map((curr) => (
          <option key={curr.code} value={curr.code} className="bg-background text-foreground">
            {curr.code} ({curr.symbol})
          </option>
        ))}
      </select>
    </div>
  );
};
