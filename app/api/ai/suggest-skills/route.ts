import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { suggestSkillsWithAI } from '@/lib/ai';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { existingSkills, targetRole } = body;

    const skills = await suggestSkillsWithAI(
      Array.isArray(existingSkills) ? existingSkills : [],
      targetRole
    );

    return NextResponse.json({ skills });
  } catch (error: any) {
    console.error('Error suggesting skills:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to suggest skills' },
      { status: 500 }
    );
  }
}

