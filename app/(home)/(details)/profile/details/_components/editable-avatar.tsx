"use client";

import { useState, useRef, useTransition } from "react";
import { Camera, Loader2 } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"; // Замени на свои пути к UI компонентам
import { uploadAvatarAction } from "../profile.actions"; // Путь до твоего экшена
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface EditableAvatarProps {
  currentAvatarUrl: string | undefined;
  initials: string;
}

export function EditableAvatar({ currentAvatarUrl, initials }: EditableAvatarProps) {
  const [isPending, startTransition] = useTransition();
  const [previewUrl, setPreviewUrl] = useState(currentAvatarUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Оптимистичное обновление: сразу показываем локальную картинку
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    startTransition(async () => {
      const formData = new FormData();
      formData.append("avatar", file);

      const result = await uploadAvatarAction(formData);

      if (!result?.success) {
        setPreviewUrl(currentAvatarUrl);
        console.error("Ошибка при загрузке аватара:", result?.error);
        toast("Ошибка загрузки")
      }
    });
  };

  return (
    <div 
      className="relative inline-block group cursor-pointer rounded-full"
      onClick={() => fileInputRef.current?.click()}
    >
      <Avatar className="w-16 h-16 border border-border">
        <AvatarImage src={previewUrl} alt="Аватар пользователя" className="object-cover" />
        <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
          {initials}
        </AvatarFallback>
      </Avatar>

      {/* Оверлей при наведении */}
      <div className={cn("absolute inset-0 bg-black/40 rounded-full flex items-center justify-center group-hover:opacity-100 transition-opacity duration-200", isPending ? "opacity-50" : "opacity-0")}>
        {isPending ? (
          <Loader2 className="w-6 h-6 text-white animate-spin" />
        ) : (
          <Camera className="w-6 h-6 text-white" />
        )}
      </div>

      {/* Скрытый инпут для выбора файла */}
      <input
        type="file"
        accept="image/png, image/jpeg, image/webp"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
        disabled={isPending}
      />
    </div>
  );
}