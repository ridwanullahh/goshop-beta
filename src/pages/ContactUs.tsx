
import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock,
  MessageSquare,
  Send,
  Headphones,
  HelpCircle
} from 'lucide-react';

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, this would send to your backend
    toast.success('Message sent successfully! We\'ll get back to you within 24 hours.');
    setFormData({ name: '', email: '', subject: '', category: '', message: '' });
  };

  const contactMethods = [
    {
      icon: Phone,
      title: "Phone Support",
      description: "Speak directly with our support team",
      contact: "+234 (0) 1 234 5678",
      hours: "Mon-Fri, 9AM-6PM WAT",
      available: true
    },
    {
      icon: Mail,
      title: "Email Support", 
      description: "Send us an email and we'll respond within 24 hours",
      contact: "support@goshop.com",
      hours: "24/7 Response",
      available: true
    },
    {
      icon: MessageSquare,
      title: "Live Chat",
      description: "Get instant help from our chat support",
      contact: "Available on website",
      hours: "Mon-Fri, 8AM-8PM WAT",
      available: true
    },
    {
      icon: Headphones,
      title: "WhatsApp Support",
      description: "Message us on WhatsApp for quick assistance",
      contact: "+234 (0) 808 123 4567",
      hours: "Mon-Fri, 9AM-6PM WAT",
      available: true
    }
  ];

  const officeLocations = [
    {
      city: "Lagos",
      address: "123 Victoria Island, Lagos State, Nigeria",
      phone: "+234 (0) 1 234 5678",
      email: "lagos@goshop.com"
    },
    {
      city: "Abuja",
      address: "456 Wuse 2, Abuja FCT, Nigeria", 
      phone: "+234 (0) 9 876 5432",
      email: "abuja@goshop.com"
    },
    {
      city: "Port Harcourt",
      address: "789 GRA Phase 2, Port Harcourt, Rivers State",
      phone: "+234 (0) 84 123 456",
      email: "portharcourt@goshop.com"
    }
  ];

  const faqCategories = [
    { name: "Orders & Shipping", count: 25 },
    { name: "Returns & Refunds", count: 18 },
    { name: "Account & Billing", count: 15 },
    { name: "Products & Inventory", count: 12 },
    { name: "Technical Support", count: 8 }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
            <p className="text-muted-foreground text-lg">
              We're here to help! Get in touch with our friendly support team.
            </p>
          </div>

          {/* Contact Methods */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {contactMethods.map((method, index) => {
              const Icon = method.icon;
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <Icon className="h-12 w-12 mx-auto mb-4 text-primary" />
                    <h3 className="font-semibold mb-2">{method.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {method.description}
                    </p>
                    <div className="space-y-1">
                      <p className="font-medium text-sm">{method.contact}</p>
                      <p className="text-xs text-muted-foreground">{method.hours}</p>
                      {method.available && (
                        <Badge variant="secondary" className="text-xs">
                          Available Now
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle>Send us a Message</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="category">Category</Label>
                    <select 
                      id="category"
                      className="w-full border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      required
                    >
                      <option value="">Select a category</option>
                      <option value="orders">Orders & Shipping</option>
                      <option value="returns">Returns & Refunds</option>
                      <option value="account">Account & Billing</option>
                      <option value="products">Products & Inventory</option>
                      <option value="technical">Technical Support</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      placeholder="Brief description of your inquiry"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      rows={6}
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      placeholder="Please provide details about your inquiry..."
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full">
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Office Locations & FAQ */}
            <div className="space-y-6">
              {/* Office Locations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Our Offices
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {officeLocations.map((office, index) => (
                      <div key={index} className="border-b pb-4 last:border-b-0">
                        <h3 className="font-semibold mb-2">{office.city}</h3>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <p className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            {office.address}
                          </p>
                          <p className="flex items-center gap-2">
                            <Phone className="h-4 w-4 flex-shrink-0" />
                            {office.phone}
                          </p>
                          <p className="flex items-center gap-2">
                            <Mail className="h-4 w-4 flex-shrink-0" />
                            {office.email}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick FAQ */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HelpCircle className="h-5 w-5" />
                    Popular Help Topics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {faqCategories.map((category, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                        <span className="font-medium">{category.name}</span>
                        <Badge variant="secondary">{category.count} articles</Badge>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <Button variant="outline" className="w-full">
                      Visit Help Center
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Business Hours */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Business Hours
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Monday - Friday</span>
                      <span className="font-medium">9:00 AM - 6:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Saturday</span>
                      <span className="font-medium">10:00 AM - 4:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sunday</span>
                      <span className="text-muted-foreground">Closed</span>
                    </div>
                    <div className="pt-3 border-t">
                      <p className="text-sm text-muted-foreground">
                        All times are West Africa Time (WAT)
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Emergency Contact */}
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-6 text-center">
              <h3 className="font-semibold text-red-800 mb-2">Emergency Support</h3>
              <p className="text-red-700 mb-4">
                For urgent issues like unauthorized transactions or account security concerns
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a href="tel:+2341234567890" className="inline-block">
                  <Button variant="destructive">
                    <Phone className="h-4 w-4 mr-2" />
                    Emergency Hotline
                  </Button>
                </a>
                <a href="mailto:emergency@goshop.com" className="inline-block">
                  <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-100">
                    <Mail className="h-4 w-4 mr-2" />
                    Emergency Email
                  </Button>
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
