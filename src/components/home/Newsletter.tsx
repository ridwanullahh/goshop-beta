import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Mail, Send, Sparkles } from 'lucide-react';

/**
 * Newsletter / CTA banner — emerald/amber gradient, email input,
 * shows a sonner toast on submit (no backend required).
 */
export function Newsletter() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = email.trim();
    if (!value) {
      toast.error('Please enter your email address.');
      return;
    }
    // Basic email format check (no dependency needed).
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    if (!ok) {
      toast.error('Please enter a valid email address.');
      return;
    }
    setSubmitting(true);
    // Simulate a quick async submit; the spec says UI-only with toast.
    setTimeout(() => {
      setSubmitting(false);
      setEmail('');
      toast.success('You are subscribed!', {
        description: 'Watch your inbox for exclusive offers and updates.',
      });
    }, 500);
  };

  return (
    <section aria-labelledby="newsletter-heading" className="py-12 sm:py-16">
      <div className="container mx-auto px-4">
        <div
          className="relative isolate overflow-hidden rounded-3xl px-6 py-10 sm:px-12 sm:py-14"
          style={{
            background:
              'radial-gradient(800px 360px at 90% -10%, hsl(32 95% 50% / 0.35), transparent 60%), radial-gradient(700px 400px at -10% 110%, hsl(158 64% 40% / 0.45), transparent 60%), linear-gradient(135deg, hsl(160 50% 14%), hsl(158 60% 22%))',
          }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-overlay"
            style={{
              backgroundImage: 'radial-gradient(hsl(0 0% 100%) 1px, transparent 1px)',
              backgroundSize: '22px 22px',
            }}
          />

          <div className="relative mx-auto flex max-w-2xl flex-col items-center text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-amber-100 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              Exclusive offers, fresh drops
            </span>

            <h2
              id="newsletter-heading"
              className="mt-4 text-2xl font-bold tracking-tight text-white sm:text-3xl"
            >
              Get the best deals, first.
            </h2>
            <p className="mt-2 max-w-md text-sm text-emerald-50/85 sm:text-base">
              Join our newsletter for early access to flash deals, new arrivals,
              and seller stories.
            </p>

            <form
              onSubmit={onSubmit}
              className="mt-6 flex w-full flex-col items-center gap-3 sm:flex-row"
            >
              <div className="relative w-full">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  aria-label="Email address"
                  className="h-12 rounded-full border-0 bg-white pl-12 pr-4 text-base shadow-lg ring-1 ring-black/5 placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-emerald-500"
                />
              </div>
              <Button
                type="submit"
                disabled={submitting}
                size="lg"
                className="h-12 w-full rounded-full bg-accent px-7 text-base font-semibold text-accent-foreground shadow-lg hover:bg-accent/90 sm:w-auto"
              >
                {submitting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-accent-foreground/40 border-t-accent-foreground" />
                    Subscribing…
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Subscribe
                  </>
                )}
              </Button>
            </form>

            <p className="mt-3 text-xs text-emerald-50/70">
              No spam. Unsubscribe anytime. We respect your inbox.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Newsletter;
