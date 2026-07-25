import React from 'react';
import { useCommerce } from '@/context/CommerceContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Check, Banknote } from 'lucide-react';

export function CurrencySelector() {
  const { currency, setCurrency, currencies, isLoading } = useCommerce();

  if (isLoading) {
    return (
      <Button variant="outline" size="sm" className="flex items-center gap-2" disabled>
        <Banknote className="h-4 w-4" />
        <span className="hidden sm:inline">Loading...</span>
      </Button>
    );
  }

  if (!currencies || currencies.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-1.5 px-2 h-9">
          <Banknote className="h-4 w-4" />
          <span className="text-xs font-medium">{currency.symbol} {currency.code}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 max-h-80 overflow-y-auto">
        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
          Select Currency
        </div>
        {currencies.map((curr) => (
          <DropdownMenuItem
            key={curr.code}
            onSelect={() => setCurrency(curr.code)}
            className="flex items-center justify-between gap-2 px-2 py-2"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold w-8 text-center">{curr.symbol}</span>
              <div className="flex flex-col">
                <span className="text-sm font-medium leading-tight">{curr.name}</span>
                <span className="text-xs text-muted-foreground leading-tight">{curr.code}</span>
              </div>
            </div>
            {currency.code === curr.code && <Check className="h-4 w-4 text-primary shrink-0" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
