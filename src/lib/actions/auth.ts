'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}

export async function getCurrentUser() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) return null;

    const { data: profile, error: profileError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('auth_id', user.id)
      .single();

    if (profileError) return null;

    return { user, profile };
  } catch {
    return null;
  }
}
