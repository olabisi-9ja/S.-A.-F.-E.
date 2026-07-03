import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Shield, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';

interface VerifyEmailPageProps {
  onNavigate: (page: string) => void;
}

export function VerifyEmailPage({ onNavigate }: VerifyEmailPageProps) {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token found.');
      return;
    }

    const verifyEmail = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const response = await fetch(`${API_URL}/auth/verify?token=${token}`);
        const data = await response.json();
        
        if (data.success) {
          setStatus('success');
          setMessage(data.message);
        } else {
          setStatus('error');
          setMessage(data.error || 'Verification failed.');
        }
      } catch (err) {
        setStatus('error');
        setMessage('Network error during verification.');
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="min-h-screen bg-white">
      <div className="h-14 border-b border-gray-100 flex items-center justify-center px-5 gap-3">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-red-700" />
          <span className="font-bold text-gray-800 tracking-wider text-sm">S.A.F.E.KWASU</span>
        </div>
      </div>
      <div className="max-w-xl mx-auto px-5 py-16 text-center">
        {status === 'loading' && (
          <div>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700 mx-auto mb-4"></div>
            <h2 className="text-xl font-bold text-gray-900">Verifying Email...</h2>
          </div>
        )}
        
        {status === 'success' && (
          <div>
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Verified!</h2>
            <p className="text-gray-500 mb-8">{message}</p>
            <Button onClick={() => onNavigate('login')} size="lg">
              Proceed to Login
            </Button>
          </div>
        )}

        {status === 'error' && (
          <div>
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h2>
            <p className="text-gray-500 mb-8">{message}</p>
            <Button onClick={() => onNavigate('login')} size="lg" variant="outline">
              Go to Login
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
