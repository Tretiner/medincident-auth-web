"use client";

import { useState } from "react";
import { User } from "@/domain/profile/types";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/presentation/components/ui/dialog";
import { useProfileDetails } from "../profile.hooks";

const ErrorMessage = ({ error }: { error?: { message?: string } }) => {
  if (!error?.message) return null;
  return (
    <span className="text-[11px] font-medium text-destructive mt-1 block animate-in fade-in slide-in-from-top-1">
      {error.message}
    </span>
  );
};

export function ProfileForm({ user }: { user: User }) {
  const { state, actions } = useProfileDetails(user);
  const { form, isSaving, isDirty, isValid, errors, message } = state;
  const { register } = form;

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleSaveAttempt = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isDirty && isValid) {
      setIsConfirmOpen(true);
    } else {
      form.trigger();
    }
  };

  const handleConfirm = () => {
    setIsConfirmOpen(false);
    actions.onSubmit();
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6">
        {/* FIRST NAME */}
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
            className={cn(
              "bg-background transition-colors",
              errors.firstName &&
                "border-destructive focus-visible:ring-destructive text-destructive placeholder:text-destructive/50"
            )}
          />
          <ErrorMessage error={errors.firstName} />
        </div>

        {/* LAST NAME */}
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
            className={cn(
              "bg-background transition-colors",
              errors.lastName &&
                "border-destructive focus-visible:ring-destructive text-destructive placeholder:text-destructive/50"
            )}
          />
          <ErrorMessage error={errors.lastName} />
        </div>

        {/* MIDDLE NAME */}
        <div className="space-y-2">
          <Label htmlFor="middleName">Отчество</Label>
          <Input
            id="middleName"
            {...register("middleName")}
            className={cn(
              "bg-background transition-colors",
              errors.middleName &&
                "border-destructive focus-visible:ring-destructive text-destructive placeholder:text-destructive/50"
            )}
          />
          <ErrorMessage error={errors.middleName} />
        </div>

        {/* CONTACT GRID */}
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
              className={cn(
                "bg-background transition-colors",
                errors.email &&
                  "border-destructive focus-visible:ring-destructive text-destructive placeholder:text-destructive/50"
              )}
            />
            <ErrorMessage error={errors.email} />
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
              pattern="\+(9[976]\d|8[987530]\d|6[987]\d|5[90]\d|42\d|3[875]\d|
2[98654321]\d|9[8543210]|8[6421]|6[6543210]|5[87654321]|
4[987654310]|3[9643210]|2[70]|7|1)\d{1,14}$"
              {...register("phone")}
              className={cn(
                "bg-background transition-colors",
                errors.phone &&
                  "border-destructive focus-visible:ring-destructive text-destructive placeholder:text-destructive/50"
              )}
            />
            <ErrorMessage error={errors.phone} />
          </div>
        </div>
      </div>

      {/* FOOTER ACTIONS */}
      <div className="flex items-center justify-between pt-6 border-t border-border mt-2">
        {/* Feedback Zone */}
        <div className="flex-1 pr-4 flex items-center gap-3">
          {/* Status: Modified (Warning Color) */}
          {isDirty && isValid && !message && (
            <span className="text-sm font-medium text-warning animate-in fade-in slide-in-from-left-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-warning shadow-[0_0_8px_var(--color-warning)]" />
              Данные изменены
            </span>
          )}

          {/* Status: Result Message */}
          {message && (
            <div
              className={cn(
                "flex items-center gap-2 text-sm font-medium animate-in fade-in zoom-in-95",
                message.type === "success"
                  ? "text-primary"
                  : "text-destructive"
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
          onClick={handleSaveAttempt}
          disabled={isSaving || !isDirty}
          className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-[140px] shadow-sm transition-all"
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

      {/* CONFIRMATION DIALOG */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-xl bg-card border-border shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              Сохранить изменения?
            </DialogTitle>
            <DialogDescription className="pt-2 text-muted-foreground">
              Вы внесли изменения в личные данные. Подтвердите сохранение, чтобы
              обновить профиль.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsConfirmOpen(false)}
              className="rounded-lg border-input hover:bg-accent hover:text-accent-foreground"
            >
              Отмена
            </Button>
            <Button
              onClick={handleConfirm}
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg shadow-sm"
            >
              Подтвердить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}