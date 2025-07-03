
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useCommerce } from '@/context/CommerceContext';
import { useEnhancedRealTime } from '@/context/EnhancedRealTimeContext';
import { Product, Order } from '@/lib/commerce-sdk';
import { toast } from 'sonner';
import { 
  Store, 
  Package, 
  DollarSign, 
  TrendingUp, 
  ShoppingCart,
  Star,
  Users,
  Plus,
  Eye,
  Edit,
  Trash2,
  BarChart3,
  Settings,
  Upload,
  Image as ImageIcon,
  Save,
  X,
  Search,
  Filter,
  ArrowUpDown,
  Calendar,
  Target,
  Zap,
  Award,
  MessageSquare,
  AlertTriangle
} from 'lucide-react';

export default function EnhancedSellerDashboard() {
  const { currentUser, sdk } = useCommerce();
  const { subscribe, forceRefresh, updateCollection } = useEnhancedRealTime();
  const [activeView, setActiveView] = useState('home');
  const [loading, setLoading] = useState(true);
  const [sellerData, setSellerData] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    category: '',
    inventory: '',
    tags: '',
    images: [] as string[],
    isFeatured: false,
    isActive: true,
    sku: '',
    weight: '',
    dimensions: '',
    shippingClass: 'standard',
    seoTitle: '',
    seoDescription: '',
    metaKeywords: ''
  });

  useEffect(() => {
    if (currentUser && sdk) {
      initializeDashboard();
    }
  }, [currentUser, sdk]);

  const initializeDashboard = async () => {
    setLoading(true);
    try {
      // Subscribe to real-time updates
      subscribe('products', (data) => {
        console.log('Products updated:', data);
        if (Array.isArray(data)) {
          const sellerProducts = data.filter(p => p.sellerId === currentUser?.id);
          setProducts(sellerProducts);
        }
      });

      subscribe('orders', (data) => {
        console.log('Orders updated:', data);
        if (Array.isArray(data)) {
          const sellerOrders = data.filter(o => o.sellerId === currentUser?.id);
          setOrders(sellerOrders);
        }
      });

      await fetchSellerData();
      await forceRefresh(['products', 'orders']);
    } catch (error) {
      console.error('Error initializing seller dashboard:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchSellerData = async () => {
    if (!currentUser || !sdk) return;
    
    try {
      const [productsData, ordersData, analyticsData] = await Promise.all([
        sdk.getSellerProducts(currentUser.id),
        sdk.getOrders(currentUser.id),
        sdk.getSellerAnalytics(currentUser.id)
      ]);

      setProducts(productsData);
      setOrders(ordersData);

      // Enhanced analytics calculation
      const totalRevenue = ordersData.reduce((sum: number, order: any) => sum + order.total, 0);
      const totalOrders = ordersData.length;
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      const activeProducts = productsData.filter(p => p.isActive && p.inventory > 0).length;
      const lowStockProducts = productsData.filter(p => p.inventory < 10).length;

      setSellerData({
        ...analyticsData,
        totalRevenue,
        totalOrders,
        averageOrderValue,
        totalProducts: productsData.length,
        activeProducts,
        lowStockProducts,
        conversionRate: totalOrders > 0 ? (totalRevenue / totalOrders * 100).toFixed(2) : 0,
        topSellingProduct: productsData.sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0))[0]
      });
    } catch (error) {
      console.error('Error fetching seller data:', error);
    }
  };

  const handleCreateProduct = async () => {
    if (!sdk || !currentUser) return;

    try {
      const productData = {
        ...productForm,
        price: parseFloat(productForm.price),
        originalPrice: productForm.originalPrice ? parseFloat(productForm.originalPrice) : undefined,
        inventory: parseInt(productForm.inventory),
        weight: productForm.weight ? parseFloat(productForm.weight) : undefined,
        sellerId: currentUser.id!,
        sellerName: currentUser.businessName || currentUser.email,
        tags: productForm.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const newProduct = await sdk.createProduct(productData);
      
      // Update local state immediately for real-time effect
      setProducts(prev => [newProduct, ...prev]);
      updateCollection('products', [newProduct, ...products]);
      
      toast.success('Product created successfully');
      resetProductForm();
      setShowProductForm(false);
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error('Failed to create product');
    }
  };

  const handleUpdateProduct = async () => {
    if (!sdk || !editingProduct) return;

    try {
      const productData = {
        ...productForm,
        id: editingProduct.id,
        price: parseFloat(productForm.price),
        originalPrice: productForm.originalPrice ? parseFloat(productForm.originalPrice) : undefined,
        inventory: parseInt(productForm.inventory),
        weight: productForm.weight ? parseFloat(productForm.weight) : undefined,
        tags: productForm.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        updatedAt: new Date().toISOString()
      };

      const updatedProduct = await sdk.updateProduct(editingProduct.id!, productData);
      
      // Update local state immediately
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? updatedProduct : p));
      updateCollection('products', products.map(p => p.id === editingProduct.id ? updatedProduct : p));
      
      toast.success('Product updated successfully');
      resetProductForm();
      setEditingProduct(null);
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!sdk) return;

    try {
      await sdk.deleteProduct(productId);
      
      // Update local state immediately
      setProducts(prev => prev.filter(p => p.id !== productId));
      updateCollection('products', products.filter(p => p.id !== productId));
      
      toast.success('Product deleted successfully');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      originalPrice: product.originalPrice?.toString() || '',
      category: product.category,
      inventory: product.inventory.toString(),
      tags: product.tags?.join(', ') || '',
      images: product.images || [],
      isFeatured: product.isFeatured || false,
      isActive: product.isActive !== false,
      sku: product.sku || '',
      weight: product.weight?.toString() || '',
      dimensions: product.dimensions || '',
      shippingClass: product.shippingClass || 'standard',
      seoTitle: product.seoTitle || '',
      seoDescription: product.seoDescription || '',
      metaKeywords: product.metaKeywords || ''
    });
    setShowProductForm(true);
  };

  const resetProductForm = () => {
    setProductForm({
      name: '',
      description: '',
      price: '',
      originalPrice: '',
      category: '',
      inventory: '',
      tags: '',
      images: [],
      isFeatured: false,
      isActive: true,
      sku: '',
      weight: '',
      dimensions: '',
      shippingClass: 'standard',
      seoTitle: '',
      seoDescription: '',
      metaKeywords: ''
    });
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'active' && product.isActive && product.inventory > 0) ||
                         (filterStatus === 'inactive' && (!product.isActive || product.inventory === 0)) ||
                         (filterStatus === 'low-stock' && product.inventory < 10);
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading seller dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile-First Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">Seller Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                {currentUser?.businessName || 'My Store'}
              </p>
            </div>
            <Button 
              onClick={() => setShowProductForm(true)}
              size="sm"
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Product
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Enhanced KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700 dark:text-green-300">Revenue</p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                    ${sellerData?.totalRevenue?.toFixed(2) || '0.00'}
                  </p>
                  <p className="text-xs text-green-600">+12% from last month</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Orders</p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {sellerData?.totalOrders || 0}
                  </p>
                  <p className="text-xs text-blue-600">+5 this week</p>
                </div>
                <ShoppingCart className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Products</p>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                    {sellerData?.totalProducts || 0}
                  </p>
                  <p className="text-xs text-purple-600">{sellerData?.activeProducts || 0} active</p>
                </div>
                <Package className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-700 dark:text-orange-300">Conversion</p>
                  <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                    {sellerData?.conversionRate || 0}%
                  </p>
                  <p className="text-xs text-orange-600">avg order value</p>
                </div>
                <Target className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alert Cards */}
        {sellerData?.lowStockProducts > 0 && (
          <Card className="border-orange-200 bg-orange-50 dark:bg-orange-900/10">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="font-medium text-orange-800 dark:text-orange-200">
                    Low Stock Alert
                  </p>
                  <p className="text-sm text-orange-600 dark:text-orange-300">
                    {sellerData.lowStockProducts} products have low inventory
                  </p>
                </div>
                <Button variant="outline" size="sm" className="ml-auto">
                  View Products
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Product Management Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Product Management</CardTitle>
                <CardDescription>
                  Manage your product catalog with advanced features
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="low-stock">Low Stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <img 
                        src={product.images[0] || '/placeholder.svg'} 
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      {product.inventory < 10 && (
                        <Badge className="absolute -top-2 -right-2 bg-orange-500 text-xs">
                          Low
                        </Badge>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold">{product.name}</h3>
                        <Badge variant={product.isActive ? "default" : "secondary"}>
                          {product.isActive ? "Active" : "Inactive"}
                        </Badge>
                        {product.isFeatured && (
                          <Badge variant="outline" className="text-yellow-600 border-yellow-300">
                            Featured
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{product.category}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-sm font-medium">${product.price}</span>
                        <span className="text-sm text-muted-foreground">Stock: {product.inventory}</span>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm ml-1">{product.rating || 0} ({product.reviewCount || 0})</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="ghost" onClick={() => handleEditProduct(product)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => handleDeleteProduct(product.id!)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {filteredProducts.length === 0 && (
                <div className="text-center py-12">
                  <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-lg font-medium mb-2">No products found</p>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery || filterStatus !== 'all' 
                      ? 'Try adjusting your search or filter criteria'
                      : 'Add your first product to get started'
                    }
                  </p>
                  {!searchQuery && filterStatus === 'all' && (
                    <Button onClick={() => setShowProductForm(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Product
                    </Button>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Product Form Modal */}
      {showProductForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => {
                    setShowProductForm(false);
                    setEditingProduct(null);
                    resetProductForm();
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="productName">Product Name *</Label>
                    <Input
                      id="productName"
                      value={productForm.name}
                      onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                      placeholder="Enter product name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="sku">SKU</Label>
                    <Input
                      id="sku"
                      value={productForm.sku}
                      onChange={(e) => setProductForm({...productForm, sku: e.target.value})}
                      placeholder="Product SKU"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={productForm.description}
                    onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                    placeholder="Detailed product description..."
                    rows={4}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select 
                    value={productForm.category}
                    onValueChange={(value) => setProductForm({...productForm, category: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="electronics">Electronics</SelectItem>
                      <SelectItem value="clothing">Clothing</SelectItem>
                      <SelectItem value="home">Home & Garden</SelectItem>
                      <SelectItem value="books">Books</SelectItem>
                      <SelectItem value="sports">Sports & Outdoors</SelectItem>
                      <SelectItem value="health">Health & Beauty</SelectItem>
                      <SelectItem value="automotive">Automotive</SelectItem>
                      <SelectItem value="toys">Toys & Games</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Pricing & Inventory */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Pricing & Inventory</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="price">Price ($) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={productForm.price}
                      onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="originalPrice">Original Price ($)</Label>
                    <Input
                      id="originalPrice"
                      type="number"
                      step="0.01"
                      value={productForm.originalPrice}
                      onChange={(e) => setProductForm({...productForm, originalPrice: e.target.value})}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="inventory">Inventory *</Label>
                    <Input
                      id="inventory"
                      type="number"
                      value={productForm.inventory}
                      onChange={(e) => setProductForm({...productForm, inventory: e.target.value})}
                      placeholder="Stock quantity"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Product Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Product Settings</h3>
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isActive"
                      checked={productForm.isActive}
                      onCheckedChange={(checked) => setProductForm({...productForm, isActive: checked})}
                    />
                    <Label htmlFor="isActive">Active</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isFeatured"
                      checked={productForm.isFeatured}
                      onCheckedChange={(checked) => setProductForm({...productForm, isFeatured: checked})}
                    />
                    <Label htmlFor="isFeatured">Featured</Label>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="tags">Tags (comma separated)</Label>
                  <Input
                    id="tags"
                    value={productForm.tags}
                    onChange={(e) => setProductForm({...productForm, tags: e.target.value})}
                    placeholder="tag1, tag2, tag3"
                  />
                </div>
              </div>

              {/* SEO Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">SEO Settings</h3>
                <div>
                  <Label htmlFor="seoTitle">SEO Title</Label>
                  <Input
                    id="seoTitle"
                    value={productForm.seoTitle}
                    onChange={(e) => setProductForm({...productForm, seoTitle: e.target.value})}
                    placeholder="SEO optimized title"
                  />
                </div>
                <div>
                  <Label htmlFor="seoDescription">SEO Description</Label>
                  <Textarea
                    id="seoDescription"
                    value={productForm.seoDescription}
                    onChange={(e) => setProductForm({...productForm, seoDescription: e.target.value})}
                    placeholder="SEO meta description"
                    rows={2}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-2 pt-6 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowProductForm(false);
                    setEditingProduct(null);
                    resetProductForm();
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={editingProduct ? handleUpdateProduct : handleCreateProduct}
                  disabled={!productForm.name || !productForm.price || !productForm.inventory}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
