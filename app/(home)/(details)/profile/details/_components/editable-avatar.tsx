"use client";

import { useState, useRef, useTransition } from "react";
import { Camera, Loader2 } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/shared/ui/avatar";
import { uploadAvatarAction } from "../profile.actions";
import { toast } from "sonner";
import { cn } from "@/shared/lib/utils";

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

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    startTransition(async () => {
      const formData = new FormData();
      formData.append("avatar", file);

      const result = await uploadAvatarAction(formData);

      if (!result?.success) {
        setPreviewUrl(currentAvatarUrl);
        console.error("Ошибка при загрузке аватара:", result?.error);
        toast("Ошибка загрузки");
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

      <div className={cn(
        "absolute inset-0 rounded-full flex items-center justify-center",
        "transition-all duration-200 ease-in-out",
        isPending
          ? "bg-black/80 opacity-100"
          : "bg-black/50 opacity-0 group-hover:opacity-100",
      )}>
        {isPending ? (
          <Loader2 className="w-5 h-5 text-white/80 animate-spin" />
        ) : (
          <Camera className="w-5 h-5 text-white/70 transition-transform duration-300 ease-in-out group-hover:scale-110" />
        )}
      </div>

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
