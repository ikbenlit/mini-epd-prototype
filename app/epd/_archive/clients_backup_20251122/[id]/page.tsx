import { redirect } from 'next/navigation';

interface ClientDetailPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Redirect route: /epd/clients/[id] -> /epd/clients/[id]/dashboard
 * 
 * Wanneer een gebruiker direct naar /epd/clients/[id] navigeert,
 * wordt deze automatisch doorgestuurd naar het dashboard.
 */
export default async function ClientRedirect({
  params,
}: ClientDetailPageProps) {
  const { id } = await params;
  redirect(`/epd/clients/${id}/dashboard`);
}
