
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCommerce } from '@/context/CommerceContext';
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
  ArrowLeft,
  ArrowRight,
  Filter,
  Search
} from 'lucide-react';

const SellerDashboard = () => {
  const { currentUser, products, sdk } = useCommerce();
  const [activeView, setActiveView] = useState('overview');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [sellerProducts, setSellerProducts] = useState<Product[]>([]);
  const [sellerOrders, setSellerOrders] = useState<Order[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    inventory: '',
    tags: '',
    images: []
  });

  // Fetch seller data on component mount
  useEffect(() => {
    if (currentUser && sdk) {
      fetchSellerData();
    }
  }, [currentUser, sdk]);

  const fetchSellerData = async () => {
    if (!currentUser || !sdk) return;
    
    setLoading(true);
    try {
      // Fetch seller's products
      const products = await sdk.getSellerProducts(currentUser.id!);
      setSellerProducts(products);

      // Fetch seller's orders
      const orders = await sdk.getOrders(currentUser.id!, 'seller');
      setSellerOrders(orders);

      // Fetch analytics
      const analyticsData = await sdk.getSellerAnalytics(currentUser.id!);
      setAnalytics(analyticsData);

      toast.success('Dashboard data loaded successfully');
    } catch (error) {
      console.error('Error fetching seller data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async () => {
    if (!sdk || !currentUser) return;

    try {
      const productData = {
        ...newProduct,
        price: parseFloat(newProduct.price),
        inventory: parseInt(newProduct.inventory),
        sellerId: currentUser.id!,
        sellerName: currentUser.businessName || currentUser.email,
        tags: newProduct.tags.split(',').map(tag => tag.trim()),
        images: ['/placeholder.svg'] // Default image for now
      };

      await sdk.createProduct(productData);
      toast.success('Product added successfully');
      setNewProduct({ name: '', description: '', price: '', category: '', inventory: '', tags: '', images: [] });
      setShowAddProduct(false);
      fetchSellerData(); // Refresh data
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('Failed to add product');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!sdk) return;

    try {
      await sdk.deleteProduct(productId);
      toast.success('Product deleted successfully');
      fetchSellerData(); // Refresh data
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: Order['status']) => {
    if (!sdk) return;

    try {
      await sdk.updateOrderStatus(orderId, status);
      toast.success('Order status updated successfully');
      fetchSellerData(); // Refresh data
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };

    return (
      <Badge className={statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Mobile Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Seller Dashboard</h1>
          <p className="text-muted-foreground">Manage your store and products</p>
        </div>

        {/* Mobile Navigation */}
        <div className="flex overflow-x-auto space-x-2 mb-6 pb-2">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'products', label: 'Products', icon: Package },
            { id: 'orders', label: 'Orders', icon: ShoppingCart },
            { id: 'analytics', label: 'Analytics', icon: TrendingUp },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map((nav) => {
            const Icon = nav.icon;
            return (
              <Button
                key={nav.id}
                variant={activeView === nav.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveView(nav.id)}
                className="flex items-center space-x-2 whitespace-nowrap"
              >
                <Icon className="h-4 w-4" />
                <span>{nav.label}</span>
              </Button>
            );
          })}
        </div>

        {/* Overview */}
        {activeView === 'overview' && (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${analytics?.totalRevenue?.toFixed(2) || '0.00'}
                  </div>
                  <p className="text-xs text-muted-foreground">Total earnings</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics?.totalOrders || 0}</div>
                  <p className="text-xs text-muted-foreground">Orders received</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Products</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics?.totalProducts || 0}</div>
                  <p className="text-xs text-muted-foreground">Active listings</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${analytics?.averageOrderValue?.toFixed(2) || '0.00'}
                  </div>
                  <p className="text-xs text-muted-foreground">Per order</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Latest customer orders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sellerOrders.slice(0, 5).map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">Order #{order.id}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(order.status)}
                        <p className="text-sm font-medium mt-1">${order.total}</p>
                      </div>
                    </div>
                  ))}
                  {sellerOrders.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No orders yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Products */}
        {activeView === 'products' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Products</h2>
              <Button onClick={() => setShowAddProduct(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </div>

            {showAddProduct && (
              <Card>
                <CardHeader>
                  <CardTitle>Add New Product</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="productName">Product Name</Label>
                      <Input
                        id="productName"
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                        placeholder="Enter product name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="productPrice">Price ($)</Label>
                      <Input
                        id="productPrice"
                        type="number"
                        value={newProduct.price}
                        onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="productDescription">Description</Label>
                    <Textarea
                      id="productDescription"
                      value={newProduct.description}
                      onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                      placeholder="Describe your product..."
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="productCategory">Category</Label>
                      <Input
                        id="productCategory"
                        value={newProduct.category}
                        onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                        placeholder="e.g., Electronics"
                      />
                    </div>
                    <div>
                      <Label htmlFor="productInventory">Inventory</Label>
                      <Input
                        id="productInventory"
                        type="number"
                        value={newProduct.inventory}
                        onChange={(e) => setNewProduct({...newProduct, inventory: e.target.value})}
                        placeholder="Stock quantity"
                      />
                    </div>
                    <div>
                      <Label htmlFor="productTags">Tags (comma separated)</Label>
                      <Input
                        id="productTags"
                        value={newProduct.tags}
                        onChange={(e) => setNewProduct({...newProduct, tags: e.target.value})}
                        placeholder="tag1, tag2, tag3"
                      />
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button onClick={handleAddProduct}>Add Product</Button>
                    <Button variant="outline" onClick={() => setShowAddProduct(false)}>Cancel</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Your Products ({sellerProducts.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sellerProducts.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <img 
                          src={product.images[0] || '/placeholder.svg'} 
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div>
                          <h3 className="font-semibold">{product.name}</h3>
                          <p className="text-sm text-muted-foreground">{product.category}</p>
                          <div className="flex items-center mt-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm ml-1">{product.rating} ({product.reviewCount} reviews)</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">${product.price}</p>
                        <p className="text-sm text-muted-foreground">Stock: {product.inventory}</p>
                        <div className="flex space-x-2 mt-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleDeleteProduct(product.id!)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {sellerProducts.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No products yet. Add your first product!</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Orders */}
        {activeView === 'orders' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Order Management</h2>
            
            <Card>
              <CardHeader>
                <CardTitle>Orders ({sellerOrders.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sellerOrders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold">Order #{order.id}</h3>
                          <p className="text-sm text-muted-foreground">
                            Date: {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          {getStatusBadge(order.status)}
                          <p className="font-semibold mt-2">${order.total}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        {order.products.map((item, index) => (
                          <div key={index} className="flex items-center justify-between py-2 border-t">
                            <div>
                              <p className="font-medium">{item.productName}</p>
                              <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                            </div>
                            <p className="font-medium">${item.subtotal}</p>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex space-x-2">
                        {order.status === 'pending' && (
                          <>
                            <Button 
                              size="sm"
                              onClick={() => handleUpdateOrderStatus(order.id!, 'confirmed')}
                            >
                              Accept Order
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleUpdateOrderStatus(order.id!, 'cancelled')}
                            >
                              Decline
                            </Button>
                          </>
                        )}
                        {order.status === 'confirmed' && (
                          <Button 
                            size="sm"
                            onClick={() => handleUpdateOrderStatus(order.id!, 'processing')}
                          >
                            Mark as Processing
                          </Button>
                        )}
                        {order.status === 'processing' && (
                          <Button 
                            size="sm"
                            onClick={() => handleUpdateOrderStatus(order.id!, 'shipped')}
                          >
                            Mark as Shipped
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  {sellerOrders.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No orders yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Analytics */}
        {activeView === 'analytics' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Analytics</h2>
            
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Total Revenue</span>
                      <span className="font-semibold">${analytics?.totalRevenue?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Average Order Value</span>
                      <span className="font-semibold">${analytics?.averageOrderValue?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Orders</span>
                      <span className="font-semibold">{analytics?.totalOrders || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Product Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Total Products</span>
                      <span className="font-semibold">{analytics?.totalProducts || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Active Products</span>
                      <span className="font-semibold">{analytics?.activeProducts || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg Rating</span>
                      <span className="font-semibold">
                        {sellerProducts.length > 0 
                          ? (sellerProducts.reduce((acc, p) => acc + p.rating, 0) / sellerProducts.length).toFixed(1)
                          : '0.0'
                        }
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Settings */}
        {activeView === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Store Settings</h2>
            
            <Card>
              <CardHeader>
                <CardTitle>Store Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="storeName">Store Name</Label>
                  <Input id="storeName" defaultValue={currentUser?.businessName || "My Store"} />
                </div>
                <div>
                  <Label htmlFor="storeDescription">Store Description</Label>
                  <Textarea id="storeDescription" placeholder="Tell customers about your store..." />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="storeEmail">Contact Email</Label>
                    <Input id="storeEmail" type="email" defaultValue={currentUser?.email} />
                  </div>
                  <div>
                    <Label htmlFor="storePhone">Phone Number</Label>
                    <Input id="storePhone" type="tel" placeholder="+1 (555) 123-4567" />
                  </div>
                </div>
                <Button>Save Settings</Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerDashboard;
