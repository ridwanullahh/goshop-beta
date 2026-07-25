
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { useCommerce } from '@/context/CommerceContext';
import { toast } from 'sonner';
import { 
  Store, 
  User, 
  Share2, 
  Shield, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft 
} from 'lucide-react';

interface OnboardingFlowProps {
  userRole: 'customer' | 'seller' | 'affiliate' | 'admin';
  onComplete: () => void;
}

export function OnboardingFlow({ userRole, onComplete }: OnboardingFlowProps) {
  const navigate = useNavigate();
  const { currentUser, sdk } = useCommerce();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Common fields
    firstName: '',
    lastName: '',
    phone: '',
    avatar: '',
    
    // Seller specific
    businessName: '',
    businessDescription: '',
    businessAddress: '',
    businessPhone: '',
    storeSlug: '',
    businessCategory: '',
    
    // Affiliate specific
    website: '',
    socialMedia: '',
    marketingExperience: '',
    
    // Terms and conditions
    agreedToTerms: false,
    agreedToPrivacy: false
  });

  const totalSteps = userRole === 'customer' ? 2 : userRole === 'seller' ? 4 : 3;
  const progress = (currentStep / totalSteps) * 100;

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = () => {
    switch (currentStep) {
      case 1:
        return formData.firstName && formData.lastName;
      case 2:
        if (userRole === 'customer') {
          return formData.agreedToTerms && formData.agreedToPrivacy;
        }
        if (userRole === 'seller') {
          return formData.businessName && formData.businessDescription;
        }
        if (userRole === 'affiliate') {
          return formData.website || formData.socialMedia;
        }
        return true;
      case 3:
        if (userRole === 'seller') {
          return formData.storeSlug && formData.businessCategory;
        }
        return formData.agreedToTerms && formData.agreedToPrivacy;
      case 4:
        return formData.agreedToTerms && formData.agreedToPrivacy;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep(prev => prev + 1);
    } else {
      toast.error('Please fill in all required fields');
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleComplete = async () => {
    if (!validateStep()) {
      toast.error('Please complete all required fields');
      return;
    }

    try {
      // Update user profile
      if (currentUser && sdk) {
        const updateData = {
          name: `${formData.firstName} ${formData.lastName}`,
          phone: formData.phone,
          onboardingCompleted: true,
          ...(userRole === 'seller' && {
            businessName: formData.businessName,
            businessDescription: formData.businessDescription,
            businessCategory: formData.businessCategory
          })
        };

        // Create seller profile if seller
        if (userRole === 'seller') {
          await sdk.createSeller({
            userId: currentUser.id,
            businessName: formData.businessName,
            description: formData.businessDescription,
            category: formData.businessCategory,
            verified: false,
            rating: 0,
            totalSales: 0
          });
        }

        // Create affiliate profile if affiliate
        if (userRole === 'affiliate') {
          await sdk.createAffiliate({
            userId: currentUser.id,
            businessName: formData.businessName || `${formData.firstName} ${formData.lastName}`,
            website: formData.website,
            commissionRate: 0.05, // 5% default
            totalEarnings: 0,
            isActive: true
          });
        }

        toast.success('Onboarding completed successfully!');
        onComplete();
        
        // Navigate to appropriate dashboard
        switch (userRole) {
          case 'seller':
            navigate('/seller-dashboard');
            break;
          case 'affiliate':
            navigate('/affiliate-dashboard');
            break;
          case 'admin':
            navigate('/admin-dashboard');
            break;
          default:
            navigate('/customer-dashboard');
        }
      }
    } catch (error) {
      console.error('Onboarding error:', error);
      toast.error('Failed to complete onboarding');
    }
  };

  const renderPersonalInfoStep = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <User className="h-12 w-12 mx-auto text-primary mb-2" />
        <h3 className="text-lg font-semibold">Personal Information</h3>
        <p className="text-muted-foreground">Tell us about yourself</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            placeholder="Enter your first name"
          />
        </div>
        <div>
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            placeholder="Enter your last name"
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          value={formData.phone}
          onChange={(e) => handleInputChange('phone', e.target.value)}
          placeholder="Enter your phone number"
        />
      </div>
    </div>
  );

  const renderBusinessInfoStep = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <Store className="h-12 w-12 mx-auto text-primary mb-2" />
        <h3 className="text-lg font-semibold">Business Information</h3>
        <p className="text-muted-foreground">Set up your business profile</p>
      </div>
      
      <div>
        <Label htmlFor="businessName">Business Name *</Label>
        <Input
          id="businessName"
          value={formData.businessName}
          onChange={(e) => handleInputChange('businessName', e.target.value)}
          placeholder="Enter your business name"
        />
      </div>
      
      <div>
        <Label htmlFor="businessDescription">Business Description *</Label>
        <Textarea
          id="businessDescription"
          value={formData.businessDescription}
          onChange={(e) => handleInputChange('businessDescription', e.target.value)}
          placeholder="Describe your business..."
        />
      </div>
      
      {userRole === 'affiliate' && (
        <>
          <div>
            <Label htmlFor="website">Website URL</Label>
            <Input
              id="website"
              value={formData.website}
              onChange={(e) => handleInputChange('website', e.target.value)}
              placeholder="https://yourwebsite.com"
            />
          </div>
          <div>
            <Label htmlFor="socialMedia">Social Media Handle</Label>
            <Input
              id="socialMedia"
              value={formData.socialMedia}
              onChange={(e) => handleInputChange('socialMedia', e.target.value)}
              placeholder="@yourusername"
            />
          </div>
        </>
      )}
    </div>
  );

  const renderStoreSetupStep = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <Store className="h-12 w-12 mx-auto text-primary mb-2" />
        <h3 className="text-lg font-semibold">Store Setup</h3>
        <p className="text-muted-foreground">Configure your online store</p>
      </div>
      
      <div>
        <Label htmlFor="storeSlug">Store URL *</Label>
        <div className="flex items-center">
          <span className="text-sm text-muted-foreground mr-2">{window.location.origin}/</span>
          <Input
            id="storeSlug"
            value={formData.storeSlug}
            onChange={(e) => handleInputChange('storeSlug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
            placeholder="your-store-name"
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          This will be your store's unique URL
        </p>
      </div>
      
      <div>
        <Label htmlFor="businessCategory">Business Category *</Label>
        <Select value={formData.businessCategory} onValueChange={(value) => handleInputChange('businessCategory', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select your business category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="electronics">Electronics</SelectItem>
            <SelectItem value="fashion">Fashion & Clothing</SelectItem>
            <SelectItem value="home">Home & Garden</SelectItem>
            <SelectItem value="health">Health & Beauty</SelectItem>
            <SelectItem value="sports">Sports & Outdoors</SelectItem>
            <SelectItem value="books">Books & Media</SelectItem>
            <SelectItem value="toys">Toys & Games</SelectItem>
            <SelectItem value="automotive">Automotive</SelectItem>
            <SelectItem value="food">Food & Beverages</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderTermsStep = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <Shield className="h-12 w-12 mx-auto text-primary mb-2" />
        <h3 className="text-lg font-semibold">Terms & Conditions</h3>
        <p className="text-muted-foreground">Please review and accept our terms</p>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-start space-x-2">
          <Checkbox
            id="terms"
            checked={formData.agreedToTerms}
            onCheckedChange={(checked) => handleInputChange('agreedToTerms', checked)}
          />
          <Label htmlFor="terms" className="text-sm">
            I agree to the <a href="/terms" className="text-primary hover:underline">Terms of Service</a>
          </Label>
        </div>
        
        <div className="flex items-start space-x-2">
          <Checkbox
            id="privacy"
            checked={formData.agreedToPrivacy}
            onCheckedChange={(checked) => handleInputChange('agreedToPrivacy', checked)}
          />
          <Label htmlFor="privacy" className="text-sm">
            I agree to the <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>
          </Label>
        </div>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderPersonalInfoStep();
      case 2:
        if (userRole === 'customer') return renderTermsStep();
        return renderBusinessInfoStep();
      case 3:
        if (userRole === 'seller') return renderStoreSetupStep();
        return renderTermsStep();
      case 4:
        return renderTermsStep();
      default:
        return renderPersonalInfoStep();
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-center">Welcome to Our Platform!</CardTitle>
          <CardDescription className="text-center">
            Let's set up your {userRole} account
          </CardDescription>
          <Progress value={progress} className="w-full" />
          <p className="text-center text-sm text-muted-foreground">
            Step {currentStep} of {totalSteps}
          </p>
        </CardHeader>
        
        <CardContent>
          {renderCurrentStep()}
          
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            
            {currentStep === totalSteps ? (
              <Button onClick={handleComplete} disabled={!validateStep()}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Complete Setup
              </Button>
            ) : (
              <Button onClick={handleNext} disabled={!validateStep()}>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
