"use client";

import { QRCode } from "react-qrcode-logo";
import { useCssVar } from "@/shared/lib/use-css-var";

interface SmoothQrProps {
  value: string;
  size: number;
  quietZone?: number;
}

export function SmoothQr({ value, size, quietZone = 6 }: SmoothQrProps) {
  const fgColor = useCssVar("--qr-fg");
  const radius = Math.round(size * 0.055);

  return (
    <QRCode
      value={value}
      size={size * 2}
      qrStyle="fluid"
      eyeRadius={[
        [radius, radius, radius, radius],
        [radius, radius, radius, radius],
        [radius, radius, radius, radius],
      ]}
      quietZone={quietZone * 2}
      fgColor={fgColor}
      bgColor="#00000000"
      ecLevel="L"
      style={{ width: size, height: size }}
    />
  );
}
