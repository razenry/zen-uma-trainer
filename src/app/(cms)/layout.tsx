import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import CMSLayout from '@/components/layouts/cms-layout'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  const role = (session.user as any).role
  
  // Enforce staff access check
  if (role !== 'ADMIN' && role !== 'MODERATOR' && role !== 'DATA_ENTRY') {
    redirect('/dashboard')
  }

  return <CMSLayout>{children}</CMSLayout>
}
