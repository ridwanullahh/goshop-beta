
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCommerce } from '@/context/CommerceContext';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Users, DollarSign, TrendingUp } from 'lucide-react';

export default function AffiliateOnboarding() {
  const navigate = useNavigate();
  const { sdk, currentUser } = useCommerce();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    businessName: '',
    website: '',
    socialMedia: '',
    experience: '',
    promotionMethods: '',
    expectedTraffic: '',
    bankAccount: '',
    taxId: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    }
  };

  const handleComplete = async () => {
    if (!sdk || !currentUser) return;

    try {
      await sdk.createAffiliate({
        userId: currentUser.id,
        businessName: formData.businessName,
        website: formData.website,
        commissionRate: 5, // Default 5%
        isActive: true
      });

      // Mark onboarding as completed
      toast({
        title: "Welcome to our Affiliate Program!",
        description: "Your application has been submitted for review."
      });

      navigate('/affiliate-dashboard');
    } catch (error) {
      toast({
        title: "Application Failed",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  };

  const steps = [
    {
      title: "Welcome to Affiliate Program",
      icon: Users,
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Join Our Affiliate Program</h2>
            <p className="text-muted-foreground mb-6">
              Earn commissions by promoting our products to your audience
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <h3 className="font-semibold">Earn 5-15%</h3>
              <p className="text-sm text-muted-foreground">Commission on every sale</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <h3 className="font-semibold">Real-time Tracking</h3>
              <p className="text-sm text-muted-foreground">Monitor your performance</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Users className="h-8 w-8 mx-auto mb-2 text-purple-500" />
              <h3 className="font-semibold">Marketing Support</h3>
              <p className="text-sm text-muted-foreground">Tools and resources</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Business Information",
      icon: Users,
      content: (
        <div className="space-y-4">
          <div>
            <Label htmlFor="businessName">Business/Brand Name</Label>
            <Input
              id="businessName"
              value={formData.businessName}
              onChange={(e) => handleInputChange('businessName', e.target.value)}
              placeholder="Your business or brand name"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="website">Website URL</Label>
            <Input
              id="website"
              type="url"
              value={formData.website}
              onChange={(e) => handleInputChange('website', e.target.value)}
              placeholder="https://yourwebsite.com"
            />
          </div>
          
          <div>
            <Label htmlFor="socialMedia">Primary Social Media</Label>
            <Input
              id="socialMedia"
              value={formData.socialMedia}
              onChange={(e) => handleInputChange('socialMedia', e.target.value)}
              placeholder="Instagram, YouTube, TikTok, etc."
            />
          </div>
        </div>
      )
    },
    {
      title: "Marketing Details",
      icon: TrendingUp,
      content: (
        <div className="space-y-4">
          <div>
            <Label htmlFor="experience">Marketing Experience</Label>
            <Textarea
              id="experience"
              value={formData.experience}
              onChange={(e) => handleInputChange('experience', e.target.value)}
              placeholder="Tell us about your marketing experience..."
              rows={3}
            />
          </div>
          
          <div>
            <Label htmlFor="promotionMethods">How will you promote our products?</Label>
            <Textarea
              id="promotionMethods"
              value={formData.promotionMethods}
              onChange={(e) => handleInputChange('promotionMethods', e.target.value)}
              placeholder="Social media, blog posts, email marketing, etc."
              rows={3}
            />
          </div>
          
          <div>
            <Label htmlFor="expectedTraffic">Expected Monthly Traffic/Reach</Label>
            <Input
              id="expectedTraffic"
              value={formData.expectedTraffic}
              onChange={(e) => handleInputChange('expectedTraffic', e.target.value)}
              placeholder="e.g., 10,000 monthly visitors"
            />
          </div>
        </div>
      )
    },
    {
      title: "Payment Information",
      icon: DollarSign,
      content: (
        <div className="space-y-4">
          <div>
            <Label htmlFor="bankAccount">Bank Account Details</Label>
            <Input
              id="bankAccount"
              value={formData.bankAccount}
              onChange={(e) => handleInputChange('bankAccount', e.target.value)}
              placeholder="Account number or PayPal email"
            />
          </div>
          
          <div>
            <Label htmlFor="taxId">Tax ID (Optional)</Label>
            <Input
              id="taxId"
              value={formData.taxId}
              onChange={(e) => handleInputChange('taxId', e.target.value)}
              placeholder="For tax reporting purposes"
            />
          </div>
          
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Commission Structure</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Standard products: 5% commission</li>
              <li>• Premium products: 8% commission</li>
              <li>• High-value items ($500+): 10% commission</li>
              <li>• Performance bonuses available</li>
            </ul>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <CardTitle className="flex items-center gap-2">
                  {React.createElement(steps[step - 1].icon, { className: "h-6 w-6" })}
                  {steps[step - 1].title}
                </CardTitle>
                <span className="text-sm text-muted-foreground">
                  Step {step} of {steps.length}
                </span>
              </div>
              
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(step / steps.length) * 100}%` }}
                />
              </div>
            </CardHeader>
            
            <CardContent>
              {steps[step - 1].content}
              
              <div className="flex justify-between mt-8">
                <Button
                  variant="outline"
                  onClick={() => setStep(Math.max(1, step - 1))}
                  disabled={step === 1}
                >
                  Previous
                </Button>
                
                {step === steps.length ? (
                  <Button onClick={handleComplete} variant="commerce">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Complete Application
                  </Button>
                ) : (
                  <Button onClick={handleNext}>
                    Next
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
