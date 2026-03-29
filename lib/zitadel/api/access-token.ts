"use server"

import { env } from '@/config/env';
import { readFile } from 'fs/promises';
import { SignJWT } from 'jose';
import crypto from 'node:crypto';

const KEY_PATH = env.ZITADEL_MACHINE_KEY_PATH;
const ZITADEL_DOMAIN = env.ZITADEL_API_URL;

let cachedAccessToken: string | null = null;
let tokenExpiresAt: number | null = null;

export async function getZitadelAccessToken(): Promise<string> {
  const now = Date.now();
  
  if (cachedAccessToken && tokenExpiresAt && now < tokenExpiresAt - 5 * 60 * 1000) {
    console.log("cached access token:", cachedAccessToken)
    return cachedAccessToken;
  }
  console.log("NOT CACHED access token")

  let machineKey;
  try {
    const fileContent = await readFile(KEY_PATH, 'utf-8');
    machineKey = JSON.parse(fileContent);
  } catch (error) {
    console.error("Не удалось прочитать файл ключа ZITADEL:", error);
    throw new Error("Ошибка чтения ZITADEL_MACHINE_KEY_PATH");
  }

  if (!machineKey.key || !machineKey.userId) {
    throw new Error("Неверный формат JSON ключа ZITADEL");
  }

  const privateKey = crypto.createPrivateKey(machineKey.key);

  // 2. Создаем JWT Assertion
  const signedAssertion = await new SignJWT({
    iss: machineKey.userId, 
    sub: machineKey.userId, 
    aud: ZITADEL_DOMAIN,    
  })
    .setProtectedHeader({ alg: 'RS256', kid: machineKey.keyId })
    .setIssuedAt()
    .setExpirationTime('1m') 
    .sign(privateKey);

  // 3. Получаем Access Token
  const tokenUrl = `${ZITADEL_DOMAIN}/oauth/v2/token`;
  const body = new URLSearchParams({
    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    assertion: signedAssertion,
    scope: 'openid profile email urn:zitadel:iam:org:project:role:custom_ui_service urn:zitadel:iam:org:project:roles urn:zitadel:iam:org:project:id:zitadel:aud urn:zitadel:iam:org:project:id:365068666124894213:aud', 
  });

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
    cache: 'no-store',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Ошибка получения токена Zitadel: ${errorText}`);
  }

  const data = await response.json();
  
  // 4. Кэшируем
  cachedAccessToken = data.access_token;
  tokenExpiresAt = now + (data.expires_in * 1000);

  return cachedAccessToken!;
}