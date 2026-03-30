"use client";

import { Controller, UseFormReturn } from "react-hook-form";
import { PersonalInfoFormData } from "@/domain/profile/schema";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Loader2, CheckCircle2, AlertCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export interface FormMessage {
  type: "success" | "error";
  text: string;
}

interface ProfileFormProps {
  form: UseFormReturn<PersonalInfoFormData>;
  isSaving: boolean;
  message: FormMessage | null;
  isEmailVerified?: boolean; // Добавили пропс для статуса email
  onSubmit: (e: React.FormEvent) => void;
}

export function ProfileForm({
  form,
  isSaving,
  message,
  isEmailVerified = false,
  onSubmit,
}: ProfileFormProps) {
  const {
    register,
    formState: { errors, isDirty, isValid, dirtyFields }, // Достали dirtyFields
  } = form;

  // Если поле email было изменено пользователем, оно точно потребует подтверждения
  const willRequireVerification = dirtyFields.email || !isEmailVerified;

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid gap-6">
        {/* ИМЯ */}
        <div className="space-y-2">
          <Label
            htmlFor="firstName"
            className={cn(errors.firstName && "text-destructive")}
          >
            Имя
          </Label>
          <Input
            id="firstName"
            {...register("firstName")}
            defaultValue={form.getValues().firstName}
            disabled={isSaving}
            className={cn(
              errors.firstName &&
                "border-destructive focus-visible:ring-destructive"
            )}
          />
          {errors.firstName && (
            <span className="text-xs font-medium text-destructive mt-1 block animate-in fade-in">
              {errors.firstName.message}
            </span>
          )}
        </div>

        {/* ФАМИЛИЯ */}
        <div className="space-y-2">
          <Label
            htmlFor="lastName"
            className={cn(errors.lastName && "text-destructive")}
          >
            Фамилия
          </Label>
          <Input
            id="lastName"
            {...register("lastName")}
            defaultValue={form.getValues().lastName}
            disabled={isSaving}
            className={cn(
              errors.lastName &&
                "border-destructive focus-visible:ring-destructive"
            )}
          />
          {errors.lastName && (
            <span className="text-[11px] font-medium text-destructive mt-1 block animate-in fade-in">
              {errors.lastName.message}
            </span>
          )}
        </div>

        {/* ОТЧЕСТВО */}
        <div className="space-y-2">
          <Label htmlFor="middleName">Отчество</Label>
          <Input
            id="middleName"
            {...register("middleName")}
            defaultValue={form.getValues().middleName}
            disabled={isSaving}
          />
        </div>

        {/* КОНТАКТЫ (GRID) */}
        <div className="space-y-2">
          {/* Флекс-контейнер для лейбла и статуса */}
          <div className="flex items-center justify-between">
            <Label
              htmlFor="email"
              className={cn(errors.email && "text-destructive")}
            >
              Email
            </Label>
            
            {/* Вывод статуса верификации с цветом */}
            <span
              className={cn(
                "text-xs font-medium flex items-center gap-1.5 transition-colors duration-200",
                willRequireVerification ? "text-amber-500" : "text-emerald-500"
              )}
            >
              {dirtyFields.email ? (
                <>
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Потребует подтверждения
                </>
              ) : isEmailVerified ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Подтвержден
                </>
              ) : (
                <>
                  <AlertCircle className="w-3.5 h-3.5" />
                  Не подтвержден
                </>
              )}
            </span>
          </div>

          <Input
            id="email"
            type="email"
            {...register("email")}
            defaultValue={form.getValues().email}
            disabled={isSaving}
            className={cn(
              errors.email &&
                "border-destructive focus-visible:ring-destructive"
            )}
          />
          {errors.email && (
            <span className="text-[11px] text-destructive">
              {errors.email.message}
            </span>
          )}
        </div>
      </div>

      {/* FOOTER ACTIONS & STATUS */}
      <div className="flex items-center justify-between pt-6 border-t border-border">
        {/* Статусная зона */}
        <div className="flex-1 pr-4 flex items-center gap-3 min-h-[20px]">
          {/* Status: Modified */}
          {isDirty && isValid && !message && (
            <span className="text-sm font-medium text-warning animate-in fade-in slide-in-from-left-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-warning shadow-none" />
              Данные изменены
            </span>
          )}

          {/* Status: Result Message */}
          {message && (
            <div
              className={cn(
                "flex items-center gap-2 text-sm font-medium animate-in fade-in zoom-in-95",
                message.type === "success" ? "text-primary" : "text-destructive"
              )}
            >
              {message.type === "success" ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              {message.text}
            </div>
          )}
        </div>

        <Button
          type="submit"
          disabled={isSaving || !isDirty}
          className="min-w-[140px] bg-primary text-primary-foreground shadow-none"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Сохраняем
            </>
          ) : (
            "Сохранить"
          )}
        </Button>
      </div>
    </form>
  );
}