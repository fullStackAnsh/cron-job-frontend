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

  // CRUCIAL: Use getUser(), NOT getSession()
  const { data: { user } } = await supabase.auth.getUser();
  const url = request.nextUrl.clone();
  const { pathname } = url;

  // Check explicitly if the user exists AND if their email is confirmed by Supabase
  const isEmailConfirmed = user?.email_confirmed_at !== undefined && user?.email_confirmed_at !== null;
  const isAuthenticated = user && isEmailConfirmed;

  // Define your public routes that do NOT require authentication
  const publicRoutes = ['/', '/login', '/signup','/pricing','/faq','/about','/features'];

  // Guard 1: If NOT authenticated and trying to access a restricted/private route
  if (!isAuthenticated && !publicRoutes.includes(pathname)) {
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Guard 2: If already authenticated and trying to visit public auth pages, send them away (e.g., to dashboard)
  if (isAuthenticated && (pathname === '/login' || pathname === '/signup')) {
    url.pathname = '/dashboard'; // Or whatever your main landing dashboard is
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  // Broaden the matcher to ensure it processes every single route explicitly except core static files/assets
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};