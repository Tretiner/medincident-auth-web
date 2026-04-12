/**
 * Генерирует URL мок-аватарки для dev/тестирования.
 * Использует внешний сервис i.pravatar.cc (детерминировано по seed).
 */
export function getMockAvatarUrl(seed: string, size = 150): string {
  return `https://i.pravatar.cc/${size}?u=${encodeURIComponent(seed)}`;
}