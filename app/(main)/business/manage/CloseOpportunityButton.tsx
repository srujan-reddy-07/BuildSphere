'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

export default function CloseOpportunityButton({ opportunityId }: { opportunityId: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const handleClose = async () => {
    if (!confirm('Are you sure you want to close this opportunity? No new applications will be accepted.')) {
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('opportunities')
        .update({ status: 'closed' })
        .eq('id', opportunityId);

      if (error) {
        toast.error(error.message || 'Failed to close opportunity');
        return;
      }

      toast.success('Opportunity closed.');
      router.refresh();
    } catch {
      toast.error('Failed to close opportunity.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClose}
      disabled={loading}
      className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
    >
      {loading ? 'Closing...' : 'Close'}
    </button>
  );
}

