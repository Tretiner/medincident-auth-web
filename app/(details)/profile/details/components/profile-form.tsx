'use client';

import { useState } from "react";
import { User } from "@/domain/profile/types";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import { useProfileViewModel } from "../profileViewModel";
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

export function ProfileForm({ user }: { user: User }) {
  const { form, state, saveProfile } = useProfileViewModel(user);
  const { register } = form;
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Обработчик клика по кнопке "Сохранить"
  const handleSaveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (state.isDirty) {
      setIsConfirmOpen(true);
    } else {
      saveProfile();
    }
  };

  const confirmSave = () => {
    setIsConfirmOpen(false);
    saveProfile();
  };

  return (
    <div className="space-y-8">
      
      <div className="grid gap-6">
          <div className="space-y-2">
            <Label htmlFor="firstName">Имя</Label>
            <Input 
              id="firstName" 
              defaultValue={user.firstName} 
              {...register("firstName")} 
              className="bg-background" 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Фамилия</Label>
            <Input 
              id="lastName" 
              defaultValue={user.lastName} 
              {...register("lastName")} 
              className="bg-background" 
            />
          </div>
        
          <div className="space-y-2">
             <Label htmlFor="middleName">Отчество</Label>
             <Input 
               id="middleName" 
               defaultValue={user.middleName} 
               {...register("middleName")} 
               className="bg-background" 
             />
          </div>

        {/* Блок Контакты */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              defaultValue={user.email} 
              {...register("email")} 
              className="bg-background" 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Телефон</Label>
            <Input 
              id="phone" 
              type="tel" 
              defaultValue={user.phone} 
              {...register("phone")} 
              className="bg-background" 
            />
          </div>
        </div>
      </div>

      {/* Footer с кнопкой и статусом */}
      <div className="flex items-center justify-between pt-6 border-t border-border">
        
        {/* Зона сообщений (Feedback) */}
        <div className="flex-1 pr-4 flex items-center gap-3">
          
          {/* Индикатор изменений (Желтый текст) */}
          {state.isDirty && !state.message && (
             <span className="text-sm font-medium text-amber-600 dark:text-amber-500 animate-in fade-in slide-in-from-left-2 flex items-center gap-1.5">
               <span className="w-2 h-2 rounded-full bg-amber-500" />
               Данные изменены
             </span>
          )}

          {/* Сообщения сервера (Успех/Ошибка) */}
          {state.message && (
            <div className={cn(
              "flex items-center gap-2 text-sm font-medium animate-in fade-in zoom-in-95",
              state.message.type === 'success' ? 'text-green-600 dark:text-green-400' : 'text-destructive'
            )}>
              {state.message.type === 'success' ? <CheckCircle2 className="w-4 h-4"/> : <AlertCircle className="w-4 h-4"/>}
              {state.message.text}
            </div>
          )}
        </div>

        <Button 
          onClick={handleSaveClick} 
          disabled={state.isSaving || !state.isDirty}
          className="bg-primary hover:bg-primary/90 text-white min-w-[140px] shadow-sm transition-all"
        >
          {state.isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Сохраняем
            </>
          ) : (
            "Сохранить"
          )}
        </Button>
      </div>

      {/* --- МОДАЛЬНОЕ ОКНО ПОДТВЕРЖДЕНИЯ --- */}
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
            <Button 
                onClick={confirmSave}
                className="bg-primary hover:bg-primary/90 text-white rounded-lg"
            >
              Подтвердить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}