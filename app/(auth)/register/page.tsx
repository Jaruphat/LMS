import { RegisterPageClient } from "@/components/auth/RegisterPageClient"

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>
}) {
  const params = await searchParams
  return <RegisterPageClient callbackUrl={params.callbackUrl ?? null} />
}
