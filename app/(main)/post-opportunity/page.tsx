'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import SkillTag from '@/components/ui/SkillTag';
import toast from 'react-hot-toast';

export default function PostOpportunityPage() {
  const router = useRouter();
  const supabase = createClient();

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'job' | 'internship' | 'freelance' | 'project'>('job');
  const [location, setLocation] = useState('Bangalore');
  const [isRemote, setIsRemote] = useState(false);
  const [skills, setSkills] = useState<string[]>(['React', 'TypeScript']);
  const [stipendMin, setStipendMin] = useState<string>('25000');
  const [stipendMax, setStipendMax] = useState<string>('50000');
  const [deadline, setDeadline] = useState('2026-12-31');

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login?redirect=/post-opportunity');
        return;
      }

      // Check if user has business record or profile
      const { data: biz } = await supabase
        .from('businesses')
        .select('id, verified')
        .eq('id', user.id)
        .maybeSingle();

      if (biz) {
        setIsVerified(Boolean(biz.verified));
      } else {
        setIsVerified(false);
      }
      setCheckingAuth(false);
    }

    checkUser();
  }, [router, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isVerified) {
      toast.error('Only verified business accounts can publish opportunities. Use demo-business@example.com for prototype testing.');
      return;
    }

    if (!title.trim() || !description.trim()) {
      toast.error('Title and description are required.');
      return;
    }

    if (skills.length === 0) {
      toast.error('Please add at least one required skill.');
      return;
    }

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Authentication expired.');
        router.push('/login');
        return;
      }

      // Ensure business record exists for user
      const { data: existingBiz } = await supabase
        .from('businesses')
        .select('id, verified')
        .eq('id', user.id)
        .maybeSingle();

      if (!existingBiz) {
        // Upsert default business row with verified = false (Security fix: never client-verified)
        await supabase.from('businesses').insert({
          id: user.id,
          name: user.user_metadata?.company_name || user.email?.split('@')[0] + ' Tech',
          description: 'Hiring on BuildSphere India',
          verified: false,
        });
        toast.error('Your business profile was created but requires admin verification to publish.');
        setIsVerified(false);
        setSubmitting(false);
        return;
      }

      if (!existingBiz.verified) {
        toast.error('Your business account is pending verification.');
        setIsVerified(false);
        setSubmitting(false);
        return;
      }

      const { data, error } = await supabase.from('opportunities').insert({
        business_id: user.id,
        title: title.trim(),
        description: description.trim(),
        type,
        location: isRemote ? 'Remote' : location.trim(),
        is_remote: isRemote,
        required_skills: skills,
        stipend_min: stipendMin ? parseInt(stipendMin, 10) : null,
        stipend_max: stipendMax ? parseInt(stipendMax, 10) : null,
        deadline: deadline || null,
        status: 'open',
      }).select().single();

      if (error) {
        toast.error(error.message || 'Failed to post opportunity.');
        return;
      }

      toast.success('Opportunity posted successfully!');
      router.push(`/opportunities/${data.id}`);
    } catch {
      toast.error('An unexpected error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-orange-500 border-r-transparent" />
        <p className="text-gray-500 text-sm mt-3">Verifying business credentials...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Post an Opportunity</h1>
        <p className="text-sm text-gray-500 mt-1">
          Reach thousands of qualified developers, designers, and students across India.
        </p>
      </div>

      <Card className="p-6 sm:p-8">
        {!isVerified && (
          <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
            <div className="flex items-start gap-2.5">
              <span className="text-xl" aria-hidden="true">⚠️</span>
              <div>
                <p className="font-bold">Business Account Pending Verification</p>
                <p className="mt-1 text-xs text-amber-800 leading-relaxed">
                  To prevent spam, new business accounts must be verified before publishing listings.
                </p>
                <p className="mt-2 text-xs font-semibold text-amber-950">
                  💡 Prototype Demo: Sign in with the pre-verified demo account <span className="font-mono bg-amber-100 px-1 py-0.5 rounded text-amber-900">demo-business@example.com</span> or execute the SQL update documented in the README.
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Opportunity Title *"
            placeholder="e.g. Full Stack Next.js Engineer, UI/UX Design Intern"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="opp-type" className="block text-sm font-semibold text-gray-800 mb-1.5">
                Type *
              </label>
              <select
                id="opp-type"
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full text-sm rounded-lg border border-gray-300 bg-white p-2.5 text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              >
                <option value="job">Full-Time Job</option>
                <option value="internship">Internship</option>
                <option value="freelance">Freelance Contract</option>
                <option value="project">Real-World Project</option>
              </select>
            </div>

            <div>
              <Input
                label="Location *"
                placeholder="e.g. Bangalore, Pune, Delhi NCR"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                disabled={isRemote}
              />
              <label className="flex items-center gap-2 mt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isRemote}
                  onChange={(e) => setIsRemote(e.target.checked)}
                  className="rounded text-orange-500 focus:ring-orange-500 h-4 w-4"
                />
                <span className="text-xs text-gray-600 font-medium">This is a 100% remote opportunity</span>
              </label>
            </div>
          </div>

          <div>
            <label htmlFor="opp-desc" className="block text-sm font-semibold text-gray-800 mb-1.5">
              Description & Requirements *
            </label>
            <textarea
              id="opp-desc"
              rows={6}
              placeholder="Describe the role, day-to-day responsibilities, expectations, perks, and selection process..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-sm rounded-lg border border-gray-300 p-3 text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">
              Required Skills (press Enter to add) *
            </label>
            <SkillTag
              value={skills}
              onChange={setSkills}
              placeholder="Add skill (e.g. React, Node.js, Figma, SQL)..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Min Stipend / CTC (₹)"
              type="number"
              placeholder="e.g. 20000"
              value={stipendMin}
              onChange={(e) => setStipendMin(e.target.value)}
            />
            <Input
              label="Max Stipend / CTC (₹)"
              type="number"
              placeholder="e.g. 45000"
              value={stipendMax}
              onChange={(e) => setStipendMax(e.target.value)}
            />
            <Input
              label="Application Deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
            <Link href="/opportunities">
              <Button type="button" variant="ghost">
                Cancel
              </Button>
            </Link>
            <Button type="submit" isLoading={submitting} disabled={!isVerified}>
              {!isVerified ? 'Verification Required to Post' : 'Publish Opportunity'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

