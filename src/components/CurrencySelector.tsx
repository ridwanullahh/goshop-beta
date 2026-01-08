import React from 'react';
import { useCommerce } from '@/context/CommerceContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Check } from 'lucide-react';

export function CurrencySelector() {
  const { currency, setCurrency, currencies } = useCommerce();

  if (!currencies || currencies.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <span>{currency.code} ({currency.symbol})</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {currencies.map((curr) => (
          <DropdownMenuItem
            key={curr.code}
            onSelect={() => setCurrency(curr.code)}
            className="flex items-center justify-between"
          >
            <span>{curr.name} ({curr.code})</span>
            {currency.code === curr.code && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
