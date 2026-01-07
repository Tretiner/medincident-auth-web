'use server';

import { deleteSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { env } from "@/env";

export async function fetchQrCode(): Promise<string> {
  try {
    const response = await fetch(`${env.NEXT_PUBLIC_APP_URL}/api/auth`, {
      method: 'GET',
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch QR code');
    }

    const data = await response.json();
    return `/медведь-гол-гоооол.gif`;
    // return data.url;
  } catch (error) {
    console.error("QR Fetch Error:", error);
    return `/медведь-гол-гоооол.gif`; 
  }
}

export async function login(provider: string): Promise<boolean> {
  await new Promise(r => setTimeout(r, 1000));
  return true;
}

export async function logout() {
  await deleteSession();
  redirect('/login');
}