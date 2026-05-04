import { LoginPageClient } from "@/components/auth/LoginPageClient"

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>
}) {
  const params = await searchParams
  return <LoginPageClient callbackUrl={params.callbackUrl ?? null} />
}
