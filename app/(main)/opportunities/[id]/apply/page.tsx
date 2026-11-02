'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import toast from 'react-hot-toast';
import type { Opportunity } from '@/types/database';

export default function ApplyPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const supabase = createClient();

  const [opp, setOpp] = useState<Opportunity | null>(null);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(false);

  useEffect(() => {
    async function loadOpportunity() {
      if (!id) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push(`/login?redirect=/opportunities/${id}/apply`);
        return;
      }

      // Check if already applied
      const { data: existingApp } = await supabase
        .from('applications')
        .select('id, status')
        .eq('opportunity_id', id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingApp) {
        setAlreadyApplied(true);
      }

      // Fetch opportunity
      const { data: oppData } = await supabase
        .from('opportunities')
        .select('*')
        .eq('id', id)
        .single();

      if (oppData) {
        setOpp(oppData);
      }
      setLoading(false);
    }

    loadOpportunity();
  }, [id, router, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) {
      toast.error('Please write a brief note introducing yourself.');
      return;
    }

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be signed in to apply.');
        router.push('/login');
        return;
      }

      const { error } = await supabase.from('applications').insert({
        opportunity_id: id,
        user_id: user.id,
        note: note.trim(),
        status: 'pending',
      });

      if (error) {
        if (error.code === '23505') {
          toast.error('You have already applied for this opportunity.');
          setAlreadyApplied(true);
        } else {
          toast.error(error.message || 'Failed to submit application.');
        }
        return;
      }

      toast.success('Application submitted successfully!');
      setTimeout(() => {
        router.push('/my-applications');
      }, 1500);
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-orange-500 border-r-transparent" />
        <p className="text-gray-500 text-sm mt-3">Loading application details...</p>
      </div>
    );
  }

  if (!opp) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-gray-900">Opportunity not found</h2>
        <Link href="/opportunities" className="text-orange-600 hover:underline text-sm mt-3 inline-block">
          ← Back to opportunities
        </Link>
      </div>
    );
  }

  if (alreadyApplied) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <Card className="p-8 space-y-4">
          <span className="text-4xl" aria-hidden="true">✅</span>
          <h2 className="text-xl font-bold text-gray-900">Application Already Submitted</h2>
          <p className="text-gray-600 text-sm">
            You have already applied for <strong>{opp.title}</strong>. You can view the status of your application in your dashboard.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Link href="/my-applications">
              <Button>View My Applications</Button>
            </Link>
            <Link href="/opportunities">
              <Button variant="secondary">Browse More</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <Link
        href={`/opportunities/${opp.id}`}
        className="text-sm text-gray-500 hover:text-orange-600 mb-6 inline-flex items-center gap-1"
      >
        ← Back to opportunity details
      </Link>

      <Card className="p-6 sm:p-8 space-y-6 mt-2">
        <div className="border-b border-gray-100 pb-4">
          <span className="text-xs uppercase font-bold tracking-wider text-orange-600">Apply for</span>
          <h1 className="text-2xl font-extrabold text-gray-900 mt-1">{opp.title}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {opp.location || (opp.is_remote ? 'Remote' : 'India')} • {opp.type}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label htmlFor="application-note" className="block text-sm font-semibold text-gray-800">
                Introduction / Cover Note <span className="text-red-500">*</span>
              </label>
              <span className={`text-xs ${note.length > 500 ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                {note.length}/500
              </span>
            </div>
            <textarea
              id="application-note"
              rows={5}
              maxLength={500}
              placeholder="Highlight your relevant skills, why you are a good match for this role, and links to your portfolio or GitHub..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full text-sm rounded-lg border border-gray-300 p-3 text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-colors"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Your profile details, skills, and resume link will automatically accompany this note.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <Link href={`/opportunities/${opp.id}`}>
              <Button type="button" variant="ghost">
                Cancel
              </Button>
            </Link>
            <Button type="submit" isLoading={submitting} disabled={note.length > 500}>
              Submit Application
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

