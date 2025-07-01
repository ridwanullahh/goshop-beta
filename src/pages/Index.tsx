
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCommerce } from '@/context/CommerceContext';
import { 
  ShoppingBag, 
  Users, 
  TrendingUp, 
  Shield, 
  Zap,
  Globe,
  Smartphone,
  Heart,
  Star,
  ArrowRight,
  Play,
  Eye,
  MessageCircle
} from 'lucide-react';

const Index = () => {
  const { products, isLoading } = useCommerce();
  const featuredProducts = products.filter(p => p.isFeatured).slice(0, 6);

  const stats = [
    { icon: Users, label: 'Active Users', value: '2.5M+', color: 'text-blue-500' },
    { icon: ShoppingBag, label: 'Products', value: '500K+', color: 'text-green-500' },
    { icon: TrendingUp, label: 'Monthly GMV', value: '$50M+', color: 'text-purple-500' },
    { icon: Globe, label: 'Countries', value: '150+', color: 'text-orange-500' },
  ];

  const features = [
    {
      icon: Zap,
      title: 'AI-Powered Discovery',
      description: 'Find exactly what you need with intelligent recommendations and search.',
      color: 'bg-yellow-100 text-yellow-600'
    },
    {
      icon: Shield,
      title: 'Trust & Safety First',
      description: 'Every transaction is protected with our comprehensive buyer protection.',
      color: 'bg-green-100 text-green-600'
    },
    {
      icon: Smartphone,
      title: 'Mobile-Native Experience',
      description: 'Designed for mobile-first shopping with intuitive touch interactions.',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      icon: Heart,
      title: 'Community-Powered',
      description: 'Connect with sellers and buyers in a trusted social commerce environment.',
      color: 'bg-pink-100 text-pink-600'
    }
  ];

  const ProductCard = ({ product }: { product: any }) => (
    <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
      <div className="relative">
        <img
          src={product.images[0] || '/placeholder.svg'}
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 right-2">
          <Badge className="bg-orange-500">Featured</Badge>
        </div>
        <div className="absolute bottom-2 left-2">
          <Badge variant="secondary" className="bg-white/90">
            <Eye className="h-3 w-3 mr-1" />
            {Math.floor(Math.random() * 1000)}
          </Badge>
        </div>
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg line-clamp-1">{product.name}</CardTitle>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">{product.rating}</span>
            <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
          </div>
          <Badge variant="outline">{product.sellerName}</Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xl font-bold text-primary">${product.price}</span>
            {product.originalPrice && (
              <span className="text-sm text-muted-foreground line-through ml-2">
                ${product.originalPrice}
              </span>
            )}
          </div>
          <Button size="sm">
            Add to Cart
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-purple-600 via-blue-600 to-teal-500 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-4 py-20 text-center">
          <div className="max-w-4xl mx-auto">
            <Badge className="mb-6 bg-white/20 text-white border-white/30">
              🚀 Welcome to the Future of Commerce
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              CommerceOS
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              The first fully immersive, AI-powered, community-driven commerce platform. 
              Shop, sell, and connect in ways you never imagined.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button size="lg" className="bg-white text-purple-600 hover:bg-blue-50">
                <ShoppingBag className="h-5 w-5 mr-2" />
                Start Shopping
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                <Play className="h-5 w-5 mr-2" />
                Watch Demo
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <stat.icon className={`h-8 w-8 mx-auto mb-2 ${stat.color}`} />
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-sm text-blue-100">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 animate-bounce">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
            <ShoppingBag className="h-8 w-8 text-white" />
          </div>
        </div>
        <div className="absolute top-40 right-20 animate-pulse">
          <div className="w-12 h-12 bg-yellow-400/20 rounded-full flex items-center justify-center">
            <Star className="h-6 w-6 text-yellow-300" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4" variant="outline">
              ✨ Why Choose CommerceOS
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              100x Better Than Traditional Marketplaces
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We've reimagined every aspect of online commerce to create an experience 
              that's more intelligent, trustworthy, and delightful.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300">
                <CardHeader className="text-center">
                  <div className={`w-16 h-16 rounded-2xl ${feature.color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="h-8 w-8" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-gradient-subtle">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <Badge className="mb-4" variant="outline">
                🔥 Trending Now
              </Badge>
              <h2 className="text-4xl font-bold mb-4">Featured Products</h2>
              <p className="text-xl text-muted-foreground">
                Discover the most popular items on our platform
              </p>
            </div>
            <Link to="/products">
              <Button variant="outline">
                View All Products
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>

          {!isLoading && featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <CardHeader>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Transform Your Commerce Experience?
          </h2>
          <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
            Join millions of users who are already experiencing the future of online shopping and selling.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/register">
              <Button size="lg" className="bg-white text-purple-600 hover:bg-blue-50">
                Get Started Free
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
            <Link to="/products">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Explore Products
                <Eye className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="mt-12 flex items-center justify-center space-x-8 text-blue-100">
            <div className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              <span>100% Secure</span>
            </div>
            <div className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              <span>2.5M+ Users</span>
            </div>
            <div className="flex items-center">
              <MessageCircle className="h-5 w-5 mr-2" />
              <span>24/7 Support</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
