
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { useTranslation } from 'react-i18next';
import { ShoppingCart, Plus, Minus, Trash2, CreditCard } from 'lucide-react';
import { useCommerce } from '@/context/CommerceContext';
import { Link } from 'react-router-dom';
import { useFormatPrice } from '@/hooks/useFormatPrice';

interface CartSidebarProps {
  children: React.ReactNode;
}

export function CartSidebar({ children }: CartSidebarProps) {
  const { t } = useTranslation();
  const { cart, products, removeFromCart, currentUser } = useCommerce();

  const cartItems = cart?.items?.map(item => {
    const product = products.find(p => p.id === item.productId);
    return product ? { ...item, product } : null;
  }).filter(Boolean) || [];

  const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const shipping = subtotal > 50 ? 0 : 9.99;
  const total = subtotal + shipping;

  const formattedSubtotal = useFormatPrice(subtotal);
  const formattedShipping = useFormatPrice(shipping);
  const formattedTotal = useFormatPrice(total);
  const formattedItemPrice = (price: number) => useFormatPrice(price);
  const formattedFreeShippingThreshold = useFormatPrice(50 - subtotal);

  return (
    <Drawer direction="right">
      <DrawerTrigger asChild>
        {children}
      </DrawerTrigger>
      <DrawerContent className="h-full w-full max-w-md ml-auto">
        <DrawerHeader className="border-b">
          <DrawerTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            {t('shopping_cart')} ({cartItems.length})
          </DrawerTitle>
        </DrawerHeader>
        
        <div className="flex flex-col h-full">
          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {!currentUser ? (
              <div className="text-center py-8">
                <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="font-semibold mb-2">{t('signin_to_view_cart_sidebar')}</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {t('cart_items_will_be_saved')}
                </p>
                <Link to="/login">
                  <Button>{t('sign_in')}</Button>
                </Link>
              </div>
            ) : cartItems.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="font-semibold mb-2">{t('your_cart_is_empty')}</h3>
                <p className="text-muted-foreground text-sm">
                  {t('empty_cart_desc_sidebar')}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.productId} className="flex gap-3 p-3 border rounded-lg">
                    <img
                      src={item.product.images[0] || '/placeholder.svg'}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm line-clamp-2">
                        {item.product.name}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {formattedItemPrice(item.product.price)}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1">
                          <Button size="icon" variant="outline" className="h-6 w-6">
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="px-2 text-sm">{item.quantity}</span>
                          <Button size="icon" variant="outline" className="h-6 w-6">
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => removeFromCart(item.productId)}
                          className="h-6 w-6 text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cart Summary */}
          {currentUser && cartItems.length > 0 && (
            <div className="border-t p-4 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{t('subtotal')}</span>
                  <span>{formattedSubtotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>{t('shipping')}</span>
                  <span>
                    {shipping === 0 ? (
                      <Badge variant="secondary">{t('free')}</Badge>
                    ) : (
                      formattedShipping
                    )}
                  </span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between font-semibold">
                    <span>{t('total')}</span>
                    <span>{formattedTotal}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Button className="w-full" size="lg">
                  <CreditCard className="h-4 w-4 mr-2" />
                  {t('checkout')}
                </Button>
                <Link to="/cart" className="block">
                  <Button variant="outline" className="w-full">
                    {t('view_full_cart')}
                  </Button>
                </Link>
              </div>

              {shipping > 0 && (
                <div className="text-xs text-muted-foreground text-center p-2 bg-muted rounded">
                  {t('free_shipping_add_more_sidebar', { amount: formattedFreeShippingThreshold })}
                </div>
              )}
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
