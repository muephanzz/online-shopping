import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

export async function middleware(req) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  const { data: isAdmin } = await supabase.rpc('check_is_admin', {
    uid: user.id,
  });

  if (!isAdmin) {
    return NextResponse.redirect(new URL('/access-denied', req.url));
  }

  return res;
}

export const config = {
  matcher: ['/admin/:path*'],
};
