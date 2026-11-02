'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

function BriefcaseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

type Role = 'talent' | 'business';

export default function SignUpPage() {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<Role>('talent');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSignUp(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          role,
          phone: phone || null,
        },
      },
    });

    if (signUpError) {
      setLoading(false);
      setError(signUpError.message);
      return;
    }

    // Insert initial profile row
    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        full_name: name,
      });

      if (role === 'business') {
        await supabase.from('businesses').insert({
          id: data.user.id,
          name: name || 'My Company',
          description: 'Hiring on BuildSphere India',
          verified: false, // Default to unverified as required by security policy
        });
      }
    }

    setLoading(false);
    setSuccess(true);

    // Redirect after short delay
    setTimeout(() => {
      router.replace(role === 'business' ? '/business/manage' : '/profile');
    }, 2500);
  }

  if (success) {
    return (
      <div className="w-full max-w-md mx-auto text-center">
        <div className="rounded-full bg-green-100 w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Check your email!</h2>
        <p className="text-gray-500 text-sm">
          We sent a confirmation link to <strong>{email}</strong>. Click it to verify your account, then you&apos;ll be redirected to set up your profile.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
        <p className="text-gray-500 mt-1 text-sm">Join thousands of Indian builders on BuildSphere</p>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSignUp} className="space-y-5" noValidate>
        {/* Role selection */}
        <fieldset>
          <legend className="block text-sm font-medium text-gray-700 mb-2">I am a…</legend>
          <div className="grid grid-cols-2 gap-3">
            {(['talent', 'business'] as Role[]).map((r) => (
              <label
                key={r}
                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  role === r
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 bg-white hover:border-orange-300'
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value={r}
                  checked={role === r}
                  onChange={() => setRole(r)}
                  className="sr-only"
                />
                {r === 'talent' ? (
                  <UserIcon className={`w-6 h-6 ${role === r ? 'text-orange-500' : 'text-gray-400'}`} aria-hidden="true" />
                ) : (
                  <BriefcaseIcon className={`w-6 h-6 ${role === r ? 'text-orange-500' : 'text-gray-400'}`} aria-hidden="true" />
                )}
                <span className={`text-sm font-medium capitalize ${role === r ? 'text-orange-600' : 'text-gray-600'}`}>
                  {r === 'talent' ? 'Talent / Freelancer' : 'Business / Startup'}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name <span className="text-red-500">*</span>
          </label>
          <Input
            id="name"
            type="text"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Priya Sharma"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email address <span className="text-red-500">*</span>
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
            Password <span className="text-red-500">*</span>
          </label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min. 8 characters"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone number <span className="text-gray-400 text-xs">(optional)</span>
          </label>
          <div className="flex">
            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
              +91
            </span>
            <Input
              id="phone"
              type="tel"
              autoComplete="tel-national"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder="9876543210"
              className="rounded-l-none"
              maxLength={10}
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading || !name || !email || password.length < 8}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white"
          aria-busy={loading}
        >
          {loading ? 'Creating account…' : 'Create account'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-orange-500 hover:text-orange-600">
          Sign in
        </Link>
      </p>
    </div>
  );
}
