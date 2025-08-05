import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useCommerce } from '@/context/CommerceContext';
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Upload,
  Image as ImageIcon,
  Package,
  Truck,
  Users,
  Percent,
  Eye,
  Search,
  Filter
} from 'lucide-react';

export default function EnhancedProducts() {
  const { sdk, currentUser } = useCommerce();
  const { toast } = useToast();
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [uploadingImages, setUploadingImages] = useState(false);

  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    category: '',
    inventory: '',
    images: [] as string[],
    type: 'simple' as 'simple' | 'variable' | 'bundle',
    variations: [] as any[],
    variants: [] as any[],
    bundles: [] as any[],
    shippingEnabled: false,
    shippingCost: '',
    weight: '',
    dimensions: { length: '', width: '', height: '' },
    affiliateEnabled: false,
    affiliateCommission: '',
    tags: '',
    isActive: true,
    isFeatured: false
  });

  const categories = [
    'Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Books',
    'Beauty', 'Automotive', 'Toys', 'Health', 'Food & Beverages'
  ];

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchQuery, filterStatus]);

  const loadProducts = async () => {
    if (!sdk || !currentUser) return;

    try {
      const productsData = await sdk.getSellerProducts(currentUser.id);
      setProducts(productsData);
    } catch (error) {
      console.error('Error loading products:', error);
      toast({
        title: "Error",
        description: "Failed to load products.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = [...products];

    if (searchQuery.trim()) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(product => {
        if (filterStatus === 'active') return product.isActive;
        if (filterStatus === 'inactive') return !product.isActive;
        if (filterStatus === 'featured') return product.isFeatured;
        if (filterStatus === 'affiliate') return product.affiliateEnabled;
        return true;
      });
    }

    setFilteredProducts(filtered);
  };

  const handleImageUpload = async (files: FileList) => {
    if (!sdk) return;

    setUploadingImages(true);
    try {
      const uploadPromises = Array.from(files).map(file => sdk.uploadToCloudinary(file));
      const imageUrls = await Promise.all(uploadPromises);
      
      setProductForm(prev => ({
        ...prev,
        images: [...prev.images, ...imageUrls]
      }));

      toast({
        title: "Success",
        description: `${imageUrls.length} image(s) uploaded successfully!`
      });
    } catch (error) {
      console.error('Error uploading images:', error);
      toast({
        title: "Error",
        description: "Failed to upload images. Please check your Cloudinary configuration.",
        variant: "destructive"
      });
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (index: number) => {
    setProductForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const addVariation = () => {
    setProductForm(prev => ({
      ...prev,
      variations: [
        ...prev.variations,
        { id: Date.now().toString(), name: '', values: [''] }
      ]
    }));
  };

  const updateVariation = (index: number, field: string, value: any) => {
    setProductForm(prev => ({
      ...prev,
      variations: prev.variations.map((variation, i) => 
        i === index ? { ...variation, [field]: value } : variation
      )
    }));
  };

  const addVariationValue = (variationIndex: number) => {
    setProductForm(prev => ({
      ...prev,
      variations: prev.variations.map((variation, i) => 
        i === variationIndex 
          ? { ...variation, values: [...variation.values, ''] }
          : variation
      )
    }));
  };

  const updateVariationValue = (variationIndex: number, valueIndex: number, value: string) => {
    setProductForm(prev => ({
      ...prev,
      variations: prev.variations.map((variation, i) => 
        i === variationIndex 
          ? { 
              ...variation, 
              values: variation.values.map((v, vi) => vi === valueIndex ? value : v)
            }
          : variation
      )
    }));
  };

  const removeVariation = (index: number) => {
    setProductForm(prev => ({
      ...prev,
      variations: prev.variations.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sdk || !currentUser) return;

    try {
      const productData = {
        ...productForm,
        price: parseFloat(productForm.price),
        originalPrice: productForm.originalPrice ? parseFloat(productForm.originalPrice) : undefined,
        inventory: parseInt(productForm.inventory),
        shippingCost: productForm.shippingCost ? parseFloat(productForm.shippingCost) : undefined,
        weight: productForm.weight ? parseFloat(productForm.weight) : undefined,
        affiliateCommission: productForm.affiliateCommission ? parseFloat(productForm.affiliateCommission) : undefined,
        tags: productForm.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        sellerId: currentUser.id,
        dimensions: productForm.dimensions.length ? 
          `${productForm.dimensions.length}x${productForm.dimensions.width}x${productForm.dimensions.height}` : 
          undefined
      };

      if (editingProduct) {
        await sdk.updateProduct(editingProduct.id, productData);
        toast({
          title: "Success",
          description: "Product updated successfully!"
        });
      } else {
        await sdk.createProduct(productData);
        toast({
          title: "Success",
          description: "Product created successfully!"
        });
      }

      resetForm();
      loadProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: "Error",
        description: "Failed to save product. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name || '',
      description: product.description || '',
      price: product.price?.toString() || '',
      originalPrice: product.originalPrice?.toString() || '',
      category: product.category || '',
      inventory: product.inventory?.toString() || '',
      images: product.images || [],
      type: product.type || 'simple',
      variations: product.variations || [],
      variants: product.variants || [],
      bundles: product.bundles || [],
      shippingEnabled: product.shippingEnabled || false,
      shippingCost: product.shippingCost?.toString() || '',
      weight: product.weight?.toString() || '',
      dimensions: product.dimensions ? {
        length: product.dimensions.split('x')[0] || '',
        width: product.dimensions.split('x')[1] || '',
        height: product.dimensions.split('x')[2] || ''
      } : { length: '', width: '', height: '' },
      affiliateEnabled: product.affiliateEnabled || false,
      affiliateCommission: product.affiliateCommission?.toString() || '',
      tags: product.tags?.join(', ') || '',
      isActive: product.isActive !== false,
      isFeatured: product.isFeatured || false
    });
    setShowProductForm(true);
  };

  const handleDelete = async (productId: string) => {
    if (!sdk || !confirm('Are you sure you want to delete this product?')) return;

    try {
      await sdk.deleteProduct(productId);
      toast({
        title: "Success",
        description: "Product deleted successfully!"
      });
      loadProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error",
        description: "Failed to delete product.",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setProductForm({
      name: '',
      description: '',
      price: '',
      originalPrice: '',
      category: '',
      inventory: '',
      images: [],
      type: 'simple',
      variations: [],
      variants: [],
      bundles: [],
      shippingEnabled: false,
      shippingCost: '',
      weight: '',
      dimensions: { length: '', width: '', height: '' },
      affiliateEnabled: false,
      affiliateCommission: '',
      tags: '',
      isActive: true,
      isFeatured: false
    });
    setEditingProduct(null);
    setShowProductForm(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Product Management</h1>
        </div>
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-muted rounded w-full mb-4"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Product Management</h1>
          <p className="text-muted-foreground">
            Manage your products with advanced features including variations, shipping, and affiliate settings
          </p>
        </div>
        <Button onClick={() => setShowProductForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Products</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="featured">Featured</SelectItem>
            <SelectItem value="affiliate">Affiliate Enabled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {showProductForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
              <Button variant="ghost" size="sm" onClick={resetForm}>
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="images">Images</TabsTrigger>
                  <TabsTrigger value="variations">Variations</TabsTrigger>
                  <TabsTrigger value="shipping">Shipping</TabsTrigger>
                  <TabsTrigger value="affiliate">Affiliate</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Product Name *</Label>
                      <Input
                        id="name"
                        value={productForm.name}
                        onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter product name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Category *</Label>
                      <Select 
                        value={productForm.category} 
                        onValueChange={(value) => setProductForm(prev => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(category => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={productForm.description}
                      onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe your product..."
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="price">Price ($) *</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={productForm.price}
                        onChange={(e) => setProductForm(prev => ({ ...prev, price: e.target.value }))}
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
                        onChange={(e) => setProductForm(prev => ({ ...prev, originalPrice: e.target.value }))}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="inventory">Inventory *</Label>
                      <Input
                        id="inventory"
                        type="number"
                        value={productForm.inventory}
                        onChange={(e) => setProductForm(prev => ({ ...prev, inventory: e.target.value }))}
                        placeholder="Stock quantity"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="tags">Tags (comma separated)</Label>
                    <Input
                      id="tags"
                      value={productForm.tags}
                      onChange={(e) => setProductForm(prev => ({ ...prev, tags: e.target.value }))}
                      placeholder="tag1, tag2, tag3"
                    />
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isActive"
                        checked={productForm.isActive}
                        onCheckedChange={(checked) => setProductForm(prev => ({ ...prev, isActive: checked }))}
                      />
                      <Label htmlFor="isActive">Active</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isFeatured"
                        checked={productForm.isFeatured}
                        onCheckedChange={(checked) => setProductForm(prev => ({ ...prev, isFeatured: checked }))}
                      />
                      <Label htmlFor="isFeatured">Featured</Label>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="images" className="space-y-4">
                  <div>
                    <Label>Product Images</Label>
                    <div className="mt-2">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                        className="hidden"
                        id="image-upload"
                        disabled={uploadingImages}
                      />
                      <label
                        htmlFor="image-upload"
                        className="flex items-center justify-center w-full h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:border-muted-foreground/50 transition-colors"
                      >
                        <div className="text-center">
                          {uploadingImages ? (
                            <div className="flex items-center justify-center">
                              <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mr-2"></div>
                              Uploading...
                            </div>
                          ) : (
                            <>
                              <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                              <p className="text-sm text-muted-foreground">
                                Click to upload images or drag and drop
                              </p>
                            </>
                          )}
                        </div>
                      </label>
                    </div>
                  </div>

                  {productForm.images.length > 0 && (
                    <div className="grid grid-cols-4 gap-4">
                      {productForm.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image}
                            alt={`Product ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeImage(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="variations" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">Product Variations</h3>
                      <p className="text-sm text-muted-foreground">
                        Add variations like size, color, etc.
                      </p>
                    </div>
                    <Button type="button" variant="outline" onClick={addVariation}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Variation
                    </Button>
                  </div>

                  {productForm.variations.map((variation, index) => (
                    <Card key={variation.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <Label>Variation Name</Label>
                            <Input
                              value={variation.name}
                              onChange={(e) => updateVariation(index, 'name', e.target.value)}
                              placeholder="e.g., Size, Color"
                              className="mt-1"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeVariation(index)}
                            className="ml-4"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <Label>Values</Label>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => addVariationValue(index)}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Add Value
                            </Button>
                          </div>
                          <div className="space-y-2">
                            {variation.values.map((value, valueIndex) => (
                              <Input
                                key={valueIndex}
                                value={value}
                                onChange={(e) => updateVariationValue(index, valueIndex, e.target.value)}
                                placeholder="e.g., Small, Medium, Large"
                              />
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="shipping" className="space-y-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <Switch
                      id="shippingEnabled"
                      checked={productForm.shippingEnabled}
                      onCheckedChange={(checked) => setProductForm(prev => ({ ...prev, shippingEnabled: checked }))}
                    />
                    <Label htmlFor="shippingEnabled">Enable Shipping</Label>
                  </div>

                  {productForm.shippingEnabled && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="shippingCost">Shipping Cost ($)</Label>
                          <Input
                            id="shippingCost"
                            type="number"
                            step="0.01"
                            value={productForm.shippingCost}
                            onChange={(e) => setProductForm(prev => ({ ...prev, shippingCost: e.target.value }))}
                            placeholder="0.00"
                          />
                        </div>
                        <div>
                          <Label htmlFor="weight">Weight (lbs)</Label>
                          <Input
                            id="weight"
                            type="number"
                            step="0.1"
                            value={productForm.weight}
                            onChange={(e) => setProductForm(prev => ({ ...prev, weight: e.target.value }))}
                            placeholder="0.0"
                          />
                        </div>
                      </div>

                      <div>
                        <Label>Dimensions (inches)</Label>
                        <div className="grid grid-cols-3 gap-4 mt-2">
                          <Input
                            type="number"
                            step="0.1"
                            value={productForm.dimensions.length}
                            onChange={(e) => setProductForm(prev => ({
                              ...prev,
                              dimensions: { ...prev.dimensions, length: e.target.value }
                            }))}
                            placeholder="Length"
                          />
                          <Input
                            type="number"
                            step="0.1"
                            value={productForm.dimensions.width}
                            onChange={(e) => setProductForm(prev => ({
                              ...prev,
                              dimensions: { ...prev.dimensions, width: e.target.value }
                            }))}
                            placeholder="Width"
                          />
                          <Input
                            type="number"
                            step="0.1"
                            value={productForm.dimensions.height}
                            onChange={(e) => setProductForm(prev => ({
                              ...prev,
                              dimensions: { ...prev.dimensions, height: e.target.value }
                            }))}
                            placeholder="Height"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="affiliate" className="space-y-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <Switch
                      id="affiliateEnabled"
                      checked={productForm.affiliateEnabled}
                      onCheckedChange={(checked) => setProductForm(prev => ({ ...prev, affiliateEnabled: checked }))}
                    />
                    <Label htmlFor="affiliateEnabled">Enable Affiliate Marketing</Label>
                  </div>

                  {productForm.affiliateEnabled && (
                    <div>
                      <Label htmlFor="affiliateCommission">Affiliate Commission (%)</Label>
                      <div className="relative">
                        <Input
                          id="affiliateCommission"
                          type="number"
                          step="0.1"
                          min="0"
                          max="50"
                          value={productForm.affiliateCommission}
                          onChange={(e) => setProductForm(prev => ({ ...prev, affiliateCommission: e.target.value }))}
                          placeholder="5.0"
                          className="pr-8"
                        />
                        <Percent className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Commission percentage that affiliates will earn from each sale
                      </p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              <div className="flex justify-end space-x-2 pt-6 border-t mt-6">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit">
                  <Save className="h-4 w-4 mr-2" />
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Products List */}
      <div className="grid gap-4">
        {filteredProducts.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">
                {searchQuery || filterStatus !== 'all' ? 'No products found' : 'No products yet'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || filterStatus !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Create your first product to start selling'
                }
              </p>
              {!searchQuery && filterStatus === 'all' && (
                <Button onClick={() => setShowProductForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Product
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredProducts.map((product) => (
            <Card key={product.id}>
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-lg truncate">{product.name}</h3>
                        <p className="text-sm text-muted-foreground">{product.category}</p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        {!product.isActive && <Badge variant="secondary">Inactive</Badge>}
                        {product.isFeatured && <Badge>Featured</Badge>}
                        {product.shippingEnabled && (
                          <Badge variant="outline">
                            <Truck className="h-3 w-3 mr-1" />
                            Shipping
                          </Badge>
                        )}
                        {product.affiliateEnabled && (
                          <Badge variant="outline">
                            <Users className="h-3 w-3 mr-1" />
                            Affiliate
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                      {product.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm">
                        <span className="font-medium">${product.price}</span>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span className="text-muted-foreground line-through">
                            ${product.originalPrice}
                          </span>
                        )}
                        <span className="text-muted-foreground">
                          Stock: {product.inventory || 0}
                        </span>
                        {product.affiliateEnabled && (
                          <span className="text-muted-foreground">
                            Affiliate: {product.affiliateCommission}%
                          </span>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(product)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(product.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
