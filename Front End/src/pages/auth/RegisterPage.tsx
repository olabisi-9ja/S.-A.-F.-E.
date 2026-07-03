import React, { useState } from 'react';
import { Shield, ArrowLeft, User, Mail, Phone, Lock, Eye, EyeOff, Hash } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { OAuthButtons } from '../../components/auth/OAuthButtons';

interface RegisterPageProps {
  onNavigate: (page: string) => void;
}

export function RegisterPage({ onNavigate }: RegisterPageProps) {
  const { register } = useAuth();
  const [form, setForm] = useState({
    full_name: '',
    institutional_email: '',
    phone: '',
    matric_or_staff_id: '',
    password: '',
    confirm_password: '',
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [success, setSuccess] = useState(false);

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirm_password) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    const result = await register({
      full_name: form.full_name,
      institutional_email: form.institutional_email,
      phone: form.phone,
      matric_or_staff_id: form.matric_or_staff_id,
      password: form.password,
    });
    setLoading(false);

    if (!result.success) {
      setError(result.error || 'Registration failed.');
    } else {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-white">
        <div className="h-14 border-b border-gray-100 flex items-center px-5 gap-3">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-red-700" />
            <span className="font-bold text-gray-800 tracking-wider text-sm">S.A.F.E.KWASU</span>
          </div>
        </div>
        <div className="max-w-xl mx-auto px-5 py-12 text-center">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Successful!</h2>
          <p className="text-gray-500 mb-8">
            We've sent a verification link to <strong>{form.institutional_email}</strong>. Please check your inbox and verify your email to log in.
          </p>
          <Button onClick={() => onNavigate('login')} size="lg">
            Back to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Top bar */}
      <div className="h-14 border-b border-gray-100 flex items-center px-5 gap-3">
        <button
          onClick={() => onNavigate('login')}
          className="text-gray-500 hover:text-gray-700 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-red-700" />
          <span className="font-bold text-gray-800 tracking-wider text-sm">S.A.F.E.KWASU</span>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-5 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Create Account</h2>
        <p className="text-gray-500 text-sm mb-8">Join the campus safety network to receive alerts and stay protected.</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Full Name"
            type="text"
            placeholder="Full Name"
            value={form.full_name}
            onChange={set('full_name')}
            icon={<User className="w-4 h-4" />}
            required
          />
          <Input
            label="University Email"
            type="email"
            placeholder="University Email"
            value={form.institutional_email}
            onChange={set('institutional_email')}
            icon={<Mail className="w-4 h-4" />}
            required
          />
          <Input
            label="Phone Number"
            type="tel"
            placeholder="Phone Number"
            value={form.phone}
            onChange={set('phone')}
            icon={<Phone className="w-4 h-4" />}
            required
          />
          <Input
            label="Matric / Staff ID"
            type="text"
            placeholder="Matric / Staff ID"
            value={form.matric_or_staff_id}
            onChange={set('matric_or_staff_id')}
            icon={<Hash className="w-4 h-4" />}
            required
          />
          <Input
            label="Password"
            type={showPass ? 'text' : 'password'}
            placeholder="Password"
            value={form.password}
            onChange={set('password')}
            icon={<Lock className="w-4 h-4" />}
            rightElement={
              <button type="button" onClick={() => setShowPass(v => !v)} className="text-gray-400 hover:text-gray-600">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
            required
          />
          <Input
            label="Confirm Password"
            type={showPass ? 'text' : 'password'}
            placeholder="Confirm Password"
            value={form.confirm_password}
            onChange={set('confirm_password')}
            icon={<Lock className="w-4 h-4" />}
            required
          />

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <Button type="submit" size="lg" className="w-full" loading={loading}>
            Create Account
          </Button>
        </form>

        <div className="mt-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>
          <OAuthButtons onError={(err) => setError(err)} />
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <button onClick={() => onNavigate('login')} className="text-red-700 font-semibold hover:underline">
            Login
          </button>
        </p>
      </div>
    </div>
  );
}
