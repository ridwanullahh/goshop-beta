
import React from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Truck, 
  Clock, 
  MapPin, 
  Package,
  Zap,
  Globe,
  Shield,
  Calculator
} from 'lucide-react';

export default function ShippingInfo() {
  const shippingOptions = [
    {
      name: "Standard Shipping",
      duration: "5-7 Business Days",
      cost: "Free on orders over ₦10,000",
      icon: Package,
      description: "Most economical option for regular deliveries"
    },
    {
      name: "Express Shipping", 
      duration: "2-3 Business Days",
      cost: "₦2,500",
      icon: Zap,
      description: "Faster delivery for urgent orders"
    },
    {
      name: "Same Day Delivery",
      duration: "Within 24 Hours",
      cost: "₦5,000",
      icon: Clock,
      description: "Available in Lagos, Abuja, and Port Harcourt"
    },
    {
      name: "International Shipping",
      duration: "7-14 Business Days",
      cost: "Varies by destination",
      icon: Globe,
      description: "Worldwide delivery available"
    }
  ];

  const deliveryZones = [
    {
      zone: "Lagos Metropolitan",
      areas: ["Victoria Island", "Ikoyi", "Lekki", "Ikeja", "Surulere"],
      sameDay: true,
      express: true
    },
    {
      zone: "Abuja FCT",
      areas: ["Wuse", "Maitama", "Garki", "Asokoro", "Gwarinpa"],
      sameDay: true,
      express: true
    },
    {
      zone: "Port Harcourt",
      areas: ["GRA", "Trans Amadi", "Mile 3", "Eliozu"],
      sameDay: true,
      express: true
    },
    {
      zone: "Other Major Cities",
      areas: ["Kano", "Ibadan", "Kaduna", "Enugu", "Warri"],
      sameDay: false,
      express: true
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4">Shipping Information</h1>
            <p className="text-muted-foreground">
              Fast, reliable, and secure delivery across Nigeria and beyond
            </p>
          </div>

          {/* Shipping Options */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Shipping Options</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {shippingOptions.map((option, index) => {
                  const Icon = option.icon;
                  return (
                    <div key={index} className="border rounded-lg p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <Icon className="h-6 w-6 text-primary" />
                        <h3 className="font-semibold">{option.name}</h3>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Duration:</span>
                          <span className="font-medium">{option.duration}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Cost:</span>
                          <span className="font-medium">{option.cost}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-3">
                          {option.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Delivery Zones */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Delivery Zones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {deliveryZones.map((zone, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {zone.zone}
                      </h3>
                      <div className="flex gap-2">
                        {zone.sameDay && (
                          <Badge variant="secondary">Same Day</Badge>
                        )}
                        {zone.express && (
                          <Badge variant="outline">Express</Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {zone.areas.map((area, areaIndex) => (
                        <Badge key={areaIndex} variant="outline" className="text-xs">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Shipping Calculator */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Shipping Calculator
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/50 p-6 rounded-lg text-center">
                <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold mb-2">Calculate Shipping Cost</h3>
                <p className="text-muted-foreground mb-4">
                  Enter your location and order details to get accurate shipping costs
                </p>
                <div className="text-sm text-muted-foreground">
                  <p>• Free standard shipping on orders over ₦10,000</p>
                  <p>• Express shipping available for urgent deliveries</p>
                  <p>• Same-day delivery in select cities</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Policies */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Shipping Policies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Order Processing
                  </h3>
                  <ul className="space-y-2 text-muted-foreground text-sm">
                    <li>• Orders placed before 2 PM are processed same day</li>
                    <li>• Weekend orders processed on Monday</li>
                    <li>• Custom orders may take 2-3 business days</li>
                    <li>• You'll receive tracking info once shipped</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Truck className="h-4 w-4" />
                    Delivery Guidelines
                  </h3>
                  <ul className="space-y-2 text-muted-foreground text-sm">
                    <li>• Someone must be available to receive packages</li>
                    <li>• Valid ID required for high-value items</li>
                    <li>• Delivery attempts made up to 3 times</li>
                    <li>• Safe drop-off available for trusted locations</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* International Shipping */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                International Shipping
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  We ship to over 50 countries worldwide. International shipping rates vary by destination and package weight.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <h4 className="font-semibold">Africa</h4>
                    <p className="text-sm text-muted-foreground">5-10 business days</p>
                    <p className="text-sm font-medium">From ₦8,000</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <h4 className="font-semibold">Europe & Asia</h4>
                    <p className="text-sm text-muted-foreground">7-14 business days</p>
                    <p className="text-sm font-medium">From ₦15,000</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <h4 className="font-semibold">Americas</h4>
                    <p className="text-sm text-muted-foreground">10-21 business days</p>
                    <p className="text-sm font-medium">From ₦20,000</p>
                  </div>
                </div>
                
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-sm text-amber-800">
                    <strong>Note:</strong> International shipments may be subject to customs duties and taxes imposed by the destination country. These charges are the responsibility of the recipient.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Support */}
          <Card>
            <CardContent className="p-6 text-center">
              <h3 className="font-semibold mb-2">Questions About Shipping?</h3>
              <p className="text-muted-foreground mb-4">
                Our shipping experts are here to help
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a href="/contact" className="inline-block">
                  <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                    Contact Support
                  </button>
                </a>
                <a href="/track-order" className="inline-block">
                  <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
                    Track Your Order
                  </button>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
