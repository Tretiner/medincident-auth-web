'use client';

import { User } from "@/domain/profile/types";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import { useProfileViewModel } from "../details/profileViewModel";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function ProfileForm({ user }: { user: User }) {
  const { form, state, saveProfile } = useProfileViewModel(user);
  const { register } = form;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="grid gap-6">
        {/* Блок Имя Фамилия Отчество */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="lastName">Фамилия</Label>
            <Input id="lastName" {...register("lastName")} placeholder="Иванов" className="bg-background" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="firstName">Имя</Label>
            <Input id="firstName" {...register("firstName")} placeholder="Иван" className="bg-background" />
          </div>
        </div>
        
        <div className="space-y-2">
            <Label htmlFor="middleName">Отчество</Label>
            <Input id="middleName" {...register("middleName")} placeholder="Иванович" className="bg-background" />
        </div>

        {/* Блок Контакты */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} className="bg-background" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Телефон</Label>
            <Input id="phone" type="tel" {...register("phone")} className="bg-background" />
          </div>
        </div>
      </div>

      {/* Footer с кнопкой и статусом */}
      <div className="flex items-center justify-between pt-6 border-t border-border">
        
        {/* Зона сообщений (Feedback) */}
        <div className="flex-1 pr-4">
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
          onClick={saveProfile} 
          disabled={state.isSaving}
          className="bg-brand-green hover:bg-brand-green/90 text-white min-w-[140px] shadow-sm"
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
    </div>
  );
}