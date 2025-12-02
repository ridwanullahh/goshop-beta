
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCommerce } from '@/context/CommerceContext';
import { toast } from 'sonner';
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
  CheckCircle,
  Edit,
  Trash2,
  Plus,
  FileText,
  MessageSquare,
  Star,
  Package,
  Percent,
  Download,
  RefreshCw
} from 'lucide-react';

const AdminDashboard = () => {
  const { currentUser, sdk } = useCommerce();
  const [activeSection, setActiveSection] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // State for different admin sections
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [affiliates, setAffiliates] = useState([]);
  const [stores, setStores] = useState([]);
  const [helpArticles, setHelpArticles] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  // Modal states
  const [showCreateArticle, setShowCreateArticle] = useState(false);
  const [showCreateBlog, setShowCreateBlog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Form states
  const [articleForm, setArticleForm] = useState({
    title: '',
    content: '',
    category: '',
    slug: '',
    isPublished: false
  });

  const [blogForm, setBlogForm] = useState({
    title: '',
    content: '',
    excerpt: '',
    slug: '',
    category: '',
    tags: '',
    featuredImage: '',
    isPublished: false
  });

  useEffect(() => {
    if (currentUser && sdk) {
      fetchAdminData();
    }
  }, [currentUser, sdk]);

  const fetchAdminData = async () => {
    if (!sdk) return;
    
    setLoading(true);
    try {
      const [
        usersData,
        productsData,
        ordersData,
        sellersData,
        affiliatesData,
        storesData,
        helpArticlesData,
        blogsData,
        analyticsData
      ] = await Promise.all([
        sdk.sdk.get('users'),
        sdk.sdk.get('products'),
        sdk.sdk.get('orders'),
        sdk.sdk.get('sellers'),
        sdk.sdk.get('affiliates'),
        sdk.getStores(),
        sdk.getHelpArticles(),
        sdk.getBlogs(),
        sdk.getPlatformAnalytics()
      ]);

      setUsers(usersData);
      setProducts(productsData);
      setOrders(ordersData);
      setSellers(sellersData);
      setAffiliates(affiliatesData);
      setStores(storesData);
      setHelpArticles(helpArticlesData);
      setBlogs(blogsData);
      setAnalytics(analyticsData);

    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateHelpArticle = async () => {
    if (!sdk) return;

    try {
      await sdk.createHelpArticle({
        ...articleForm,
        authorId: currentUser?.id,
        slug: articleForm.slug || articleForm.title.toLowerCase().replace(/\s+/g, '-')
      });
      
      toast.success('Help article created successfully');
      setArticleForm({ title: '', content: '', category: '', slug: '', isPublished: false });
      setShowCreateArticle(false);
      fetchAdminData();
    } catch (error) {
      console.error('Error creating help article:', error);
      toast.error('Failed to create help article');
    }
  };

  const handleCreateBlog = async () => {
    if (!sdk) return;

    try {
      await sdk.createBlog({
        ...blogForm,
        authorId: currentUser?.id,
        slug: blogForm.slug || blogForm.title.toLowerCase().replace(/\s+/g, '-'),
        tags: blogForm.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      });
      
      toast.success('Blog post created successfully');
      setBlogForm({ 
        title: '', content: '', excerpt: '', slug: '', category: '', 
        tags: '', featuredImage: '', isPublished: false 
      });
      setShowCreateBlog(false);
      fetchAdminData();
    } catch (error) {
      console.error('Error creating blog post:', error);
      toast.error('Failed to create blog post');
    }
  };

  const handleUpdateItemStatus = async (collection: string, itemId: string, updates: any) => {
    if (!sdk) return;

    try {
      await sdk.sdk.update(collection, itemId, updates);
      toast.success('Status updated successfully');
      fetchAdminData();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleDeleteItem = async (collection: string, itemId: string, itemName: string) => {
    if (!sdk || !confirm(`Are you sure you want to delete "${itemName}"?`)) return;

    try {
      await sdk.sdk.delete(collection, itemId);
      toast.success('Item deleted successfully');
      fetchAdminData();
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      suspended: 'bg-red-100 text-red-800',
      verified: 'bg-blue-100 text-blue-800',
      published: 'bg-green-100 text-green-800',
      draft: 'bg-gray-100 text-gray-800'
    };

    return (
      <Badge className={statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const filteredUsers = users.filter((user: any) => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'sellers', label: 'Sellers', icon: Store },
    { id: 'stores', label: 'Store Approvals', icon: Shield },
    { id: 'affiliates', label: 'Affiliates', icon: TrendingUp },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'commissions', label: 'Commission Settings', icon: Percent },
    { id: 'agreements', label: 'Seller Agreement', icon: FileText },
    { id: 'withdrawals', label: 'Withdrawals', icon: Download },
    { id: 'refunds', label: 'Refunds & Disputes', icon: RefreshCw },
    { id: 'help', label: 'Help Center', icon: FileText },
    { id: 'blog', label: 'Blog', icon: MessageSquare },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Platform management and analytics</p>
        </div>

        {/* Mobile Navigation */}
        <div className="flex overflow-x-auto space-x-2 mb-6 pb-2 md:hidden">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant={activeSection === item.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveSection(item.id)}
                className="flex items-center space-x-2 whitespace-nowrap"
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Button>
            );
          })}
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:space-x-2 mb-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant={activeSection === item.id ? 'default' : 'outline'}
                onClick={() => setActiveSection(item.id)}
                className="flex items-center space-x-2"
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Button>
            );
          })}
        </div>

        {/* Overview Section */}
        {activeSection === 'overview' && (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics?.totalUsers || 0}</div>
                  <p className="text-xs text-muted-foreground">Platform users</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${analytics?.totalRevenue?.toFixed(2) || '0.00'}</div>
                  <p className="text-xs text-muted-foreground">Platform earnings</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics?.totalProducts || 0}</div>
                  <p className="text-xs text-muted-foreground">Active listings</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics?.totalOrders || 0}</div>
                  <p className="text-xs text-muted-foreground">All orders</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest platform events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders.slice(0, 5).map((order: any) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">New Order #{order.id}</p>
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
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Users Management */}
        {activeSection === 'users' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">User Management</h2>
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
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="space-y-0">
                  {filteredUsers.map((user: any) => (
                    <div key={user.id} className="flex items-center justify-between p-6 border-b last:border-b-0">
                      <div className="flex items-center space-x-4">
                        <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{user.name || 'No Name'}</h3>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline">{user.role}</Badge>
                            {user.verified && getStatusBadge('verified')}
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleUpdateItemStatus('users', user.id, { 
                            suspended: !user.suspended 
                          })}
                        >
                          <Ban className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Store Approvals Management */}
        {activeSection === 'stores' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Store Approvals</h2>
              <div className="flex items-center space-x-2">
                <Badge variant="outline">
                  {stores.filter((store: any) => !store.isApproved).length} Pending
                </Badge>
                <Badge variant="secondary">
                  {stores.filter((store: any) => store.isApproved).length} Approved
                </Badge>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Pending Store Approvals</CardTitle>
                <CardDescription>Review and approve new store applications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stores.filter((store: any) => !store.isApproved).length === 0 ? (
                    <div className="text-center py-8">
                      <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-semibold mb-2">No pending approvals</h3>
                      <p className="text-muted-foreground">All store applications have been reviewed.</p>
                    </div>
                  ) : (
                    stores.filter((store: any) => !store.isApproved).map((store: any) => (
                      <div key={store.id} className="border rounded-lg p-4 space-y-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{store.name}</h3>
                            <p className="text-sm text-muted-foreground mb-2">
                              Store Slug: {window.location.origin}/{store.slug}
                            </p>
                            <p className="text-muted-foreground mb-3">{store.description}</p>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="font-medium">Business Type:</span>
                                <p className="text-muted-foreground">{store.businessType || 'Not specified'}</p>
                              </div>
                              <div>
                                <span className="font-medium">Location:</span>
                                <p className="text-muted-foreground">{store.location || 'Not specified'}</p>
                              </div>
                              <div>
                                <span className="font-medium">Website:</span>
                                <p className="text-muted-foreground">{store.website || 'Not specified'}</p>
                              </div>
                              <div>
                                <span className="font-medium">Phone:</span>
                                <p className="text-muted-foreground">{store.phone || 'Not specified'}</p>
                              </div>
                            </div>

                            <div className="mt-3 text-xs text-muted-foreground">
                              Applied: {new Date(store.createdAt).toLocaleDateString()}
                            </div>
                          </div>

                          <div className="flex space-x-2 ml-4">
                            <Button
                              size="sm"
                              onClick={() => handleUpdateItemStatus('stores', store.id, {
                                isApproved: true,
                                isActive: true
                              })}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteItem('stores', store.id, store.name)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Approved Stores</CardTitle>
                <CardDescription>Manage approved and active stores</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stores.filter((store: any) => store.isApproved).map((store: any) => (
                    <div key={store.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-semibold">{store.name}</h3>
                        <p className="text-sm text-muted-foreground">{store.slug}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          {getStatusBadge(store.isActive ? 'active' : 'suspended')}
                          {store.isVerified && getStatusBadge('verified')}
                          <span className="text-xs text-muted-foreground">
                            Approved: {new Date(store.updatedAt || store.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdateItemStatus('stores', store.id, {
                            isActive: !store.isActive
                          })}
                        >
                          {store.isActive ? <Ban className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdateItemStatus('stores', store.id, {
                            isVerified: !store.isVerified
                          })}
                        >
                          <Shield className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Commission Settings */}
        {activeSection === 'commissions' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Commission Settings</h2>
            </div>
            <div className="text-center py-12">
              <Percent className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">Commission Management</h3>
              <p className="text-muted-foreground">
                Commission settings functionality is being implemented. Check back soon!
              </p>
            </div>
          </div>
        )}

        {/* Seller Agreement Management */}
        {activeSection === 'agreements' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Seller Agreement</h2>
            </div>
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">Agreement Management</h3>
              <p className="text-muted-foreground">
                Seller agreement management functionality is being implemented. Check back soon!
              </p>
            </div>
          </div>
        )}

        {/* Withdrawal Management */}
        {activeSection === 'withdrawals' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Withdrawal Requests</h2>
            </div>
            <div className="text-center py-12">
              <Download className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">Withdrawal Management</h3>
              <p className="text-muted-foreground">
                Withdrawal management functionality is being implemented. Check back soon!
              </p>
            </div>
          </div>
        )}

        {/* Refunds & Disputes Management */}
        {activeSection === 'refunds' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Refunds & Disputes</h2>
            </div>
            <div className="text-center py-12">
              <RefreshCw className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">Refund & Dispute Management</h3>
              <p className="text-muted-foreground">
                Refund and dispute management functionality is being implemented. Check back soon!
              </p>
            </div>
          </div>
        )}

        {/* Help Center Management */}
        {activeSection === 'help' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Help Center</h2>
              <Button onClick={() => setShowCreateArticle(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Article
              </Button>
            </div>

            {showCreateArticle && (
              <Card>
                <CardHeader>
                  <CardTitle>Create Help Article</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Title</Label>
                      <Input
                        value={articleForm.title}
                        onChange={(e) => setArticleForm({...articleForm, title: e.target.value})}
                        placeholder="Article title"
                      />
                    </div>
                    <div>
                      <Label>Category</Label>
                      <Input
                        value={articleForm.category}
                        onChange={(e) => setArticleForm({...articleForm, category: e.target.value})}
                        placeholder="Category"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Content</Label>
                    <Textarea
                      value={articleForm.content}
                      onChange={(e) => setArticleForm({...articleForm, content: e.target.value})}
                      placeholder="Article content"
                      rows={8}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={articleForm.isPublished}
                      onChange={(e) => setArticleForm({...articleForm, isPublished: e.target.checked})}
                    />
                    <Label>Publish immediately</Label>
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={handleCreateHelpArticle}>Create Article</Button>
                    <Button variant="outline" onClick={() => setShowCreateArticle(false)}>Cancel</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Help Articles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {helpArticles.map((article: any) => (
                    <div key={article.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">{article.title}</h3>
                        <p className="text-sm text-muted-foreground">{article.category}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(article.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(article.isPublished ? 'published' : 'draft')}
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDeleteItem('help_articles', article.id, article.title)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {helpArticles.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No help articles yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Blog Management */}
        {activeSection === 'blog' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Blog Management</h2>
              <Button onClick={() => setShowCreateBlog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Post
              </Button>
            </div>

            {showCreateBlog && (
              <Card>
                <CardHeader>
                  <CardTitle>Create Blog Post</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Title</Label>
                      <Input
                        value={blogForm.title}
                        onChange={(e) => setBlogForm({...blogForm, title: e.target.value})}
                        placeholder="Blog post title"
                      />
                    </div>
                    <div>
                      <Label>Category</Label>
                      <Input
                        value={blogForm.category}
                        onChange={(e) => setBlogForm({...blogForm, category: e.target.value})}
                        placeholder="Category"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Excerpt</Label>
                    <Textarea
                      value={blogForm.excerpt}
                      onChange={(e) => setBlogForm({...blogForm, excerpt: e.target.value})}
                      placeholder="Brief description"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label>Content</Label>
                    <Textarea
                      value={blogForm.content}
                      onChange={(e) => setBlogForm({...blogForm, content: e.target.value})}
                      placeholder="Blog post content"
                      rows={10}
                    />
                  </div>
                  <div>
                    <Label>Tags (comma separated)</Label>
                    <Input
                      value={blogForm.tags}
                      onChange={(e) => setBlogForm({...blogForm, tags: e.target.value})}
                      placeholder="tag1, tag2, tag3"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={blogForm.isPublished}
                      onChange={(e) => setBlogForm({...blogForm, isPublished: e.target.checked})}
                    />
                    <Label>Publish immediately</Label>
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={handleCreateBlog}>Create Post</Button>
                    <Button variant="outline" onClick={() => setShowCreateBlog(false)}>Cancel</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Blog Posts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {blogs.map((blog: any) => (
                    <div key={blog.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">{blog.title}</h3>
                        <p className="text-sm text-muted-foreground">{blog.category}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(blog.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(blog.isPublished ? 'published' : 'draft')}
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDeleteItem('blogs', blog.id, blog.title)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {blogs.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No blog posts yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
