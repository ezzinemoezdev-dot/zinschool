import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) { // بدلنا middleware بـ proxy
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (list) => {
          list.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          list.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname
  
  // نفس المنطق القديم، نمسحوا الكوكيز كي نحبوا نخرجوا
  const isPublic = path === '/' || path.startsWith('/login') || path.startsWith('/register')

  if (isPublic) {
    if (user) {
      const redirectResponse = NextResponse.redirect(new URL('/login', request.url))
      request.cookies.getAll().forEach((cookie) => {
        if (cookie.name.startsWith('sb-')) {
          redirectResponse.cookies.delete(cookie.name)
        }
      })
      return redirectResponse
    }
    return response
  }

  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}

// غيرنا اسم الـ config زادة (اختياري لكن باش نكونوا آمنين)
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}