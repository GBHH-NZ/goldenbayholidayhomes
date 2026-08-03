import { env, hasGuestyCredentials } from "@/lib/env";

type TokenCache = {
  accessToken: string;
  expiresAt: number;
};

let cache: TokenCache | null = null;

export async function getGuestyAccessToken(): Promise<string> {
  if (!hasGuestyCredentials()) {
    throw new Error(
      "Guesty credentials missing. Set GUESTY_CLIENT_ID and GUESTY_CLIENT_SECRET in .env.local, then re-run npm run sync:guesty.",
    );
  }

  if (cache && cache.expiresAt > Date.now() + 60_000) {
    return cache.accessToken;
  }

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    scope: "booking_engine:api",
    client_id: env.GUESTY_CLIENT_ID!,
    client_secret: env.GUESTY_CLIENT_SECRET!,
  });

  const res = await fetch(`${env.GUESTY_API_BASE}/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!res.ok) {
    throw new Error(`Guesty auth failed (${res.status}): ${await res.text()}`);
  }

  const data = (await res.json()) as {
    access_token: string;
    expires_in: number;
  };

  cache = {
    accessToken: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  return cache.accessToken;
}

export async function guestyFetch<T>(
  path: string,
  searchParams?: Record<string, string | undefined>,
): Promise<T> {
  const token = await getGuestyAccessToken();
  const url = new URL(
    path.startsWith("http") ? path : `${env.GUESTY_API_BASE}${path}`,
  );
  if (searchParams) {
    for (const [k, v] of Object.entries(searchParams)) {
      if (v !== undefined) url.searchParams.set(k, v);
    }
  }

  const res = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Guesty API ${path} failed (${res.status}): ${await res.text()}`);
  }

  return res.json() as Promise<T>;
}
