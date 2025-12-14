'use server';

export async function fetchQrCode(): Promise<string> {
  const token = Math.random().toString(36).substring(7);
  // return `https://tenor.com/view/медведь-гол-гоооол-медведь-гол-gif-5260236862107841003`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=Auth_${token}`;
}

export async function login(provider: string): Promise<boolean> {
  await new Promise(r => setTimeout(r, 1000));
  return true;
}