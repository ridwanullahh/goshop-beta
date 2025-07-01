import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/lib/commerce-sdk';
import { useCommerce } from '@/context/CommerceContext';
import { Heart, ShoppingCart, Star } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { addToCart } = useCommerce();

  const handleAddToCart = () => {
    addToCart(product.id!);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  return (
    <Card className={`group overflow-hidden hover:shadow-card transition-all duration-300 ${className}`}>
      <div className="relative">
        <img
          src={product.images[0] || '/placeholder.svg'}
          alt={product.name}
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
        />
        
        {/* Featured badge */}
        {product.isFeatured && (
          <Badge className="absolute top-2 left-2 bg-secondary text-secondary-foreground">
            Featured
          </Badge>
        )}
        
        {/* Discount badge */}
        {product.originalPrice && product.originalPrice > product.price && (
          <Badge className="absolute top-2 right-2 bg-destructive text-destructive-foreground">
            {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
          </Badge>
        )}
        
        {/* Quick actions */}
        <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button
            size="icon"
            variant="ghost"
            className="bg-background/80 backdrop-blur-sm hover:bg-background"
          >
            <Heart className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="space-y-2">
          {/* Category */}
          <Badge variant="outline" className="text-xs">
            {product.category}
          </Badge>
          
          {/* Product name */}
          <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          
          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2">
            {product.description}
          </p>
          
          {/* Rating */}
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-secondary text-secondary" />
            <span className="text-sm font-medium">{product.rating}</span>
            <span className="text-sm text-muted-foreground">({product.reviewCount})</span>
          </div>
          
          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-primary">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
          
          {/* Seller info */}
          <p className="text-xs text-muted-foreground">
            Sold by <span className="font-medium">{product.sellerName}</span>
          </p>
          
          {/* Stock indicator */}
          {product.inventory < 10 && product.inventory > 0 && (
            <p className="text-xs text-destructive font-medium">
              Only {product.inventory} left in stock
            </p>
          )}
          
          {product.inventory === 0 && (
            <p className="text-xs text-destructive font-medium">Out of stock</p>
          )}
          
          {/* Add to cart button */}
          <Button
            className="w-full mt-4"
            variant="cart"
            onClick={handleAddToCart}
            disabled={product.inventory === 0}
          >
            <ShoppingCart className="h-4 w-4" />
            {product.inventory === 0 ? 'Out of Stock' : 'Add to Cart'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}