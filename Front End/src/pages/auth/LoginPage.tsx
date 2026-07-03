import React, { useState } from 'react';
import { Shield, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { OAuthButtons } from '../../components/auth/OAuthButtons';

interface LoginPageProps {
  onNavigate: (page: string) => void;
}

export function LoginPage({ onNavigate }: LoginPageProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (!result.success) setError(result.error || 'Login failed.');
  };

  return (
    <div className="min-h-screen bg-red-700 flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <div className="mb-8 flex flex-col items-center gap-3">
        <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
          <Shield className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-widest">S.A.F.E. KWASU</h1>
        <p className="text-red-200 text-sm italic">Smart Alert and Field Emergency System</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="University Email"
            type="email"
            placeholder="e.g., student@kwasu.edu.ng"
            value={email}
            onChange={e => setEmail(e.target.value)}
            icon={<Mail className="w-4 h-4" />}
            required
          />
          <Input
            label="Secure Password"
            type={showPass ? 'text' : 'password'}
            placeholder="Enter your secure password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            icon={<Lock className="w-4 h-4" />}
            rightElement={
              <button type="button" onClick={() => setShowPass(v => !v)} className="text-gray-400 hover:text-gray-600">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
            required
          />

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <Button type="submit" size="lg" className="w-full" loading={loading}>
            Login
          </Button>
        </form>

        <div className="mt-5 text-center text-sm text-gray-500">
          New to S.A.F.E.?{' '}
          <button
            onClick={() => onNavigate('register')}
            className="text-red-700 font-semibold hover:underline"
          >
            Register
          </button>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400">or</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <div className="mt-5">
          <OAuthButtons onError={(err) => setError(err)} />
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={() => onNavigate('admin-login')}
            className="text-sm text-gray-500 hover:text-gray-700 transition"
          >
            Admin Access
          </button>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400">
          <Lock className="w-3 h-3" />
          ENCRYPTED CONNECTION
        </div>
      </div>


    </div>
  );
}
