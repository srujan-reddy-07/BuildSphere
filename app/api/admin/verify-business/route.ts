import { NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

/**
 * Admin Business Verification API
 * POST /api/admin/verify-business
 * 
 * Verifies a business account on the server side using the service role key.
 * Never exposes the service role key to the browser client.
 * 
 * Authorization:
 * Requires authenticated session with role = 'admin' OR header 'x-admin-key'.
 */
export async function POST(request: Request) {
  try {
    const supabaseUserClient = await createServerClient();
    const { data: { user } } = await supabaseUserClient.auth.getUser();

    const adminKeyHeader = request.headers.get('x-admin-key');
    const validAdminKey = process.env.ADMIN_SECRET_KEY;

    let isAuthorized = false;

    // Check header secret
    if (adminKeyHeader && validAdminKey && adminKeyHeader === validAdminKey) {
      isAuthorized = true;
    }

    // Check admin profile role
    if (!isAuthorized && user) {
      const { data: profile } = await supabaseUserClient
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      if (profile && (profile as any).role === 'admin') {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Forbidden: Admin authorization required to verify businesses' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { businessId, verified = true } = body;

    if (!businessId) {
      return NextResponse.json(
        { error: 'Missing required field: businessId' },
        { status: 400 }
      );
    }

    // Use service role on server to bypass client RLS for admin verification
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (serviceRoleKey && supabaseUrl) {
      const adminClient = createSupabaseClient<Database>(supabaseUrl, serviceRoleKey);
      const { error } = await adminClient
        .from('businesses')
        .update({ verified })
        .eq('id', businessId);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    } else {
      // Fallback update via session client
      const { error } = await supabaseUserClient
        .from('businesses')
        .update({ verified })
        .eq('id', businessId);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({
      success: true,
      businessId,
      verified,
      message: `Business ${businessId} verification updated to ${verified}`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

