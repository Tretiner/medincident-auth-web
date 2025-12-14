'use client';

import { User } from "@/domain/entities/user";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/presentation/components/ui/avatar";
import { Separator } from "@/presentation/components/ui/separator";
import { Save, User as UserIcon, Mail } from "lucide-react";

export function ProfileEditForm({ user }: { user: User }) {
  return (
    <div className="w-full">
       <div className="h-32 bg-gradient-to-r from-brand-green/20 to-brand-green/5" />
       <div className="px-8 pb-8 relative">
          <div className="-mt-16 mb-6">
              <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
                  <AvatarImage src={user.avatarUrl} />
                  <AvatarFallback>USER</AvatarFallback>
              </Avatar>
          </div>

          <div className="flex justify-between items-start mb-6">
              <div>
                  <h2 className="text-2xl font-bold text-gray-900">{user.firstName} {user.lastName}</h2>
                  <p className="text-gray-500">{user.position}</p>
              </div>
              <Button className="rounded-xl bg-brand-green hover:bg-brand-green/90 text-white gap-2">
                <Save className="w-4 h-4" /> Сохранить
              </Button>
          </div>
          <Separator className="my-6" />
          <div className="grid gap-6 max-w-xl">
              <div className="space-y-2">
                  <Label>Email</Label>
                  <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input defaultValue={user.email} className="pl-9 rounded-xl bg-gray-50 border-transparent focus-visible:ring-brand-orange" />
                  </div>
              </div>
          </div>
       </div>
    </div>
  );
}