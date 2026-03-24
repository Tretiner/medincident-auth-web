export function parseUserAgent(uaString: string): string {
  if (!uaString) return "Неизвестное устройство";

  const ua = uaString.toLowerCase();

  let os = "";
  if (ua.includes("windows nt 10.0") || ua.includes("windows nt 11.0")) os = "Windows 10/11";
  else if (ua.includes("windows nt")) os = "Windows";
  else if (ua.includes("mac os x") || ua.includes("macintosh")) os = "macOS";
  else if (ua.includes("android")) os = "Android";
  else if (ua.includes("iphone") || ua.includes("ipad") || ua.includes("ipod")) os = "iOS";
  else if (ua.includes("linux")) os = "Linux";

  let browser = "";
  if (ua.includes("yabrowser")) browser = "Yandex Browser";
  else if (ua.includes("edg/")) browser = "Edge";
  else if (ua.includes("opr/") || ua.includes("opera/")) browser = "Opera";
  else if (ua.includes("chrome/") || ua.includes("crios/")) browser = "Chrome";
  else if (ua.includes("firefox/") || ua.includes("fxios/")) browser = "Firefox";
  else if (ua.includes("safari/") && ua.includes("version/")) browser = "Safari";

  if (browser && os) {
    return `${browser} (${os})`;
  } else if (browser || os) {
    return browser || os;
  }

  return "Неизвестное устройство";
}