
import React from 'react';
import { Link } from 'react-router-dom';
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

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product.id!);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  return (
    <Link to={`/products/${product.id}`} className="block">
      <Card className={`group overflow-hidden hover:shadow-lg transition-all duration-300 h-full ${className}`}>
        <div className="relative">
          <img
            src={product.images[0] || '/placeholder.svg'}
            alt={product.name}
            className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-105"
          />
          
          {product.isFeatured && (
            <Badge className="absolute top-2 left-2 bg-secondary text-secondary-foreground text-xs">
              Featured
            </Badge>
          )}
          
          {product.originalPrice && product.originalPrice > product.price && (
            <Badge className="absolute top-2 right-2 bg-destructive text-destructive-foreground text-xs">
              {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
            </Badge>
          )}
          
          <Button
            size="icon"
            variant="ghost"
            className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm hover:bg-background opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              // Add to wishlist functionality
            }}
          >
            <Heart className="h-4 w-4" />
          </Button>
        </div>
        
        <CardContent className="p-3">
          <div className="space-y-2">
            <Badge variant="outline" className="text-xs">
              {product.category}
            </Badge>
            
            <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
              {product.name}
            </h3>
            
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-secondary text-secondary" />
              <span className="text-xs font-medium">{product.rating}</span>
              <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-primary">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-xs text-muted-foreground line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>
            
            <p className="text-xs text-muted-foreground">
              by {product.sellerName}
            </p>
            
            {product.inventory < 10 && product.inventory > 0 && (
              <p className="text-xs text-destructive font-medium">
                Only {product.inventory} left
              </p>
            )}
            
            <Button
              className="w-full mt-2 h-8 text-xs"
              variant="outline"
              onClick={handleAddToCart}
              disabled={product.inventory === 0}
            >
              <ShoppingCart className="h-3 w-3 mr-1" />
              {product.inventory === 0 ? 'Out of Stock' : 'Add to Cart'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
