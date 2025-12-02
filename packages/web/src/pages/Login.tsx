
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useCommerce } from '@/context/CommerceContext';
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Login = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [otpRequired, setOtpRequired] = useState(false);
  const [otp, setOtp] = useState('');
  
  const { login, sdk } = useCommerce();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const user = await login({ email, password });
      
      if (user) {
        toast({
          title: "Welcome back!",
          description: "You have been successfully logged in."
        });
        
        // Get user role from the returned user object
        const userRole = user.roles?.[0] || user.role;
        
        // Redirect based on user role
        if (userRole === 'admin') {
          navigate('/admin-dashboard');
        } else if (userRole === 'seller') {
          navigate('/seller-dashboard');
        } else {
          navigate('/customer-dashboard');
        }
      }
    } catch (error) {
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "Invalid credentials",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // In a real implementation, you'd verify OTP here
      toast({
        title: "Login Successful",
        description: "OTP verified successfully."
      });
      
      // Redirect to appropriate dashboard
      navigate('/customer-dashboard');
    } catch (error) {
      toast({
        title: "OTP Verification Failed",
        description: "Invalid or expired OTP code.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (otpRequired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-subtle px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{t('verify_your_email')}</CardTitle>
            <CardDescription>
              {t('verification_code_sent', { email })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">{t('verification_code')}</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder={t('enter_6_digit_code')}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  className="text-center text-lg"
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                variant="commerce"
                disabled={isLoading || otp.length !== 6}
              >
                {isLoading ? t('verifying') : t('verify_and_login')}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setOtpRequired(false)}
              >
                {t('back_to_login')}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="h-12 w-12 bg-gradient-commerce rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">C</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">{t('welcome_back')}</CardTitle>
          <CardDescription>
            {t('signin_to_account')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('email')}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder={t('enter_your_email')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">{t('password')}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t('enter_your_password')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Link 
                to="/forgot-password" 
                className="text-sm text-primary hover:underline"
              >
                {t('forgot_password')}
              </Link>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              variant="commerce"
              disabled={isLoading}
            >
              {isLoading ? t('signing_in') : t('sign_in')}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>

          <div className="mt-6">
            <Separator className="my-4" />
            <div className="text-center text-sm text-muted-foreground">
              <Trans i18nKey="dont_have_account">
                Don't have an account?{' '}
                <Link to="/register" className="text-primary hover:underline font-medium">
                  Sign up for free
                </Link>
              </Trans>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
