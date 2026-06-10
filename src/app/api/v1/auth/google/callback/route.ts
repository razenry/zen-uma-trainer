import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const targetUrl = new URL('/api/auth/callback/google', request.url)
  
  searchParams.forEach((value, key) => {
    targetUrl.searchParams.set(key, value)
  })

  return NextResponse.redirect(targetUrl)
}
