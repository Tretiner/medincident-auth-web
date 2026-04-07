'use client';

import { Type, Zap, Sun, Check, Eye, RotateCcw, ALargeSmall, ImageOff } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useSettingsStore, type FontSize, type Contrast, type LetterSpacing } from '@/shared/stores/settings.store';
import { ThemeToggle } from '@/shared/ui/theme-toggle';
import { PageHeader } from '../../_components/page-header';
import { Settings2 } from 'lucide-react';

const FONT_SIZES: { value: FontSize; label: string; preview: string }[] = [
  { value: 'md', label: 'Стандартный', preview: 'Aa' },
  { value: 'lg', label: 'Крупный', preview: 'Aa' },
  { value: 'xl', label: 'Очень крупный', preview: 'Aa' },
];

const CONTRAST_OPTIONS: {
  value: Contrast;
  label: string;
  bg: string;
  text: string;
  border: string;
}[] = [
  { value: 'normal',      label: 'Обычный',   bg: 'bg-background',    text: 'text-foreground',    border: 'border-border' },
  { value: 'high-black',  label: 'Чёрный',    bg: 'bg-black',         text: 'text-white',         border: 'border-zinc-600' },
  { value: 'high-white',  label: 'Белый',     bg: 'bg-white',         text: 'text-black',         border: 'border-zinc-400' },
  { value: 'high-yellow', label: 'Жёлтый',    bg: 'bg-black',         text: 'text-yellow-400',    border: 'border-yellow-600' },
];

const LETTER_SPACINGS: { value: LetterSpacing; label: string; preview: string }[] = [
  { value: 'normal', label: 'Обычный',  preview: 'Аб' },
  { value: 'md',     label: 'Средний',  preview: 'А б' },
  { value: 'lg',     label: 'Большой',  preview: 'А  б' },
];

export function SettingsView() {
  const {
    fontSize, animations, contrast, letterSpacing, hideImages,
    setFontSize, setAnimations, setContrast, setLetterSpacing, setHideImages,
    resetAccessibility,
  } = useSettingsStore();

  const hasAccessibilityChanges =
    contrast !== 'normal' || letterSpacing !== 'normal' || hideImages || fontSize !== 'md';

  return (
    <div className="space-y-8">
      <PageHeader
        title="Настройки приложения"
        description="Внешний вид и поведение интерфейса"
        icon={Settings2}
      />

      {/* Тема */}
      <section className="space-y-3">
        <p className="section-label flex items-center gap-2">
          <Sun className="size-4" />
          Тема
        </p>
        <ThemeToggle variant="segmented" className="w-full" />
      </section>

      {/* Размер шрифта */}
      <section className="space-y-3">
        <p className="section-label flex items-center gap-2">
          <Type className="size-4" />
          Размер шрифта
        </p>
        <div className="grid grid-cols-3 gap-3">
          {FONT_SIZES.map(({ value, label, preview }) => {
            const isActive = fontSize === value;
            const previewSize =
              value === 'md' ? 'text-base' : value === 'lg' ? 'text-xl' : 'text-3xl';
            return (
              <button
                key={value}
                onClick={() => setFontSize(value)}
                className={cn(
                  'flex flex-col items-center gap-2 rounded-xl border p-4 text-sm font-medium transition-colors',
                  isActive
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <span className={cn('font-semibold leading-none', previewSize)}>{preview}</span>
                <span className="text-xs">{label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Специальные возможности */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="section-label flex items-center gap-2">
            <Eye className="size-4" />
            Специальные возможности
          </p>
          {hasAccessibilityChanges && (
            <button
              onClick={resetAccessibility}
              className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <RotateCcw className="size-3" />
              Сбросить
            </button>
          )}
        </div>

        {/* Контраст */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground ml-1">Контрастность</p>
          <div className="grid grid-cols-4 gap-2">
            {CONTRAST_OPTIONS.map(({ value, label, bg, text, border }) => {
              const isActive = contrast === value;
              return (
                <button
                  key={value}
                  onClick={() => setContrast(value)}
                  title={label}
                  className={cn(
                    'flex flex-col items-center gap-2 rounded-xl border-2 p-3 text-xs font-medium transition-colors',
                    bg, text, border,
                    isActive ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : 'opacity-80 hover:opacity-100'
                  )}
                >
                  <span className="text-base font-bold leading-none">Аа</span>
                  <span className="leading-tight">{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Межбуквенный интервал */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground ml-1 flex items-center gap-1.5">
            <ALargeSmall className="size-3.5" />
            Межбуквенный интервал
          </p>
          <div className="grid grid-cols-3 gap-2">
            {LETTER_SPACINGS.map(({ value, label, preview }) => {
              const isActive = letterSpacing === value;
              const spacing =
                value === 'normal' ? 'tracking-normal' : value === 'md' ? 'tracking-wide' : 'tracking-widest';
              return (
                <button
                  key={value}
                  onClick={() => setLetterSpacing(value)}
                  className={cn(
                    'flex flex-col items-center gap-1.5 rounded-xl border p-3 text-xs font-medium transition-colors',
                    isActive
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <span className={cn('text-sm font-semibold', spacing)}>{preview}</span>
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Скрытие изображений */}
        <label
          htmlFor="hide-images-toggle"
          className="flex cursor-pointer items-center justify-between rounded-xl border border-border bg-card p-4"
        >
          <div className="flex items-center gap-3">
            <ImageOff className="size-4 text-muted-foreground shrink-0" />
            <div className="space-y-0.5">
              <p className="text-sm font-medium">Скрыть изображения</p>
              <p className="text-xs text-muted-foreground">Отключить отображение картинок</p>
            </div>
          </div>
          <div className="relative ml-4 flex size-5 shrink-0 items-center justify-center">
            <input
              type="checkbox"
              id="hide-images-toggle"
              checked={hideImages}
              onChange={(e) => setHideImages(e.target.checked)}
              className="peer absolute inset-0 cursor-pointer opacity-0"
            />
            <div className={cn(
              'flex size-5 items-center justify-center rounded border-2 transition-colors',
              hideImages ? 'border-primary bg-primary' : 'border-input bg-card'
            )}>
              <Check className={cn(
                'size-3 text-primary-foreground transition-opacity',
                hideImages ? 'opacity-100' : 'opacity-0'
              )} />
            </div>
          </div>
        </label>
      </section>

      {/* Анимации */}
      <section className="space-y-3">
        <p className="section-label flex items-center gap-2">
          <Zap className="size-4" />
          Интерфейс
        </p>
        <label
          htmlFor="animations-toggle"
          className="flex cursor-pointer items-center justify-between rounded-xl border border-border bg-card p-4"
        >
          <div className="space-y-0.5">
            <p className="text-sm font-medium">Анимации</p>
            <p className="text-xs text-muted-foreground">
              Плавные переходы и эффекты интерфейса
            </p>
          </div>
          <div className="relative ml-4 flex size-5 shrink-0 items-center justify-center">
            <input
              type="checkbox"
              id="animations-toggle"
              checked={animations}
              onChange={(e) => setAnimations(e.target.checked)}
              className="peer absolute inset-0 cursor-pointer opacity-0"
            />
            <div className={cn(
              'flex size-5 items-center justify-center rounded border-2 transition-colors',
              animations ? 'border-primary bg-primary' : 'border-input bg-card'
            )}>
              <Check className={cn(
                'size-3 text-primary-foreground transition-opacity',
                animations ? 'opacity-100' : 'opacity-0'
              )} />
            </div>
          </div>
        </label>
      </section>
    </div>
  );
}
