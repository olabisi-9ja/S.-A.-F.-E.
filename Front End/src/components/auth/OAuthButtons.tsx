import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface OAuthButtonsProps {
  onError?: (error: string) => void;
  isLoading?: boolean;
  mode?: 'login' | 'register';
}

export function OAuthButtons({ onError, isLoading, mode = 'login' }: OAuthButtonsProps) {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleSuccess = async (credentialResponse: any) => {
    try {
      setIsGoogleLoading(true);
      // credentialResponse.credential is the ID Token
      if (!credentialResponse.credential) throw new Error('No credential received');
      
      const result = await loginWithGoogle(credentialResponse.credential);
      if (result.success) {
        navigate('/home'); // AuthContext already redirects admins
      } else {
        onError?.(result.error || 'Google login failed.');
      }
    } catch (err) {
      onError?.('An error occurred during Google login.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const loading = isLoading || isGoogleLoading;

  return (
    <div className="space-y-3 w-full flex flex-col items-center pointer-events-auto relative z-10">
      {loading ? (
        <div className="text-sm text-gray-500 py-2">Connecting...</div>
      ) : (
        <div className="w-full relative z-20 flex justify-center">
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={() => onError?.('Google login was cancelled or failed.')}
            theme="outline"
            size="large"
            width="100%"
            text={mode === 'register' ? 'signup_with' : 'signin_with'}
            shape="rectangular"
            logo_alignment="center"
          />
        </div>
      )}
      {/* Apple is stubbed out for now as requested */}
    </div>
  );
}
