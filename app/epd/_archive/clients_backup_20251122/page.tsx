import { redirect } from 'next/navigation';

/**
 * Clients Root Redirect
 * Redirects /epd/clients to /epd/patients for backward compatibility
 */

export default function ClientsRedirect() {
  redirect('/epd/patients');
}
