"use client";

import { UseFormReturn } from "react-hook-form";
import { PersonalInfoFormData } from "@/domain/profile/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FormMessage {
  type: "success" | "error";
  text: string;
}

interface ProfileFormProps {
  form: UseFormReturn<PersonalInfoFormData>;
  isSaving: boolean;
  message: FormMessage | null;
  onSubmit: (e: React.FormEvent) => void;
}

export function ProfileForm({
  form,
  isSaving,
  message,
  onSubmit,
}: ProfileFormProps) {
  const {
    register,
    formState: { errors, isDirty, isValid },
  } = form;

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
            <span className="text-[11px] font-medium text-destructive mt-1 block animate-in fade-in">
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
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label
              htmlFor="email"
              className={cn(errors.email && "text-destructive")}
            >
              Email
            </Label>
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

          <div className="space-y-2">
            <Label
              htmlFor="phone"
              className={cn(errors.phone && "text-destructive")}
            >
              Телефон
            </Label>
            <Input
              id="phone"
              type="tel"
              {...register("phone")}
              disabled={isSaving}
              className={cn(
                errors.phone &&
                  "border-destructive focus-visible:ring-destructive"
              )}
            />
            {errors.phone && (
              <span className="text-[11px] text-destructive">
                {errors.phone.message}
              </span>
            )}
          </div>
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
