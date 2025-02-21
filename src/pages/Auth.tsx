
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthForm } from '@/components/auth/AuthForm';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Check if user has completed onboarding
        const { data: profile } = await supabase
          .from('profiles')
          .select('grade, subjects, goals')
          .eq('id', session.user.id)
          .single();

        if (!profile?.grade?.length && !profile?.subjects?.length && !profile?.goals?.length) {
          navigate('/onboarding');
        } else {
          navigate('/dashboard');
        }
      }
    };
    checkUser();
  }, [navigate]);

  const handleSuccess = async () => {
    if (!isLogin) {
      toast.success('Account created successfully!');
      navigate('/onboarding');
    } else {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('grade, subjects, goals')
          .eq('id', session.user.id)
          .single();

        if (!profile?.grade?.length && !profile?.subjects?.length && !profile?.goals?.length) {
          navigate('/onboarding');
        } else {
          toast.success('Welcome back!');
          navigate('/dashboard');
        }
      }
    }
  };

  const handleError = (error: string) => {
    toast.error(error);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-display font-bold text-gray-900">
          {isLogin ? 'Sign in to your account' : 'Create your account'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="font-medium text-primary hover:text-primary-dark transition-colors"
          >
            {isLogin ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <AuthForm
            mode={isLogin ? 'login' : 'register'}
            onSuccess={handleSuccess}
            onError={handleError}
          />
        </div>
      </div>
    </div>
  );
};

export default Auth;
