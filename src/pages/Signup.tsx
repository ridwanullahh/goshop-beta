
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useCommerce } from '@/context/CommerceContext';
import { toast } from 'sonner';
import { User, ShoppingBag, Store, TrendingUp, Eye, EyeOff } from 'lucide-react';

export default function Signup() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { sdk, language, currency } = useCommerce();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    role: 'customer',
    businessName: '',
    phone: '',
    agreeTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.agreeTerms) {
      toast.error('Please agree to the terms and conditions');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (!sdk) {
      toast.error('SDK not initialized');
      return;
    }

    setLoading(true);
    try {
      const profile = {
        name: formData.name,
        role: formData.role,
        roles: [formData.role],
        businessName: formData.businessName,
        phone: formData.phone,
        onboardingCompleted: false,
        language,
        currency,
      };

      const user = await sdk.register({ // Fixed: changed to object parameter
        email: formData.email,
        password: formData.password,
        ...profile
      });
      
      // Create role-specific profiles
      if (formData.role === 'seller') {
        await sdk.createSeller({
          userId: user.id,
          businessName: formData.businessName || formData.name,
          description: '',
          isVerified: false
        });
      } else if (formData.role === 'affiliate') {
        await sdk.createAffiliate({
          userId: user.id,
          commissionRate: 0.05, // 5% default commission
          businessName: formData.businessName || formData.name,
          isActive: true
        });
      }

      // Create wallet for user
      await sdk.createWallet(user.id);

      toast.success('Account created successfully! Please check your email for verification.');
      navigate('/login');
    } catch (error: any) {
      console.error('Signup error:', error);
      toast.error(error.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const roleOptions = [
    {
      value: 'customer',
      label: t('customer'),
      description: t('customer_desc'),
      icon: User
    },
    {
      value: 'seller',
      label: t('seller'),
      description: t('seller_desc'),
      icon: Store
    },
    {
      value: 'affiliate',
      label: t('affiliate'),
      description: t('affiliate_desc'),
      icon: TrendingUp
    }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <ShoppingBag className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">{t('create_account')}</CardTitle>
          <CardDescription>
            {t('choose_account_type')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Selection */}
            <div>
              <Label htmlFor="role">{t('account_type')}</Label>
              <div className="grid grid-cols-1 gap-3 mt-2">
                {roleOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <div
                      key={option.value}
                      onClick={() => handleChange('role', option.value)}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        formData.role === option.value
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="h-5 w-5" />
                        <div>
                          <p className="font-medium">{option.label}</p>
                          <p className="text-sm text-muted-foreground">{option.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Personal Information */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">{t('full_name')}</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  required
                  placeholder={t('full_name')}
                />
              </div>

              <div>
                <Label htmlFor="email">{t('email_address')}</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  required
                  placeholder={t('email_address')}
                />
              </div>

              {(formData.role === 'seller' || formData.role === 'affiliate') && (
                <div>
                  <Label htmlFor="businessName">
                    {formData.role === 'seller' ? t('business_name') : t('brand_business_name')}
                  </Label>
                  <Input
                    id="businessName"
                    type="text"
                    value={formData.businessName}
                    onChange={(e) => handleChange('businessName', e.target.value)}
                    placeholder={formData.role === 'seller' ? t('business_name') : t('brand_business_name')}
                  />
                </div>
              )}

              <div>
                <Label htmlFor="phone">{t('phone_optional')}</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder={t('phone_optional')}
                />
              </div>

              <div>
                <Label htmlFor="password">{t('password')}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    required
                    placeholder={t('password')}
                    minLength={6}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="confirmPassword">{t('confirm_password')}</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  required
                  placeholder={t('confirm_password')}
                />
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                checked={formData.agreeTerms}
                onCheckedChange={(checked) => handleChange('agreeTerms', checked)}
              />
              <Label htmlFor="terms" className="text-sm">
                <Trans i18nKey="agree_terms">
                  I agree to the <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                </Trans>
              </Label>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t('creating_account') : t('create_account')}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              <Trans i18nKey="already_have_account">
                Already have an account? <Link to="/login" className="text-primary hover:underline font-medium">Sign in</Link>
              </Trans>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
