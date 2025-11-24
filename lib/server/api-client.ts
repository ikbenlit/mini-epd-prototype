import { headers, cookies } from 'next/headers';

export function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  try {
    const headersList = headers();
    const host = headersList.get('host');
    const protocol = headersList.get('x-forwarded-proto') || 'http';
    if (host) {
      return `${protocol}://${host}`;
    }
  } catch {
    // Ignore header errors
  }

  return 'http://localhost:3000';
}

export async function getCookieHeader(): Promise<string> {
  try {
    const cookieStore = await cookies();
    return cookieStore
      .getAll()
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join('; ');
  } catch {
    return '';
  }
}

export async function authFetch(input: string | URL, init: RequestInit = {}) {
  const cookieHeader = await getCookieHeader();
  const headersObj = new Headers(init.headers);

  if (cookieHeader && !headersObj.has('cookie')) {
    headersObj.set('cookie', cookieHeader);
  }

  return fetch(input, {
    ...init,
    headers: headersObj,
  });
}
