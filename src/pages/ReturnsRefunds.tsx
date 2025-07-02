
import React from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  ArrowLeft,
  AlertCircle,
  CreditCard,
  Truck
} from 'lucide-react';

export default function ReturnsRefunds() {
  const returnSteps = [
    {
      step: 1,
      title: "Initiate Return",
      description: "Log into your account and select the item you want to return from your order history."
    },
    {
      step: 2,
      title: "Print Return Label",
      description: "We'll provide a prepaid return shipping label for your convenience."
    },
    {
      step: 3,
      title: "Pack & Ship",
      description: "Pack the item securely and attach the return label, then drop it off."
    },
    {
      step: 4,
      title: "Receive Refund",
      description: "Once we receive and inspect your return, we'll process your refund within 3-5 business days."
    }
  ];

  const returnPolicies = [
    {
      category: "Electronics",
      timeLimit: "30 days",
      condition: "Original packaging required",
      icon: Package
    },
    {
      category: "Clothing",
      timeLimit: "60 days",
      condition: "Unworn with tags",
      icon: Package
    },
    {
      category: "Books",
      timeLimit: "30 days",
      condition: "Good condition",
      icon: Package
    },
    {
      category: "Home & Garden",
      timeLimit: "45 days",
      condition: "Unused condition",
      icon: Package
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4">Returns & Refunds</h1>
            <p className="text-muted-foreground">
              Easy returns and hassle-free refunds for your peace of mind
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6 text-center">
                <Clock className="h-8 w-8 mx-auto mb-3 text-blue-500" />
                <h3 className="font-semibold mb-2">60-Day Returns</h3>
                <p className="text-sm text-muted-foreground">
                  Extended return window for most items
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <Truck className="h-8 w-8 mx-auto mb-3 text-green-500" />
                <h3 className="font-semibold mb-2">Free Returns</h3>
                <p className="text-sm text-muted-foreground">
                  We cover return shipping costs
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <CreditCard className="h-8 w-8 mx-auto mb-3 text-purple-500" />
                <h3 className="font-semibold mb-2">Fast Refunds</h3>
                <p className="text-sm text-muted-foreground">
                  3-5 business days processing
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Return Process */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>How to Return an Item</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {returnSteps.map((step, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold text-sm">
                      {step.step}
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{step.title}</h3>
                      <p className="text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-6 border-t">
                <Button>Start a Return</Button>
              </div>
            </CardContent>
          </Card>

          {/* Return Policies by Category */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Return Policies by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {returnPolicies.map((policy, index) => {
                  const Icon = policy.icon;
                  return (
                    <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                      <Icon className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <h3 className="font-semibold">{policy.category}</h3>
                        <p className="text-sm text-muted-foreground">
                          {policy.timeLimit} • {policy.condition}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Non-Returnable Items */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                Non-Returnable Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Personalized or customized items</li>
                <li>• Perishable goods (food, flowers, etc.)</li>
                <li>• Digital downloads and software</li>
                <li>• Health and personal care items</li>
                <li>• Gift cards and vouchers</li>
                <li>• Items marked as final sale</li>
              </ul>
            </CardContent>
          </Card>

          {/* Refund Information */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Refund Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Refund Methods</h3>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Original payment method (most common)</li>
                    <li>• Store credit (optional)</li>
                    <li>• Bank transfer (for large amounts)</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Processing Times</h3>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Credit cards: 3-5 business days</li>
                    <li>• PayPal: 1-2 business days</li>
                    <li>• Bank transfers: 5-7 business days</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Support */}
          <Card>
            <CardContent className="p-6 text-center">
              <h3 className="font-semibold mb-2">Need Help with Your Return?</h3>
              <p className="text-muted-foreground mb-4">
                Our customer service team is here to assist you
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="outline">Contact Support</Button>
                <Button variant="outline">Live Chat</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
