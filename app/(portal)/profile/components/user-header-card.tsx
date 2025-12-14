import { User } from "@/domain/profile/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/presentation/components/ui/avatar";

export function UserHeaderCard({ user }: { user: User }) {
  // Получаем инициалы для фоллбека (Алексей Смирнов -> АС)
  const initials = `${user.firstName[0]}${user.lastName[0]}`;

  return (
    <div className="flex items-center gap-6 p-6 bg-gray-50/50 rounded-3xl border border-gray-100 mb-8">
      {/* Слева аватарка */}
      <Avatar className="h-20 w-20 border-4 border-white shadow-sm">
        <AvatarImage src={user.avatarUrl} alt={user.lastName} />
        <AvatarFallback className="bg-brand-green/10 text-brand-green text-xl font-bold">
          {initials}
        </AvatarFallback>
      </Avatar>

      {/* Справа инфо */}
      <div className="flex flex-col">
        <h2 className="text-2xl font-bold text-gray-900 leading-tight">
          {user.firstName} {user.lastName}
        </h2>
        {user.position && (
           <span className="text-sm text-gray-500 font-medium mb-1">{user.position}</span>
        )}
        <div className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-500 w-fit">
          ID: {user.id}
        </div>
      </div>
    </div>
  );
}