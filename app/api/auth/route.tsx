import { NextResponse } from 'next/server';

export async function GET() {
  const token = crypto.randomUUID();
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=Auth_${token}&bgcolor=ffffff&color=000000&margin=0`;

  return NextResponse.json({
    url: qrImageUrl,
    token: token,
    expiresIn: 60
  });
}