"server only";

import { env } from "@/config/env";

export const Method = {
  Get: "GET",
  Post: "POST",
};

export const Headers = {
  Accept: {
    Json: { "Accept": "application/json" },
  },
  Content: {
    Json: { "Content-Type": "application/json" },
  },
};

export const BASE_URL = env.ZITADEL_API_URL;
export const TOKEN = env.ZITADEL_API_TOKEN;

export async function fetchZitadel(path: string, options: RequestInit = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      ...Headers.Accept.Json,
      ...Headers.Content.Json,
      "Authorization": `Bearer ${TOKEN}`,
      ...options.headers,
    },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Zitadel API error (${res.status}): ${err}`);
  }
  return res.json();
}