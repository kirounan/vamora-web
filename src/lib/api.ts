import { API_BASE_URL } from '../config';

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, message: string, body?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

interface SignInResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    name?: string | null;
    nickname?: string | null;
  };
}

async function parseResponse(res: Response): Promise<unknown> {
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      return await res.json();
    } catch {
      return null;
    }
  }
  try {
    return await res.text();
  } catch {
    return null;
  }
}

function extractErrorMessage(body: unknown, fallback: string): string {
  if (body && typeof body === 'object') {
    const anyBody = body as Record<string, unknown>;
    const message = anyBody.message;
    if (typeof message === 'string' && message.length > 0) return message;
    if (Array.isArray(message) && message.length > 0)
      return String(message[0]);
    if (typeof anyBody.error === 'string') return anyBody.error;
  }
  if (typeof body === 'string' && body.length > 0) return body;
  return fallback;
}

export async function signIn(
  email: string,
  password: string,
): Promise<SignInResponse> {
  const res = await fetch(`${API_BASE_URL}/api/v1/auth/signin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const body = await parseResponse(res);

  if (!res.ok) {
    throw new ApiError(
      res.status,
      extractErrorMessage(
        body,
        res.status === 401
          ? 'Invalid email or password.'
          : 'We could not sign you in. Please try again.',
      ),
      body,
    );
  }

  return body as SignInResponse;
}

export async function deleteMyAccount(accessToken: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/v1/users/me`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    const body = await parseResponse(res);
    throw new ApiError(
      res.status,
      extractErrorMessage(
        body,
        'We could not delete your account. Please try again later.',
      ),
      body,
    );
  }
}
