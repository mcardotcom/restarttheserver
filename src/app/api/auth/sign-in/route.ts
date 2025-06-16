import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { withRateLimit } from '@/lib/rate-limit';

export const POST = withRateLimit(async (request: NextRequest) => {
  try {
    const formData = await request.formData();
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const redirectTo = formData.get('redirectTo') as string;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const supabase = createRouteHandlerClient({ cookies });

    // Sign in with Supabase Auth
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      console.error('Sign in error:', signInError);
      return NextResponse.json(
        { error: 'Invalid email or password' }, // Generic error message for security
        { status: 401 }
      );
    }

    // Get the authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error('Get user error:', userError);
      return NextResponse.json(
        { error: 'Authentication failed' }, // Generic error message for security
        { status: 401 }
      );
    }

    // Check if user is an admin
    const { data: adminUser, error: adminError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (adminError || !adminUser) {
      console.error('Admin check error:', adminError);
      // Sign out the user if they're not an admin
      await supabase.auth.signOut();
      return NextResponse.json(
        { error: 'Access denied' }, // Generic error message for security
        { status: 403 }
      );
    }

    // Return success with redirect URL
    return NextResponse.json({
      success: true,
      redirectTo: redirectTo || '/admin'
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}); 