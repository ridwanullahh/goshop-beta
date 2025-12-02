import { useState, useEffect } from 'react';
import { useCommerce } from '@/context/CommerceContext';

export const useFormatPrice = (amount: number, fromCurrency: string = 'USD') => {
  const { sdk, currency: toCurrency, currencies } = useCommerce();
  const [formattedPrice, setFormattedPrice] = useState('');

  useEffect(() => {
    const format = async () => {
      const convertedAmount = await sdk.convertCurrency(amount, fromCurrency, toCurrency);
      const targetCurrency = currencies.find(c => c.code === toCurrency);

      const formatter = new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: toCurrency,
        currencyDisplay: 'symbol'
      });

      if (targetCurrency && formatter.format(convertedAmount).indexOf(targetCurrency.symbol) === -1) {
         setFormattedPrice(`${targetCurrency.symbol}${convertedAmount.toFixed(2)}`);
      } else {
         setFormattedPrice(formatter.format(convertedAmount));
      }
    };

    if (currencies.length > 0) {
      format();
    }
  }, [amount, fromCurrency, toCurrency, sdk, currencies]);

  return formattedPrice;
};
