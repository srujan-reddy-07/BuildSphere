'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function DemoBanner() {
  const [demoUser, setDemoUser] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      if (
        user?.email &&
        (user.email.includes('demo-talent') ||
          user.email.includes('demo-business') ||
          user.email.endsWith('@example.com'))
      ) {
        setDemoUser(user.email);
      } else {
        setDemoUser(null);
      }
    }

    checkAuth();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const email = session?.user?.email;
      if (
        email &&
        (email.includes('demo-talent') ||
          email.includes('demo-business') ||
          email.endsWith('@example.com'))
      ) {
        setDemoUser(email);
      } else {
        setDemoUser(null);
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

  if (!demoUser) return null;

  return (
    <div
      role="status"
      aria-label="Demo mode indicator"
      className="bg-amber-500 text-white text-xs font-semibold py-1.5 px-4 text-center tracking-wide flex items-center justify-center gap-2 shadow-xs transition-all"
    >
      <span className="inline-block w-2 h-2 rounded-full bg-white animate-pulse" aria-hidden="true" />
      <span>Prototype — demo data</span>
      <span className="hidden sm:inline opacity-85 font-normal font-mono text-[11px]">
        ({demoUser})
      </span>
    </div>
  );
}

