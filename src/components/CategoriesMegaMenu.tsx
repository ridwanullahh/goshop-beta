
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useTranslation } from 'react-i18next';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuTrigger,
  DropdownMenuItem 
} from '@/components/ui/dropdown-menu';
import { Menu, ChevronRight, Grid3X3, ShoppingBag } from 'lucide-react';
import { useCommerce } from '@/context/CommerceContext';
import { Link } from 'react-router-dom';

export function CategoriesMegaMenu() {
  const { t } = useTranslation();
  const { sdk } = useCommerce();
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadCategories() {
      if (!sdk) return;
      
      try {
        const data = await sdk.getCategories();
        setCategories(data);
      } catch (error) {
        console.error('Failed to load categories:', error);
        // Fallback categories for demo
        setCategories([
          { id: '1', name: 'Electronics', slug: 'electronics', description: 'Gadgets and tech devices' },
          { id: '2', name: 'Fashion', slug: 'fashion', description: 'Clothing and accessories' },
          { id: '3', name: 'Home & Garden', slug: 'home-garden', description: 'Home essentials' },
          { id: '4', name: 'Sports', slug: 'sports', description: 'Sports and fitness' },
          { id: '5', name: 'Books', slug: 'books', description: 'Books and media' },
          { id: '6', name: 'Beauty', slug: 'beauty', description: 'Beauty and personal care' }
        ]);
      } finally {
        setIsLoading(false);
      }
    }

    loadCategories();
  }, [sdk]);

  // Desktop Mega Menu
  const MegaMenuDesktop = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="hidden md:flex items-center gap-2">
          <Grid3X3 className="h-4 w-4" />
          {t('categories')}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-96 p-0">
        <div className="grid grid-cols-2 gap-0">
          {categories.map((category) => (
            <DropdownMenuItem key={category.id} asChild className="p-0">
              <Link 
                to={`/categories/${category.slug}`}
                className="flex items-center justify-between p-4 hover:bg-muted transition-colors"
              >
                <div>
                  <h4 className="font-medium">{category.name}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {category.description}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </DropdownMenuItem>
          ))}
        </div>
        <div className="border-t p-4">
          <Link to="/categories">
            <Button variant="ghost" className="w-full justify-start">
              <ShoppingBag className="h-4 w-4 mr-2" />
              {t('view_all_categories')}
            </Button>
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  // Mobile Sheet Menu
  const MegaMenuMobile = () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">{t('categories')}</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {categories.map((category) => (
            <Link 
              key={category.id}
              to={`/categories/${category.slug}`}
              className="flex items-center justify-between p-4 border-b hover:bg-muted transition-colors"
            >
              <div>
                <h4 className="font-medium">{category.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {category.description}
                </p>
              </div>
              <ChevronRight className="h-4 w-4" />
            </Link>
          ))}
          <Link 
            to="/categories"
            className="flex items-center p-4 hover:bg-muted transition-colors"
          >
            <ShoppingBag className="h-4 w-4 mr-3" />
            <span className="font-medium">{t('view_all_categories')}</span>
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );

  return (
    <>
      <MegaMenuDesktop />
      <MegaMenuMobile />
    </>
  );
}
