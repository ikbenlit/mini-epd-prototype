import { redirect } from 'next/navigation';
import { NextRequest } from 'next/server';

/**
 * Catch-all Redirect Route for /epd/clients/
 * 
 * Redirects all /epd/clients/* routes to /epd/patients/* for backward compatibility
 * This ensures that old bookmarks and links continue to work after migration.
 * 
 * Preserves query parameters (e.g., ?tab=intake&search=test)
 */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const searchParams = request.nextUrl.searchParams;
  
  // Build new path with query parameters
  const newPath = `/epd/patients/${path.join('/')}`;
  const newUrl = new URL(newPath, request.url);
  
  // Preserve all query parameters
  searchParams.forEach((value, key) => {
    newUrl.searchParams.set(key, value);
  });
  
  redirect(newUrl.toString());
}

