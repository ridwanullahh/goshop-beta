
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { 
  ShoppingBag, 
  MapPin, 
  Heart, 
  CreditCard, 
  CheckCircle,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const CustomerOnboarding = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState({
    interests: [] as string[],
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    preferences: {
      notifications: true,
      newsletter: true,
      recommendations: true
    }
  });

  const navigate = useNavigate();
  const { toast } = useToast();
  const totalSteps = 4;

  const interests = [
    'Electronics', 'Fashion', 'Home & Garden', 'Sports & Outdoors',
    'Health & Beauty', 'Books & Education', 'Toys & Games', 'Automotive',
    'Art & Crafts', 'Food & Beverages', 'Travel', 'Music & Instruments'
  ];

  const handleInterestToggle = (interest: string) => {
    setOnboardingData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleAddressChange = (field: string, value: string) => {
    setOnboardingData(prev => ({
      ...prev,
      address: { ...prev.address, [field]: value }
    }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    // In production, save onboarding data to your SDK
    console.log('Onboarding completed:', onboardingData);
    
    toast({
      title: "Welcome to CommerceOS!",
      description: "Your account has been set up successfully."
    });

    navigate('/customer-dashboard');
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-bold">Welcome to CommerceOS!</h2>
              <p className="text-muted-foreground mt-2">
                Let's personalize your shopping experience
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">What are you interested in?</h3>
              <div className="grid grid-cols-2 gap-3">
                {interests.map((interest) => (
                  <Button
                    key={interest}
                    variant={onboardingData.interests.includes(interest) ? "default" : "outline"}
                    className="justify-start h-auto py-3"
                    onClick={() => handleInterestToggle(interest)}
                  >
                    {interest}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <MapPin className="h-16 w-16 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-bold">Shipping Address</h2>
              <p className="text-muted-foreground mt-2">
                Add your primary delivery address
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="street">Street Address</Label>
                <Input
                  id="street"
                  value={onboardingData.address.street}
                  onChange={(e) => handleAddressChange('street', e.target.value)}
                  placeholder="123 Main Street"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={onboardingData.address.city}
                    onChange={(e) => handleAddressChange('city', e.target.value)}
                    placeholder="Your city"
                  />
                </div>
                <div>
                  <Label htmlFor="state">State/Province</Label>
                  <Input
                    id="state"
                    value={onboardingData.address.state}
                    onChange={(e) => handleAddressChange('state', e.target.value)}
                    placeholder="State"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="zipCode">ZIP/Postal Code</Label>
                  <Input
                    id="zipCode"
                    value={onboardingData.address.zipCode}
                    onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                    placeholder="12345"
                  />
                </div>
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={onboardingData.address.country}
                    onChange={(e) => handleAddressChange('country', e.target.value)}
                    placeholder="Country"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Heart className="h-16 w-16 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-bold">Preferences</h2>
              <p className="text-muted-foreground mt-2">
                Customize your experience
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">Order Updates</h3>
                  <p className="text-sm text-muted-foreground">Get notified about your orders</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={onboardingData.preferences.notifications}
                    onChange={(e) => setOnboardingData(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, notifications: e.target.checked }
                    }))}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">Newsletter</h3>
                  <p className="text-sm text-muted-foreground">Receive deals and product updates</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={onboardingData.preferences.newsletter}
                    onChange={(e) => setOnboardingData(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, newsletter: e.target.checked }
                    }))}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">AI Recommendations</h3>
                  <p className="text-sm text-muted-foreground">Get personalized product suggestions</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={onboardingData.preferences.recommendations}
                    onChange={(e) => setOnboardingData(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, recommendations: e.target.checked }
                    }))}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
              <h2 className="text-2xl font-bold">You're All Set!</h2>
              <p className="text-muted-foreground mt-2">
                Your CommerceOS account is ready to use
              </p>
            </div>
            
            <div className="bg-muted/50 p-6 rounded-lg">
              <h3 className="font-semibold mb-4">What's Next?</h3>
              <ul className="space-y-3">
                <li className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Browse thousands of products</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Get AI-powered recommendations</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Enjoy fast, secure shopping</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Track your orders in real-time</span>
                </li>
              </ul>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center px-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <div>
              <CardTitle>Customer Setup</CardTitle>
              <CardDescription>Step {currentStep} of {totalSteps}</CardDescription>
            </div>
            <div className="text-sm text-muted-foreground">
              {Math.round((currentStep / totalSteps) * 100)}% Complete
            </div>
          </div>
          <Progress value={(currentStep / totalSteps) * 100} className="w-full" />
        </CardHeader>
        
        <CardContent>
          {renderStep()}
          
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            
            <Button
              onClick={handleNext}
              disabled={currentStep === 2 && !onboardingData.address.street}
            >
              {currentStep === totalSteps ? 'Complete Setup' : 'Next'}
              {currentStep !== totalSteps && <ArrowRight className="h-4 w-4 ml-2" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerOnboarding;
