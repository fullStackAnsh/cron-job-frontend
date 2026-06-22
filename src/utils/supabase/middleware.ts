import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Create an unmodified response first
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // CRUCIAL: Use getUser(), NOT getSession(). getUser() validates the JWT with Supabase auth servers directly.
 const { data: { user } } = await supabase.auth.getUser();
const url = request.nextUrl.clone();

// Check explicitly if the user exists AND if their email is confirmed by Supabase
const isEmailConfirmed = user?.email_confirmed_at !== undefined && user?.email_confirmed_at !== null;

// Guard 1: Trying to access dashboard while completely unauthenticated OR unconfirmed
if ((!user || !isEmailConfirmed) && url.pathname.startsWith('/dashboard')) {
  url.pathname = '/login';
  return NextResponse.redirect(url);
}

// Guard 2: Trying to hit '/' or '/login' while already fully confirmed
if (user && isEmailConfirmed && (url.pathname === '/' || url.pathname === '/login')) {
  url.pathname = '/dashboard';
  return NextResponse.redirect(url);
}
  return response;
}

export const config = {
  // Broaden the matcher to ensure it processes every single route explicitly except core static files
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};