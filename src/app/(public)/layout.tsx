import TrainerLayout from '@/components/layouts/trainer-layout'

export default function PublicGroupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <TrainerLayout>{children}</TrainerLayout>
}
