
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useCommerce } from '@/context/CommerceContext';
import {
  Store,
  FileText,
  CreditCard,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Upload,
  Shield,
  AlertCircle,
  Check,
  X,
  Globe,
  Phone,
  Building
} from 'lucide-react';

const SellerOnboarding = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState({
    businessInfo: {
      businessName: '',
      businessType: '',
      description: '',
      website: '',
      phone: '',
      storeSlug: '',
      location: ''
    },
    verification: {
      businessLicense: null as File | null,
      taxId: '',
      bankAccount: '',
      routingNumber: ''
    },
    policies: {
      shippingPolicy: '',
      returnPolicy: '',
      processingTime: '1-3'
    }
  });

  const [slugAvailability, setSlugAvailability] = useState<{
    isChecking: boolean;
    isAvailable: boolean | null;
    message: string;
  }>({
    isChecking: false,
    isAvailable: null,
    message: ''
  });

  const [sellerAgreement, setSellerAgreement] = useState<any>(null);
  const [agreementAccepted, setAgreementAccepted] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();
  const { sdk, currentUser } = useCommerce();
  const totalSteps = 5; // Added agreement step

  // Debounced slug validation
  const checkSlugAvailability = useCallback(async (slug: string) => {
    if (!sdk || !slug || slug.length < 3) {
      setSlugAvailability({
        isChecking: false,
        isAvailable: null,
        message: slug.length > 0 && slug.length < 3 ? 'Slug must be at least 3 characters' : ''
      });
      return;
    }

    setSlugAvailability(prev => ({ ...prev, isChecking: true }));

    try {
      const isAvailable = await sdk.checkStoreSlugAvailability(slug);
      setSlugAvailability({
        isChecking: false,
        isAvailable,
        message: isAvailable ? 'Slug is available!' : 'This slug is already taken'
      });
    } catch (error) {
      setSlugAvailability({
        isChecking: false,
        isAvailable: null,
        message: 'Error checking availability'
      });
    }
  }, [sdk]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (onboardingData.businessInfo.storeSlug) {
        checkSlugAvailability(onboardingData.businessInfo.storeSlug);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [onboardingData.businessInfo.storeSlug, checkSlugAvailability]);

  useEffect(() => {
    loadSellerAgreement();
  }, []);

  const loadSellerAgreement = async () => {
    if (!sdk) return;

    try {
      const agreement = await sdk.getActiveSellerAgreement();
      setSellerAgreement(agreement);
    } catch (error) {
      console.error('Error loading seller agreement:', error);
    }
  };

  const handleBusinessInfoChange = (field: string, value: string) => {
    setOnboardingData(prev => ({
      ...prev,
      businessInfo: { ...prev.businessInfo, [field]: value }
    }));
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
    if (!sdk || !currentUser) {
      toast({
        title: "Error",
        description: "Please log in to complete onboarding.",
        variant: "destructive"
      });
      return;
    }

    if (!slugAvailability.isAvailable) {
      toast({
        title: "Invalid Store Slug",
        description: "Please choose an available store slug.",
        variant: "destructive"
      });
      return;
    }

    if (!agreementAccepted) {
      toast({
        title: "Agreement Required",
        description: "Please accept the seller agreement to continue.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Create store record
      const storeData = {
        name: onboardingData.businessInfo.businessName,
        slug: onboardingData.businessInfo.storeSlug,
        description: onboardingData.businessInfo.description,
        sellerId: currentUser.id,
        businessType: onboardingData.businessInfo.businessType,
        website: onboardingData.businessInfo.website,
        phone: onboardingData.businessInfo.phone,
        location: onboardingData.businessInfo.location,
        policies: {
          shipping: onboardingData.policies.shippingPolicy,
          returns: onboardingData.policies.returnPolicy,
          processingTime: onboardingData.policies.processingTime
        },
        isApproved: false,
        isActive: false,
        isVerified: false
      };

      await sdk.createStore(storeData);

      // Update user to mark onboarding as completed
      await sdk.sdk.update('users', currentUser.id, {
        onboardingCompleted: true,
        storeSlug: onboardingData.businessInfo.storeSlug
      });

      toast({
        title: "Seller Application Submitted!",
        description: "We'll review your application and get back to you within 24 hours."
      });

      navigate('/seller-dashboard');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast({
        title: "Error",
        description: "Failed to submit application. Please try again.",
        variant: "destructive"
      });
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
                <Label htmlFor="businessType">Business Type</Label>
                <Input
                  id="businessType"
                  value={onboardingData.businessInfo.businessType}
                  onChange={(e) => handleBusinessInfoChange('businessType', e.target.value)}
                  placeholder="e.g., LLC, Corporation, Sole Proprietorship"
                />
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
              
              <div>
                <Label htmlFor="storeSlug">Store URL Slug *</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">{window.location.origin}/</span>
                    <Input
                      id="storeSlug"
                      value={onboardingData.businessInfo.storeSlug}
                      onChange={(e) => {
                        const slug = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                        handleBusinessInfoChange('storeSlug', slug);
                      }}
                      placeholder="your-store-name"
                      className="flex-1"
                      required
                    />
                    {slugAvailability.isChecking && (
                      <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                    )}
                    {slugAvailability.isAvailable === true && (
                      <Check className="h-4 w-4 text-green-500" />
                    )}
                    {slugAvailability.isAvailable === false && (
                      <X className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  {slugAvailability.message && (
                    <p className={`text-xs ${
                      slugAvailability.isAvailable === true ? 'text-green-600' :
                      slugAvailability.isAvailable === false ? 'text-red-600' :
                      'text-muted-foreground'
                    }`}>
                      {slugAvailability.message}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    This will be your store's direct URL. Choose something memorable and professional.
                  </p>
                </div>
              </div>

              <div>
                <Label htmlFor="location">Business Location *</Label>
                <Input
                  id="location"
                  value={onboardingData.businessInfo.location}
                  onChange={(e) => handleBusinessInfoChange('location', e.target.value)}
                  placeholder="City, State/Province, Country"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="website">Website</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="website"
                      type="url"
                      value={onboardingData.businessInfo.website}
                      onChange={(e) => handleBusinessInfoChange('website', e.target.value)}
                      placeholder="https://your-website.com"
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      value={onboardingData.businessInfo.phone}
                      onChange={(e) => handleBusinessInfoChange('phone', e.target.value)}
                      placeholder="+1 (555) 123-4567"
                      className="pl-10"
                      required
                    />
                  </div>
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
              <FileText className="h-16 w-16 mx-auto mb-4 text-blue-500" />
              <h2 className="text-2xl font-bold">Seller Agreement</h2>
              <p className="text-muted-foreground mt-2">
                Please review and accept our seller agreement
              </p>
            </div>

            {sellerAgreement ? (
              <div className="space-y-4">
                <div className="max-h-96 overflow-y-auto border rounded-lg p-4 bg-muted/20">
                  <div className="prose prose-sm max-w-none">
                    <div className="whitespace-pre-wrap">
                      {(() => {
                        let content = sellerAgreement.content;
                        Object.entries(sellerAgreement.variables || {}).forEach(([key, value]) => {
                          content = content.replace(new RegExp(`{{${key}}}`, 'g'), value as string);
                        });
                        return content;
                      })()}
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 border rounded-lg">
                  <input
                    type="checkbox"
                    id="agreement-accept"
                    checked={agreementAccepted}
                    onChange={(e) => setAgreementAccepted(e.target.checked)}
                    className="mt-1"
                  />
                  <label htmlFor="agreement-accept" className="text-sm">
                    I have read and agree to the seller agreement terms and conditions.
                    I understand the commission structure and my responsibilities as a seller.
                  </label>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading seller agreement...</p>
              </div>
            )}
          </div>
        );

      case 5:
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
                (currentStep === 2 && !onboardingData.verification.businessLicense) ||
                (currentStep === 4 && !agreementAccepted)
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
