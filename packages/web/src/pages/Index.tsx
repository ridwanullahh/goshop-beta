import React from 'react';
import { Header } from '@/components/Header';
import { HeroSection } from '@/components/HeroSection';
import { FeaturedSection } from '@/components/FeaturedSection';
import { Footer } from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCommerce } from '@/context/CommerceContext';
import { Link } from 'react-router-dom';
import { 
  Play, 
  Users, 
  Sparkles, 
  Zap, 
  Globe, 
  Shield, 
  TrendingUp,
  ShoppingBag,
  MessageCircle,
  Star
} from 'lucide-react';

const Index = () => {
  const { isLoading } = useCommerce();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Loading CommerceOS</h2>
          <p className="text-muted-foreground">Preparing your shopping experience...</p>
        </div>
      </div>
    );
  }

  const features = [
    {
      icon: Sparkles,
      title: "AI-Powered Shopping",
      description: "Get personalized recommendations and smart shopping assistance powered by advanced AI",
      color: "text-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-900/20"
    },
    {
      icon: Play,
      title: "Live Video Shopping",
      description: "Watch live product demos, interact with sellers, and shop in real-time",
      color: "text-red-500",
      bgColor: "bg-red-50 dark:bg-red-900/20"
    },
    {
      icon: Users,
      title: "Community Commerce",
      description: "Join a vibrant community of shoppers, share reviews, and discover trending products",
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-900/20"
    },
    {
      icon: Globe,
      title: "Global Marketplace",
      description: "Access products from sellers worldwide with seamless cross-border trading",
      color: "text-green-500",
      bgColor: "bg-green-50 dark:bg-green-900/20"
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Experience sub-second load times and instant product discovery",
      color: "text-yellow-500",
      bgColor: "bg-yellow-50 dark:bg-yellow-900/20"
    },
    {
      icon: Shield,
      title: "Trust & Security",
      description: "Shop with confidence using our advanced security and buyer protection",
      color: "text-indigo-500",
      bgColor: "bg-indigo-50 dark:bg-indigo-900/20"
    }
  ];

  const stats = [
    { label: "Active Users", value: "2M+", icon: Users },
    { label: "Products", value: "50M+", icon: ShoppingBag },
    { label: "Live Streams", value: "10K+", icon: Play },
    { label: "Reviews", value: "5M+", icon: Star }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        
        {/* Stats Section */}
        <section className="py-16 bg-muted/50">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <stat.icon className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <div className="text-3xl font-bold mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                ✨ 100x Better Than Traditional E-commerce
              </Badge>
              <h2 className="text-4xl font-bold mb-4">
                The Future of Commerce is Here
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Experience shopping like never before with AI-powered personalization, 
                live video commerce, and a thriving community of buyers and sellers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="relative overflow-hidden hover:shadow-lg transition-all duration-300 group">
                  <CardContent className="p-8">
                    <div className={`w-12 h-12 rounded-lg ${feature.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <feature.icon className={`w-6 h-6 ${feature.color}`} />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Quick Access Section */}
        <section className="py-16 bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Jump Right In</h2>
              <p className="text-muted-foreground">
                Start your commerce journey with these popular features
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="group hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <ShoppingBag className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Smart Shopping</h3>
                  <p className="text-muted-foreground mb-4">
                    Discover products with AI-powered search and recommendations
                  </p>
                  <Link to="/products">
                    <Button className="w-full">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Start Shopping
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Play className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Live Shopping</h3>
                  <p className="text-muted-foreground mb-4">
                    Watch live product demos and shop in real-time
                  </p>
                  <Link to="/live">
                    <Button className="w-full" variant="secondary">
                      <Play className="w-4 h-4 mr-2" />
                      Watch Live
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Community</h3>
                  <p className="text-muted-foreground mb-4">
                    Join discussions, share reviews, and connect with others
                  </p>
                  <Link to="/community">
                    <Button className="w-full" variant="outline">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Join Community
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <FeaturedSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
