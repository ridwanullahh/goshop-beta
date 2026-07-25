import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Truck, ShieldCheck, BadgeCheck, RotateCcw } from 'lucide-react';

const VALUE_PROPS = [
  {
    icon: Truck,
    title: 'Free & fast shipping',
    description: 'Free shipping on eligible orders with speedy, tracked delivery worldwide.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure payments',
    description: 'Bank-grade encryption and trusted payment gateways protect every transaction.',
  },
  {
    icon: BadgeCheck,
    title: 'Verified sellers',
    description: 'Every seller is vetted so you can shop with total confidence and peace of mind.',
  },
  {
    icon: RotateCcw,
    title: 'Easy returns',
    description: 'Hassle-free returns within the return window — no questions, no friction.',
  },
];

/**
 * Value propositions: 4 clean cards with Lucide icons.
 */
export function ValueProps() {
  return (
    <section aria-labelledby="value-props-heading" className="py-12 sm:py-16">
      <div className="container mx-auto px-4">
        <h2 id="value-props-heading" className="sr-only">
          Why shop with us
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {VALUE_PROPS.map((vp) => (
            <Card
              key={vp.title}
              className="group h-full border-border/70 bg-card shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
            >
              <CardContent className="flex h-full flex-col gap-3 p-5 sm:p-6">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <vp.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">{vp.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{vp.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ValueProps;
