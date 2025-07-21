
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Progress } from '../components/ui/progress';
import {
  Store,
  FileText,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Upload,
  Shield,
  Loader2,
  AlertCircle,
  Check
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { useCommerce } from '../context/CommerceContext';
import { debounce } from 'lodash';

const SellerOnboarding = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState({
    businessInfo: {
      businessName: '',
      storeSlug: '',
      description: '',
      website: '',
      phone: ''
    },
    verification: {
      businessLicense: null as File | null,
      taxId: '',
    },
    policies: {
      shippingPolicy: '',
      returnPolicy: '',
    }
  });
  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'available' | 'unavailable'>('idle');

  const navigate = useNavigate();
  const { toast } = useToast();
  const { sdk, user } = useCommerce();
  const totalSteps = 4;

  const checkSlugAvailability = useCallback(
    debounce(async (slug: string) => {
      if (!sdk || slug.length < 3) {
        setSlugStatus('idle');
        return;
      }
      setSlugStatus('checking');
      const isAvailable = await sdk.checkStoreSlugAvailability(slug);
      setSlugStatus(isAvailable ? 'available' : 'unavailable');
    }, 500),
    [sdk]
  );

  const handleBusinessInfoChange = (field: string, value: string) => {
    setOnboardingData(prev => ({
      ...prev,
      businessInfo: { ...prev.businessInfo, [field]: value }
    }));
    if (field === 'storeSlug') {
      checkSlugAvailability(value);
    }
  };

  const handleVerificationChange = (field: string, value: string) => {
    setOnboardingData(prev => ({
      ...prev,
      verification: { ...prev.verification, [field]: value }
    }));
  };

  const handlePolicyChange = (field: string, value: string) => {
    setOnboardingData(prev => ({
      ...prev,
      policies: { ...prev.policies, [field]: value }
    }));
  };

  const handleFileUpload = (file: File) => {
    setOnboardingData(prev => ({
      ...prev,
      verification: { ...prev.verification, businessLicense: file }
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

  const handleComplete = async () => {
    if (!sdk || !user) {
      toast({ title: "Error", description: "Not authenticated.", variant: "destructive" });
      return;
    }

    try {
      // In a real app, you'd upload the license file and get a URL
      const storeData = {
        name: onboardingData.businessInfo.businessName,
        slug: onboardingData.businessInfo.storeSlug,
        description: onboardingData.businessInfo.description,
        ownerId: user.id,
        sellerId: user.id,
        approvalStatus: 'pending',
        onboardingData: onboardingData, // Save all data for review
        isVerified: false,
      };
      
      await sdk.update('stores', '', storeData); // Using update to create a new store
      
      // Update user to mark onboarding as initiated
      await sdk.update('users', user.id, { onboardingStatus: 'pending_review' });

      toast({
        title: "Seller Application Submitted!",
        description: "We'll review your application and get back to you within 24 hours."
      });

      setCurrentStep(totalSteps); // Move to the final confirmation screen
    } catch (error) {
      console.error("Failed to submit application:", error);
      toast({ title: "Submission Failed", description: "Could not submit application.", variant: "destructive" });
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Store className="h-16 w-16 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-bold">Business Information</h2>
              <p className="text-muted-foreground mt-2">
                Tell us about your business
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="businessName">Business Name *</Label>
                <Input
                  id="businessName"
                  value={onboardingData.businessInfo.businessName}
                  onChange={(e) => handleBusinessInfoChange('businessName', e.target.value)}
                  placeholder="Your Business Name"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="storeSlug">Store URL Slug *</Label>
                <div className="relative">
                  <Input
                    id="storeSlug"
                    value={onboardingData.businessInfo.storeSlug}
                    onChange={(e) => handleBusinessInfoChange('storeSlug', e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                    placeholder="your-store-name"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    {slugStatus === 'checking' && <Loader2 className="h-4 w-4 animate-spin" />}
                    {slugStatus === 'available' && <Check className="h-4 w-4 text-green-500" />}
                    {slugStatus === 'unavailable' && <AlertCircle className="h-4 w-4 text-red-500" />}
                  </div>
                </div>
                {slugStatus === 'unavailable' && <p className="text-sm text-red-500 mt-1">This URL is already taken.</p>}
                <p className="text-sm text-muted-foreground mt-1">your-store.com/{onboardingData.businessInfo.storeSlug}</p>
              </div>

              <div>
                <Label htmlFor="description">Business Description *</Label>
                <Textarea
                  id="description"
                  value={onboardingData.businessInfo.description}
                  onChange={(e) => handleBusinessInfoChange('description', e.target.value)}
                  placeholder="Describe your business and what you sell..."
                  rows={4}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={onboardingData.businessInfo.website}
                    onChange={(e) => handleBusinessInfoChange('website', e.target.value)}
                    placeholder="https://your-website.com"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={onboardingData.businessInfo.phone}
                    onChange={(e) => handleBusinessInfoChange('phone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    required
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Shield className="h-16 w-16 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-bold">Verification Documents</h2>
              <p className="text-muted-foreground mt-2">
                We need to verify your business for security
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="businessLicense">Business License</Label>
                <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-sm text-gray-600">
                    Click to upload your business license or registration document
                  </p>
                  <input
                    type="file"
                    className="hidden"
                    id="businessLicense"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file);
                    }}
                  />
                  <Button
                    variant="outline"
                    className="mt-2"
                    onClick={() => document.getElementById('businessLicense')?.click()}
                  >
                    Choose File
                  </Button>
                  {onboardingData.verification.businessLicense && (
                    <p className="text-sm text-green-600 mt-2">
                      ✓ {onboardingData.verification.businessLicense.name}
                    </p>
                  )}
                </div>
              </div>
              
              <div>
                <Label htmlFor="taxId">Tax ID / EIN</Label>
                <Input
                  id="taxId"
                  value={onboardingData.verification.taxId}
                  onChange={(e) => handleVerificationChange('taxId', e.target.value)}
                  placeholder="12-3456789"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bankAccount">Bank Account Number</Label>
                  <Input
                    id="bankAccount"
                    value={onboardingData.verification.bankAccount}
                    onChange={(e) => handleVerificationChange('bankAccount', e.target.value)}
                    placeholder="Account number"
                  />
                </div>
                <div>
                  <Label htmlFor="routingNumber">Routing Number</Label>
                  <Input
                    id="routingNumber"
                    value={onboardingData.verification.routingNumber}
                    onChange={(e) => handleVerificationChange('routingNumber', e.target.value)}
                    placeholder="123456789"
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
              <FileText className="h-16 w-16 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-bold">Store Policies</h2>
              <p className="text-muted-foreground mt-2">
                Set up your customer policies
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="processingTime">Order Processing Time</Label>
                <select
                  id="processingTime"
                  value={onboardingData.policies.processingTime}
                  onChange={(e) => handlePolicyChange('processingTime', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="1-3">1-3 business days</option>
                  <option value="3-5">3-5 business days</option>
                  <option value="5-7">5-7 business days</option>
                  <option value="7-14">1-2 weeks</option>
                </select>
              </div>
              
              <div>
                <Label htmlFor="shippingPolicy">Shipping Policy</Label>
                <Textarea
                  id="shippingPolicy"
                  value={onboardingData.policies.shippingPolicy}
                  onChange={(e) => handlePolicyChange('shippingPolicy', e.target.value)}
                  placeholder="Describe your shipping methods, costs, and delivery times..."
                  rows={4}
                />
              </div>
              
              <div>
                <Label htmlFor="returnPolicy">Return Policy</Label>
                <Textarea
                  id="returnPolicy"
                  value={onboardingData.policies.returnPolicy}
                  onChange={(e) => handlePolicyChange('returnPolicy', e.target.value)}
                  placeholder="Describe your return and refund policy..."
                  rows={4}
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
              <h2 className="text-2xl font-bold">Application Submitted!</h2>
              <p className="text-muted-foreground mt-2">
                We're reviewing your seller application
              </p>
            </div>
            
            <div className="bg-muted/50 p-6 rounded-lg">
              <h3 className="font-semibold mb-4">What Happens Next?</h3>
              <ul className="space-y-3">
                <li className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>We'll review your business information</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Verify your documents (1-2 business days)</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Approve your seller account</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Start selling on CommerceOS!</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900">While You Wait</h4>
              <p className="text-sm text-blue-700 mt-1">
                You can start preparing your product catalog and store branding. 
                We'll notify you as soon as your account is approved!
              </p>
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
              <CardTitle>Seller Setup</CardTitle>
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
              disabled={
                (currentStep === 1 && (!onboardingData.businessInfo.businessName || !onboardingData.businessInfo.description)) ||
                (currentStep === 2 && !onboardingData.verification.businessLicense)
              }
            >
              {currentStep === totalSteps ? 'Submit Application' : 'Next'}
              {currentStep !== totalSteps && <ArrowRight className="h-4 w-4 ml-2" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SellerOnboarding;
