
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useCommerce } from '@/context/CommerceContext';
import { 
  Users, 
  Store, 
  DollarSign, 
  TrendingUp, 
  ShoppingCart,
  AlertTriangle,
  Settings,
  Shield,
  BarChart3,
  Search,
  Filter,
  Eye,
  Ban,
  CheckCircle
} from 'lucide-react';

const AdminDashboard = () => {
  const { products } = useCommerce();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock admin data - in production, this would come from your SDK
  const mockPlatformStats = {
    totalUsers: 15420,
    totalSellers: 1250,
    totalRevenue: 2450000,
    totalOrders: 45670,
    monthlyGrowth: 12.5,
    activeDisputes: 8,
    pendingReviews: 23
  };

  const mockUsers = [
    {
      id: '1',
      name: 'Ahmad Khan',
      email: 'ahmad@example.com',
      role: 'buyer',
      status: 'active',
      joinDate: '2024-01-15',
      orders: 12,
      spent: 1250.00
    },
    {
      id: '2',
      name: 'Fatima Store',
      email: 'fatima@store.com',
      role: 'seller',
      status: 'active',
      joinDate: '2024-01-10',
      orders: 45,
      revenue: 8750.00
    },
    {
      id: '3',
      name: 'Omar Electronics',
      email: 'omar@electronics.com',
      role: 'seller',
      status: 'pending',
      joinDate: '2024-01-20',
      orders: 0,
      revenue: 0
    }
  ];

  const mockDisputes = [
    {
      id: '1',
      orderId: 'CO-2024-001',
      buyer: 'Ahmad Khan',
      seller: 'TechCorp',
      reason: 'Product not as described',
      status: 'open',
      date: '2024-01-18',
      amount: 299.99
    },
    {
      id: '2',
      orderId: 'CO-2024-002',
      buyer: 'Sarah Ali',
      seller: 'FitTech',
      reason: 'Delayed shipping',
      status: 'resolved',
      date: '2024-01-16',
      amount: 199.99
    }
  ];

  const getStatusBadge = (status: string) => {
    const statusColors = {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      suspended: 'bg-red-100 text-red-800',
      open: 'bg-red-100 text-red-800',
      resolved: 'bg-green-100 text-green-800',
      investigating: 'bg-blue-100 text-blue-800'
    };

    return (
      <Badge className={statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const filteredUsers = mockUsers.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">Platform management and analytics</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger value="sellers" className="flex items-center space-x-2">
              <Store className="h-4 w-4" />
              <span className="hidden sm:inline">Sellers</span>
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center space-x-2">
              <ShoppingCart className="h-4 w-4" />
              <span className="hidden sm:inline">Products</span>
            </TabsTrigger>
            <TabsTrigger value="disputes" className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4" />
              <span className="hidden sm:inline">Disputes</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mockPlatformStats.totalUsers.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">+{mockPlatformStats.monthlyGrowth}% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Sellers</CardTitle>
                  <Store className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mockPlatformStats.totalSellers.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Platform merchants</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Platform Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${(mockPlatformStats.totalRevenue / 1000000).toFixed(1)}M</div>
                  <p className="text-xs text-muted-foreground">Total GMV</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mockPlatformStats.totalOrders.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">All-time orders</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Health</CardTitle>
                  <CardDescription>Key metrics and alerts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <AlertTriangle className="h-5 w-5 text-orange-500" />
                        <div>
                          <p className="font-medium">Active Disputes</p>
                          <p className="text-sm text-muted-foreground">Require attention</p>
                        </div>
                      </div>
                      <Badge variant="destructive">{mockPlatformStats.activeDisputes}</Badge>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Shield className="h-5 w-5 text-blue-500" />
                        <div>
                          <p className="font-medium">Pending Reviews</p>
                          <p className="text-sm text-muted-foreground">Content moderation</p>
                        </div>
                      </div>
                      <Badge variant="secondary">{mockPlatformStats.pendingReviews}</Badge>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <TrendingUp className="h-5 w-5 text-green-500" />
                        <div>
                          <p className="font-medium">Growth Rate</p>
                          <p className="text-sm text-muted-foreground">Monthly user growth</p>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-800">+{mockPlatformStats.monthlyGrowth}%</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest platform events</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3 p-4 border rounded-lg">
                      <Users className="h-5 w-5 text-blue-500 mt-1" />
                      <div>
                        <p className="font-medium">New seller registered</p>
                        <p className="text-sm text-muted-foreground">Omar Electronics joined the platform</p>
                        <p className="text-xs text-muted-foreground">2 hours ago</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 p-4 border rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-orange-500 mt-1" />
                      <div>
                        <p className="font-medium">Dispute opened</p>
                        <p className="text-sm text-muted-foreground">Order CO-2024-001 - Product not as described</p>
                        <p className="text-xs text-muted-foreground">4 hours ago</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 p-4 border rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-1" />
                      <div>
                        <p className="font-medium">Product approved</p>
                        <p className="text-sm text-muted-foreground">Wireless Headphones Pro cleared moderation</p>
                        <p className="text-xs text-muted-foreground">6 hours ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">User Management</h2>
                <p className="text-muted-foreground">Manage platform users and their accounts</p>
              </div>
              <div className="flex space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>All Users</CardTitle>
                <CardDescription>Platform users and their activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{user.name}</h3>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline">{user.role}</Badge>
                            {getStatusBadge(user.status)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {user.role === 'buyer' ? `${user.orders} orders` : `${user.orders} sales`}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          ${user.role === 'buyer' ? user.spent.toFixed(2) : user.revenue.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">Joined {user.joinDate}</p>
                        <div className="flex space-x-2 mt-3">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Ban className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sellers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Seller Management</CardTitle>
                <CardDescription>Monitor and manage seller accounts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockUsers.filter(user => user.role === 'seller').map((seller) => (
                    <div key={seller.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <Store className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{seller.name}</h3>
                          <p className="text-sm text-muted-foreground">{seller.email}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            {getStatusBadge(seller.status)}
                            <span className="text-xs text-muted-foreground">Since {seller.joinDate}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${seller.revenue.toFixed(2)} revenue</p>
                        <p className="text-sm text-muted-foreground">{seller.orders} orders</p>
                        <div className="flex space-x-2 mt-3">
                          <Button size="sm" variant="outline">View Store</Button>
                          {seller.status === 'pending' && (
                            <>
                              <Button size="sm">Approve</Button>
                              <Button size="sm" variant="outline">Reject</Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Moderation</CardTitle>
                <CardDescription>Review and moderate product listings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {products.slice(0, 5).map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <img 
                          src={product.images[0]} 
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div>
                          <h3 className="font-semibold">{product.name}</h3>
                          <p className="text-sm text-muted-foreground">by {product.sellerName}</p>
                          <p className="text-sm text-muted-foreground">{product.category} • ${product.price}</p>
                          <Badge className="mt-1 bg-green-100 text-green-800">Active</Badge>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Ban className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="disputes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Dispute Resolution</CardTitle>
                <CardDescription>Manage customer disputes and conflicts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockDisputes.map((dispute) => (
                    <div key={dispute.id} className="border rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold">Order {dispute.orderId}</h3>
                          <p className="text-sm text-muted-foreground">
                            {dispute.buyer} vs {dispute.seller}
                          </p>
                          <p className="text-sm text-muted-foreground">Filed on {dispute.date}</p>
                        </div>
                        <div className="text-right">
                          {getStatusBadge(dispute.status)}
                          <p className="font-semibold mt-2">${dispute.amount}</p>
                        </div>
                      </div>
                      
                      <div className="bg-muted/50 p-4 rounded-lg mb-4">
                        <p className="font-medium">Reason:</p>
                        <p className="text-sm">{dispute.reason}</p>
                      </div>
                      
                      <div className="flex space-x-2">
                        {dispute.status === 'open' && (
                          <>
                            <Button size="sm">Investigate</Button>
                            <Button size="sm" variant="outline">Contact Buyer</Button>
                            <Button size="sm" variant="outline">Contact Seller</Button>
                          </>
                        )}
                        <Button size="sm" variant="outline">View Details</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Settings</CardTitle>
                <CardDescription>Configure platform-wide settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-4">Commission Settings</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Platform Fee (%)</label>
                      <Input type="number" defaultValue="5" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Payment Processing Fee (%)</label>
                      <Input type="number" defaultValue="2.9" />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-4">Content Moderation</h3>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked />
                      <span className="text-sm">Auto-moderate product listings</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked />
                      <span className="text-sm">Review seller applications</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" />
                      <span className="text-sm">Enable AI content filtering</span>
                    </label>
                  </div>
                </div>

                <Button>Save Settings</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
