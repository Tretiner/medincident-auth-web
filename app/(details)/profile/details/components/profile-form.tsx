'use client';

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

// Hook Import
import { useProfileDetails } from "../profile.hooks";

export function ProfileForm({ user }: { user: User }) {
  // 1. Init ViewModel
  const { state, actions } = useProfileDetails(user);
  const { form, isSaving, isDirty, message } = state;
  const { register } = form;

  // Local UI state (Confirmation Modal)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // 2. Handlers
  const handleSaveAttempt = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isDirty) {
      setIsConfirmOpen(true);
    }
  };

  const handleConfirm = () => {
    setIsConfirmOpen(false);
    actions.onSubmit();
  };

  return (
    <div className="space-y-8">
      {/* FORM FIELDS */}
      <div className="grid gap-6">
        <div className="space-y-2">
            <Label htmlFor="firstName">Имя</Label>
            <Input id="firstName" {...register("firstName")} className="bg-background" defaultValue={user.firstName} />
        </div>

        <div className="space-y-2">
            <Label htmlFor="lastName">Фамилия</Label>
            <Input id="lastName" {...register("lastName")} className="bg-background" defaultValue={user.lastName} />
        </div>
        
        <div className="space-y-2">
            <Label htmlFor="middleName">Отчество</Label>
            <Input id="middleName" {...register("middleName")} className="bg-background" defaultValue={user.middleName} />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} className="bg-background" defaultValue={user.email} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Телефон</Label>
            <Input id="phone" type="tel" {...register("phone")} className="bg-background" defaultValue={user.phone} />
          </div>
        </div>
      </div>

      {/* FOOTER ACTIONS */}
      <div className="flex items-center justify-between pt-6 border-t border-border">
        
        {/* Feedback Zone */}
        <div className="flex-1 pr-4 flex items-center gap-3">
          {isDirty && !message && (
             <span className="text-sm font-medium text-amber-600 dark:text-amber-500 animate-in fade-in slide-in-from-left-2 flex items-center gap-1.5">
               <span className="w-2 h-2 rounded-full bg-amber-500" />
               Данные изменены
             </span>
          )}

          {message && (
            <div className={cn(
              "flex items-center gap-2 text-sm font-medium animate-in fade-in zoom-in-95",
              message.type === 'success' ? 'text-green-600 dark:text-green-400' : 'text-destructive'
            )}>
              {message.type === 'success' ? <CheckCircle2 className="w-4 h-4"/> : <AlertCircle className="w-4 h-4"/>}
              {message.text}
            </div>
          )}
        </div>

        <Button 
          onClick={handleSaveAttempt} 
          disabled={isSaving || !isDirty}
          className="bg-primary hover:bg-primary/90 text-white min-w-[140px] shadow-sm transition-all"
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
        <DialogContent className="sm:max-w-[400px] rounded-xl">
          <DialogHeader>
            <DialogTitle>Сохранить изменения?</DialogTitle>
            <DialogDescription className="pt-2">
              Вы внесли изменения в личные данные. Подтвердите сохранение, чтобы обновить профиль.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsConfirmOpen(false)} className="rounded-lg">
              Отмена
            </Button>
            <Button onClick={handleConfirm} className="bg-primary hover:bg-primary/90 text-white rounded-lg">
              Подтвердить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}