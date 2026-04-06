"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/shared/ui/dialog";
import { KeyRound, Loader2, Eye, EyeOff } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { PasswordRequirements } from "@/shared/ui/password-requirements";
import { changePasswordAction } from "../security.actions";
import { toast } from "sonner";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Введите текущий пароль"),
    newPassword: z
      .string()
      .min(8, "Не менее 8 символов")
      .max(70, "Не более 70 символов")
      .regex(/[A-ZА-ЯЁ]/, "Должен содержать заглавную букву")
      .regex(/[a-zа-яё]/, "Должен содержать строчную букву")
      .regex(/\d/, "Должен содержать цифру")
      .regex(/[^a-zA-Zа-яА-ЯёЁ0-9\s]/, "Должен содержать символ или знак пунктуации"),
    confirmPassword: z.string().min(1, "Подтвердите новый пароль"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Пароли не совпадают",
    path: ["confirmPassword"],
  });

type ChangePasswordForm = z.infer<typeof changePasswordSchema>;

export function ChangePasswordDialog() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [showPasswords, setShowPasswords] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
  });

  const newPasswordValue = watch("newPassword", "");

  function onSubmit(data: ChangePasswordForm) {
    startTransition(async () => {
      const result = await changePasswordAction(data.currentPassword, data.newPassword);

      if (result.success) {
        toast.success("Пароль успешно изменён");
        setOpen(false);
        reset();
      } else {
        toast.error(result.error || "Не удалось сменить пароль");
      }
    });
  }

  function handleOpenChange(isOpen: boolean) {
    setOpen(isOpen);
    if (!isOpen) {
      reset();
      setShowPasswords(false);
    }
  }

  const inputType = showPasswords ? "text" : "password";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <KeyRound className="h-4 w-4" />
          Сменить пароль
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Смена пароля</DialogTitle>
          <DialogDescription>
            Введите текущий пароль и задайте новый
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Текущий пароль</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={inputType}
                autoComplete="current-password"
                className={cn(
                  "pr-10",
                  errors.currentPassword && "border-destructive focus-visible:ring-destructive"
                )}
                {...register("currentPassword")}
              />
              <button
                type="button"
                onClick={() => setShowPasswords(!showPasswords)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.currentPassword && (
              <p className="text-2xs text-destructive">{errors.currentPassword.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">Новый пароль</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={inputType}
                autoComplete="new-password"
                className={cn(
                  "pr-10",
                  errors.newPassword && "border-destructive focus-visible:ring-destructive"
                )}
                {...register("newPassword")}
              />
              <button
                type="button"
                onClick={() => setShowPasswords(!showPasswords)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <PasswordRequirements password={newPasswordValue} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Подтвердите пароль</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={inputType}
                autoComplete="new-password"
                className={cn(
                  "pr-10",
                  errors.confirmPassword && "border-destructive focus-visible:ring-destructive"
                )}
                {...register("confirmPassword")}
              />
              <button
                type="button"
                onClick={() => setShowPasswords(!showPasswords)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-2xs text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 animate-spin" />}
            Сменить пароль
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
