import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateProfileSummary } from '@/lib/ai';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, skills, experience_years, city, availability } = body;

    const summary = await generateProfileSummary({
      name: name || user.user_metadata?.full_name || 'Professional',
      skills: Array.isArray(skills) ? skills : [],
      experience_years: Number(experience_years) || 0,
      city: city || 'Bangalore',
      availability: availability || 'full-time',
    });

    return NextResponse.json({ summary });
  } catch (error: any) {
    console.error('Error generating profile summary:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate profile summary' },
      { status: 500 }
    );
  }
}

