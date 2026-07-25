
import React from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, HelpCircle, Phone, Mail, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Help() {
  const helpCategories = [
    { title: 'Getting Started', articles: 12, icon: HelpCircle },
    { title: 'Account & Profile', articles: 8, icon: HelpCircle },
    { title: 'Orders & Shipping', articles: 15, icon: HelpCircle },
    { title: 'Returns & Refunds', articles: 6, icon: HelpCircle },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">How can we help you?</h1>
            <div className="relative max-w-lg mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search for help articles..."
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {helpCategories.map((category, index) => {
              const Icon = category.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-3">
                      <Icon className="h-6 w-6 text-primary" />
                      <span>{category.title}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{category.articles} articles</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Still need help?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link to="/contact">
                  <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-center space-y-2">
                    <Mail className="h-6 w-6" />
                    <span>Email Support</span>
                  </Button>
                </Link>
                <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-center space-y-2">
                  <Phone className="h-6 w-6" />
                  <span>Call Us</span>
                </Button>
                <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-center space-y-2">
                  <MessageSquare className="h-6 w-6" />
                  <span>Live Chat</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
