
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const registerSchema = loginSchema.extend({
  username: z.string().min(3, 'Username must be at least 3 characters'),
});

type LoginInputs = z.infer<typeof loginSchema>;
type RegisterInputs = z.infer<typeof registerSchema>;

interface AuthFormProps {
  mode: 'login' | 'register';
  onSuccess: () => void;
  onError: (error: string) => void;
}

export const AuthForm = ({ mode, onSuccess, onError }: AuthFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const schema = mode === 'login' ? loginSchema : registerSchema;
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: LoginInputs | RegisterInputs) => {
    setIsLoading(true);
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });
        if (error) throw error;
      } else {
        const registerData = data as RegisterInputs;
        const { error } = await supabase.auth.signUp({
          email: registerData.email,
          password: registerData.password,
          options: {
            data: {
              username: registerData.username,
            },
          },
        });
        if (error) throw error;
      }
      onSuccess();
    } catch (error: any) {
      onError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email address
        </label>
        <div className="mt-1">
          <input
            id="email"
            type="email"
            {...register('email')}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>
      </div>

      {mode === 'register' && (
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700">
            Username
          </label>
          <div className="mt-1">
            <input
              id="username"
              type="text"
              {...register('username')}
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            />
            {errors.username && (
              <p className="mt-1 text-sm text-red-600">{errors.username?.message}</p>
            )}
          </div>
        </div>
      )}

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <div className="mt-1">
          <input
            id="password"
            type="password"
            {...register('password')}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : mode === 'login' ? (
          'Sign in'
        ) : (
          'Create account'
        )}
      </button>
    </form>
  );
};
