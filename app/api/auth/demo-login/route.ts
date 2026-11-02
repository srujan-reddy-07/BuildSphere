import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Demo Login Handler
 * POST /api/auth/demo-login
 * Signs in the pre-configured demo account for prototype review.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const role = body.role === 'business' ? 'business' : 'talent';

    const email =
      role === 'business' ? 'demo-business@example.com' : 'demo-talent@example.com';

    const password =
      role === 'business'
        ? process.env.DEMO_BUSINESS_PASSWORD
        : process.env.DEMO_TALENT_PASSWORD;

    if (!password) {
      return NextResponse.json(
        {
          error: `Missing environment variable: ${
            role === 'business' ? 'DEMO_BUSINESS_PASSWORD' : 'DEMO_TALENT_PASSWORD'
          }. Please check README.md for the credentials.`,
        },
        { status: 500 }
      );
    }

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json(
        {
          error: `${error.message}. (Ensure supabase/seed.sql has been executed on your Supabase instance).`,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        role,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Demo authentication failed' },
      { status: 500 }
    );
  }
}

