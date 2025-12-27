/**
 * Error Handler Utility voor Swift
 * 
 * E5.S2: Gecentraliseerde error handling met network detection,
 * gebruiksvriendelijke berichten en retry logic.
 */

export interface ErrorContext {
  operation: string;
  endpoint?: string;
  statusCode?: number;
  retryable?: boolean;
}

export interface ErrorInfo {
  title: string;
  description: string;
  retryable: boolean;
  statusCode?: number;
}

/**
 * Detecteert of de browser offline is
 */
export function isOffline(): boolean {
  return typeof navigator !== 'undefined' && !navigator.onLine;
}

/**
 * Controleert of een error een network error is
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError) {
    return (
      error.message.includes('fetch') ||
      error.message.includes('network') ||
      error.message.includes('Failed to fetch')
    );
  }
  return false;
}

/**
 * Controleert of een error een timeout is
 */
export function isTimeoutError(error: unknown): boolean {
  if (error instanceof Error) {
    return error.message.toLowerCase().includes('timeout');
  }
  return false;
}

/**
 * Parse HTTP error response en extraheert gebruiksvriendelijke berichten
 */
export async function parseErrorResponse(
  response: Response
): Promise<{ error: string; details?: string }> {
  try {
    const errorText = await response.text();
    
    // Check if response is HTML (likely redirect to login)
    if (errorText.trim().startsWith('<!DOCTYPE') || errorText.trim().startsWith('<html')) {
      return {
        error: 'Niet geautoriseerd. Log opnieuw in.',
      };
    }

    // Try to parse as JSON
    try {
      const errorData = JSON.parse(errorText);
      return {
        error: errorData.error || errorData.message || 'Onbekende fout',
        details: errorData.details,
      };
    } catch {
      // Not JSON, return text (truncated if too long)
      return {
        error: errorText.length > 200 ? errorText.substring(0, 200) + '...' : errorText,
      };
    }
  } catch {
    return {
      error: 'Kon foutmelding niet lezen',
    };
  }
}

/**
 * Genereert gebruiksvriendelijke error informatie op basis van error type en context
 */
export function getErrorInfo(error: unknown, context?: ErrorContext): ErrorInfo {
  // Offline detection
  if (isOffline()) {
    return {
      title: 'Geen internetverbinding',
      description: 'Controleer je internetverbinding en probeer het opnieuw.',
      retryable: true,
    };
  }

  // Network errors (fetch failures)
  if (isNetworkError(error)) {
    return {
      title: 'Verbinding verbroken',
      description: 'Kon geen verbinding maken met de server. Probeer het opnieuw.',
      retryable: true,
    };
  }

  // Timeout errors
  if (isTimeoutError(error)) {
    return {
      title: 'Verbinding timeout',
      description: 'De verbinding duurde te lang. Probeer het opnieuw.',
      retryable: true,
    };
  }

  // HTTP status codes
  if (context?.statusCode) {
    switch (context.statusCode) {
      case 401:
        return {
          title: 'Niet geautoriseerd',
          description: 'Je sessie is verlopen. Log opnieuw in.',
          retryable: false,
          statusCode: 401,
        };
      case 403:
        return {
          title: 'Geen toegang',
          description: 'Je hebt geen toegang tot deze actie.',
          retryable: false,
          statusCode: 403,
        };
      case 404:
        return {
          title: 'Niet gevonden',
          description: context.operation
            ? `${context.operation} niet gevonden.`
            : 'De gevraagde resource bestaat niet.',
          retryable: false,
          statusCode: 404,
        };
      case 400:
        return {
          title: 'Ongeldige aanvraag',
          description: error instanceof Error ? error.message : 'Controleer je invoer en probeer het opnieuw.',
          retryable: false,
          statusCode: 400,
        };
      case 429:
        return {
          title: 'Te veel aanvragen',
          description: 'Je hebt te veel aanvragen gedaan. Wacht even en probeer het later opnieuw.',
          retryable: true,
          statusCode: 429,
        };
      case 500:
        return {
          title: 'Serverfout',
          description: 'Er ging iets mis op de server. Probeer het later opnieuw.',
          retryable: true,
          statusCode: 500,
        };
      case 503:
        return {
          title: 'Service niet beschikbaar',
          description: 'De service is tijdelijk niet beschikbaar. Probeer het later opnieuw.',
          retryable: true,
          statusCode: 503,
        };
      default:
        return {
          title: 'Fout opgetreden',
          description: error instanceof Error ? error.message : `HTTP ${context.statusCode}`,
          retryable: context.statusCode >= 500,
          statusCode: context.statusCode,
        };
    }
  }

  // Generic error
  if (error instanceof Error) {
    // Check for specific error messages
    if (error.message.includes('Niet geautoriseerd') || error.message.includes('Log opnieuw in')) {
      return {
        title: 'Niet geautoriseerd',
        description: error.message,
        retryable: false,
      };
    }

    if (error.message.includes('Validatiefout') || error.message.includes('validatie')) {
      return {
        title: 'Validatiefout',
        description: error.message,
        retryable: false,
      };
    }

    return {
      title: 'Fout opgetreden',
      description: error.message,
      retryable: true,
    };
  }

  // Unknown error
  return {
    title: 'Onbekende fout',
    description: 'Er ging iets mis. Probeer het opnieuw.',
    retryable: true,
  };
}

/**
 * Wrapper voor fetch met verbeterde error handling
 */
export async function safeFetch(
  url: string,
  options?: RequestInit,
  context?: Omit<ErrorContext, 'statusCode'>
): Promise<Response> {
  // Check offline first
  if (isOffline()) {
    throw new Error('Geen internetverbinding');
  }

  try {
    const response = await fetch(url, {
      ...options,
      // Add timeout (30 seconds)
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      const errorData = await parseErrorResponse(response);
      const error = new Error(errorData.error);
      (error as any).statusCode = response.status;
      (error as any).details = errorData.details;
      throw error;
    }

    return response;
  } catch (error) {
    // Re-throw with context if it's already an Error with statusCode
    if (error instanceof Error && (error as any).statusCode) {
      throw error;
    }

    // Wrap network errors
    if (isNetworkError(error) || isTimeoutError(error)) {
      throw error;
    }

    // Re-throw as-is
    throw error;
  }
}

/**
 * Retry logic voor retryable errors
 */
export async function retryFetch<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const errorInfo = getErrorInfo(error);

      // Don't retry if not retryable
      if (!errorInfo.retryable) {
        throw error;
      }

      // Don't retry on last attempt
      if (attempt === maxRetries - 1) {
        throw error;
      }

      // Wait before retrying (exponential backoff)
      await new Promise((resolve) => setTimeout(resolve, delayMs * (attempt + 1)));
    }
  }

  throw lastError;
}




