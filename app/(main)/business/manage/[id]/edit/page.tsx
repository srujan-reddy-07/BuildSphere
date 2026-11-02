'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import SkillTag from '@/components/ui/SkillTag';
import toast from 'react-hot-toast';

export default function EditOpportunityPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'job' | 'internship' | 'freelance' | 'project'>('job');
  const [status, setStatus] = useState<'open' | 'closed' | 'draft'>('open');
  const [location, setLocation] = useState('');
  const [isRemote, setIsRemote] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [stipendMin, setStipendMin] = useState<string>('');
  const [stipendMax, setStipendMax] = useState<string>('');
  const [deadline, setDeadline] = useState('');

  useEffect(() => {
    async function loadOpp() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push(`/login?redirect=/business/manage/${id}/edit`);
        return;
      }

      const { data: opp, error } = await supabase
        .from('opportunities')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !opp) {
        toast.error('Opportunity not found.');
        router.push('/business/manage');
        return;
      }

      if (opp.business_id !== user.id) {
        toast.error('You do not have permission to edit this listing.');
        router.push('/business/manage');
        return;
      }

      setTitle(opp.title);
      setDescription(opp.description);
      setType(opp.type);
      setStatus(opp.status);
      setLocation(opp.location || '');
      setIsRemote(opp.is_remote);
      setSkills(opp.required_skills || []);
      setStipendMin(opp.stipend_min ? String(opp.stipend_min) : '');
      setStipendMax(opp.stipend_max ? String(opp.stipend_max) : '');
      setDeadline(opp.deadline || '');
      setLoading(false);
    }

    if (id) {
      loadOpp();
    }
  }, [id, router, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast.error('Title and description are required.');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('opportunities')
        .update({
          title: title.trim(),
          description: description.trim(),
          type,
          status,
          location: isRemote ? 'Remote' : location.trim(),
          is_remote: isRemote,
          required_skills: skills,
          stipend_min: stipendMin ? parseInt(stipendMin, 10) : null,
          stipend_max: stipendMax ? parseInt(stipendMax, 10) : null,
          deadline: deadline || null,
        })
        .eq('id', id);

      if (error) {
        toast.error(error.message || 'Failed to update opportunity.');
        return;
      }

      toast.success('Opportunity updated successfully.');
      router.push('/business/manage');
    } catch {
      toast.error('Failed to update opportunity.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-orange-500 border-r-transparent" />
        <p className="text-gray-500 text-sm mt-3">Loading opportunity details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-6">
        <Link href="/business/manage" className="text-xs text-gray-500 hover:text-orange-600 mb-2 inline-block">
          ← Back to Manage Listings
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Edit Opportunity</h1>
      </div>

      <Card className="p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Opportunity Title *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="opp-status" className="block text-sm font-semibold text-gray-800 mb-1.5">
                Listing Status
              </label>
              <select
                id="opp-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full text-sm rounded-lg border border-gray-300 bg-white p-2.5 text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              >
                <option value="open">Open (Accepting Applications)</option>
                <option value="closed">Closed (No New Applications)</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            <div>
              <label htmlFor="opp-type" className="block text-sm font-semibold text-gray-800 mb-1.5">
                Type
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
          </div>

          <div>
            <Input
              label="Location"
              placeholder="e.g. Bangalore, Hyderabad"
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
              <span className="text-xs text-gray-600 font-medium">Remote</span>
            </label>
          </div>

          <div>
            <label htmlFor="opp-desc" className="block text-sm font-semibold text-gray-800 mb-1.5">
              Description *
            </label>
            <textarea
              id="opp-desc"
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-sm rounded-lg border border-gray-300 p-3 text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">
              Required Skills
            </label>
            <SkillTag value={skills} onChange={setSkills} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Min Stipend (₹)"
              type="number"
              value={stipendMin}
              onChange={(e) => setStipendMin(e.target.value)}
            />
            <Input
              label="Max Stipend (₹)"
              type="number"
              value={stipendMax}
              onChange={(e) => setStipendMax(e.target.value)}
            />
            <Input
              label="Deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
            <Link href="/business/manage">
              <Button type="button" variant="ghost">
                Cancel
              </Button>
            </Link>
            <Button type="submit" isLoading={submitting}>
              Save Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

