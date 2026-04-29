"server only";

import { env } from "@/shared/config/env";
import { getZitadelAccessToken } from "./access-token";

export const BASE_URL = env.ZITADEL_API_URL;

export async function fetchZitadel(path: string, options: RequestInit = {}) {
  const token = await getZitadelAccessToken();
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      ...options.headers,
    },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Zitadel API error (${res.status}): ${err}`);
  }
  return res.json();
}
