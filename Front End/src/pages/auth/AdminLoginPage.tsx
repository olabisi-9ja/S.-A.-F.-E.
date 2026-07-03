import React, { useState } from 'react';
import { Shield, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

interface AdminLoginPageProps {
  onNavigate: (page: string) => void;
}

export function AdminLoginPage({ onNavigate }: AdminLoginPageProps) {
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
      {/* Navbar */}
      <div className="fixed top-0 left-0 right-0 h-14 bg-red-800 flex items-center px-6 gap-3 z-10">
        <Shield className="w-5 h-5 text-white" />
        <span className="text-white font-bold tracking-widest text-sm">S.A.F.E. KWASU</span>
      </div>

      <div className="w-full max-w-md mt-14">
        {/* Student login link */}
        <button
          onClick={() => onNavigate('login')}
          className="flex items-center gap-1.5 text-red-200 hover:text-white text-sm mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Student login
        </button>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-14 h-14 rounded-full border-2 border-red-200 flex items-center justify-center mb-3">
              <Shield className="w-7 h-7 text-red-700" />
            </div>
            <h2 className="text-xl font-bold text-red-700">Admin Gateway</h2>
            <p className="text-xs text-gray-400 mt-0.5">S.A.F.E. KWASU Management System</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Work Email"
              type="email"
              placeholder="e.g., admin.name@kwasu.edu.ng"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <Input
              label="Security Key"
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

            <Button type="submit" size="lg" className="w-full mt-2" loading={loading}>
              Access Dashboard
            </Button>
          </form>
        </div>


      </div>
    </div>
  );
}
