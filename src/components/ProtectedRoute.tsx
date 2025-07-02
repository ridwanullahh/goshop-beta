
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useCommerce } from '@/context/CommerceContext';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  allowedRoles?: string[];
  requireOnboarding?: boolean;
}

export function ProtectedRoute({ 
  children, 
  requireAuth = true, 
  allowedRoles = [], 
  requireOnboarding = false 
}: ProtectedRouteProps) {
  const { currentUser, isLoading } = useCommerce();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check authentication
  if (requireAuth && !currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role permissions
  if (allowedRoles.length > 0 && currentUser) {
    const userRoles = currentUser.roles || [currentUser.role];
    const hasPermission = allowedRoles.some(role => userRoles.includes(role));
    
    if (!hasPermission) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // Check onboarding completion
  if (requireOnboarding && currentUser && !currentUser.onboardingCompleted) {
    const userRole = currentUser.roles?.[0] || currentUser.role;
    return <Navigate to={`/${userRole}-onboarding`} replace />;
  }

  return <>{children}</>;
}
