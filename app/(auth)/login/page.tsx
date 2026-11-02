'use client';

import { useState, FormEvent, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

type Mode = 'email' | 'phone';
type PhoneStep = 'enter_phone' | 'enter_otp';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [mode, setMode] = useState<Mode>('email');
  const [phoneStep, setPhoneStep] = useState<PhoneStep>('enter_phone');

  // Email form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Phone form
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');

  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const redirectTo = searchParams.get('redirect') ?? '/dashboard';

  useEffect(() => {
    setError(null);
    setPhoneStep('enter_phone');
    setOtp('');
  }, [mode]);

  async function handleDemoLogin(demoRole: 'talent' | 'business' = 'talent') {
    setDemoLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/demo-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: demoRole }),
      });
      const data = await res.json();
      if (!res.ok) {
        setEmail(demoRole === 'business' ? 'demo-business@example.com' : 'demo-talent@example.com');
        setMode('email');
        setError(data.error || 'Demo login failed. Check password in README.');
        setDemoLoading(false);
        return;
      }
      window.location.href = demoRole === 'business' ? '/business/manage' : redirectTo;
    } catch {
      setEmail(demoRole === 'business' ? 'demo-business@example.com' : 'demo-talent@example.com');
      setError('Could not reach demo service. Check credentials in README.');
      setDemoLoading(false);
    }
  }

  async function handleEmailLogin(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (signInError) {
      setError(signInError.message);
      return;
    }
    router.replace(redirectTo);
  }

  async function handleSendOtp(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
    const { error: otpError } = await supabase.auth.signInWithOtp({ phone: formattedPhone });
    setLoading(false);
    if (otpError) {
      setError(otpError.message);
      return;
    }
    setPhoneStep('enter_otp');
  }

  async function handleVerifyOtp(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
    const { error: verifyError } = await supabase.auth.verifyOtp({
      phone: formattedPhone,
      token: otp,
      type: 'sms',
    });
    setLoading(false);
    if (verifyError) {
      setError(verifyError.message);
      return;
    }
    router.replace(redirectTo);
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
        <p className="text-gray-500 mt-1 text-sm">Sign in to your BuildSphere account</p>
      </div>

      {/* Reviewer Demo Quick-Access */}
      <div className="mb-6 rounded-xl border border-orange-200 bg-orange-50/80 p-4 text-center">
        <p className="text-[11px] font-bold uppercase tracking-wider text-orange-800 mb-1">
          Reviewer & Mentor Fast-Track
        </p>
        <p className="text-xs text-gray-600 mb-3">
          Experience the full prototype with seeded talent and business demo data.
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            type="button"
            onClick={() => handleDemoLogin('talent')}
            isLoading={demoLoading}
            className="flex-1 text-xs py-2 shadow-xs"
          >
            ⚡ Try the Demo (Talent)
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => handleDemoLogin('business')}
            disabled={demoLoading}
            className="flex-1 text-xs py-2 bg-white hover:bg-gray-50 border-gray-200"
          >
            💼 Try Demo (Business)
          </Button>
        </div>
      </div>

      {/* Tab Toggle */}
      <div className="flex rounded-lg bg-gray-100 p-1 mb-6" role="tablist" aria-label="Login method">
        {(['email', 'phone'] as Mode[]).map((m) => (
          <button
            key={m}
            role="tab"
            aria-selected={mode === m}
            onClick={() => setMode(m)}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
              mode === m
                ? 'bg-white text-orange-500 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {m === 'email' ? 'Email' : 'Phone OTP (Coming soon)'}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {/* Email Login Form */}
      {mode === 'email' && (
        <form onSubmit={handleEmailLogin} className="space-y-4" noValidate>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email address
            </label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white"
            aria-busy={loading}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
      )}

      {/* Phone OTP Form */}
      {mode === 'phone' && (
        <>
          <div className="rounded-xl bg-blue-50 border border-blue-200 p-3.5 text-xs text-blue-900 mb-4 leading-relaxed">
            <span className="font-bold">SMS Gateway in Test Mode (Coming Soon):</span> Phone OTP requires SMS dispatch providers (Twilio/Fast2SMS) in Supabase. You can preview the interface below, or use <strong>Email login / Try the demo</strong>.
          </div>
          {phoneStep === 'enter_phone' ? (
            <form onSubmit={handleSendOtp} className="space-y-4" noValidate>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone number
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                    +91
                  </span>
                  <Input
                    id="phone"
                    type="tel"
                    autoComplete="tel-national"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="9876543210"
                    className="rounded-l-none"
                    maxLength={10}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-400">Enter your 10-digit Indian mobile number</p>
              </div>
              <Button
                type="submit"
                disabled={loading || phone.replace(/\D/g, '').length !== 10}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                aria-busy={loading}
              >
                {loading ? 'Sending OTP…' : 'Send OTP'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4" noValidate>
              <div>
                <p className="text-sm text-gray-600 mb-3">
                  OTP sent to{' '}
                  <span className="font-semibold">+91 {phone}</span>.{' '}
                  <button
                    type="button"
                    onClick={() => { setPhoneStep('enter_phone'); setOtp(''); setError(null); }}
                    className="text-orange-500 hover:underline text-sm"
                  >
                    Change
                  </button>
                </p>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
                  6-digit OTP
                </label>
                <Input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="123456"
                  maxLength={6}
                  autoComplete="one-time-code"
                />
              </div>
              <Button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                aria-busy={loading}
              >
                {loading ? 'Verifying…' : 'Verify OTP'}
              </Button>
            </form>
          )}
        </>
      )}

      <p className="mt-6 text-center text-sm text-gray-500">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="font-medium text-orange-500 hover:text-orange-600">
          Sign up
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-sm text-gray-400">Loading sign-in...</div>}>
      <LoginForm />
    </Suspense>
  );
}
