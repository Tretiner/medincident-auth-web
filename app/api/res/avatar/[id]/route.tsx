import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get("u");

  if (!userId) {
    return new NextResponse("Missing user ID", { status: 400 });
  }

  const externalUrl = `https://i.pravatar.cc/${id}?u=${userId}`;

  try {
    const response = await fetch(externalUrl, {
      cache: 'force-cache', 
      // Важно: если внешний источник поддерживает ETag/Last-Modified, можно добавить заголовки сюда
    });

    if (!response.ok) throw new Error("Failed to fetch upstream image");

    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get("content-type") || "image/jpeg";

    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Proxy Error:", error);
    return new NextResponse("Error fetching image", { status: 500 });
  }
}