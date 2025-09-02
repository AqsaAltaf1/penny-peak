import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          setTimeout(() => navigate('/auth?error=callback_failed'), 3000);
          return;
        }

        if (data.session) {
          // Successfully authenticated, redirect to dashboard
          setTimeout(() => navigate('/'), 2000);
        } else {
          // No session found, redirect to auth page
          setTimeout(() => navigate('/auth'), 3000);
        }
      } catch (error) {
        console.error('Unexpected error:', error);
        setTimeout(() => navigate('/auth?error=unexpected'), 3000);
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="neomorph-raised border-0 shadow-none w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            Confirming your account...
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="space-y-2">
            <CheckCircle className="h-12 w-12 text-success mx-auto" />
            <p className="text-sm text-muted-foreground">
              Email confirmed successfully!
            </p>
            <p className="text-xs text-muted-foreground">
              Redirecting you to your dashboard...
            </p>
          </div>
          
          <div className="neomorph-inset p-3 rounded-lg">
            <p className="text-xs text-muted-foreground">
              If you're not redirected automatically, 
              <a href="/" className="text-primary hover:underline ml-1">
                click here
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
