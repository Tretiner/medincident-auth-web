'use client';

import { User } from "@/domain/profile/types";
import { Button } from "@/presentation/components/ui/button";
import { TelegramLogoIcon, MaxLogoIcon } from "@/presentation/components/icons/auth"; // Ваши иконки
import { Loader2, Link2, Unlink } from "lucide-react";

interface Props {
  user: User;
  viewModel: any; // В реальном проекте лучше типизировать ReturnType<typeof useSecurityViewModel>
}

export function LinkedAccountsCard({ user, viewModel }: Props) {
  const { linkedAccounts } = user;
  const { activeAction, toggleTelegram, toggleMax } = viewModel;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">Привязанные аккаунты</h3>
      
      <div className="grid md:grid-cols-2 gap-4">
        {/* TELEGRAM */}
        <div className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#229ED9]/10 flex items-center justify-center">
                    <TelegramLogoIcon className="w-5 h-5 text-[#229ED9]" />
                </div>
                <div className="flex flex-col">
                    <span className="font-semibold text-gray-900">Telegram</span>
                    <span className="text-xs text-gray-500">
                        {linkedAccounts.telegram ? "Подключен" : "Не подключен"}
                    </span>
                </div>
            </div>

            <Button
                size="sm"
                variant={linkedAccounts.telegram ? "outline" : "default"}
                onClick={toggleTelegram}
                disabled={!!activeAction}
                className={!linkedAccounts.telegram ? "bg-[#229ED9] hover:bg-[#229ED9]/90 text-white border-0" : ""}
            >
                {activeAction === "tg_link" ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                    linkedAccounts.telegram ? "Отвязать" : "Привязать"
                )}
            </Button>
        </div>

        {/* MAX */}
        <div className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <MaxLogoIcon className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex flex-col">
                    <span className="font-semibold text-gray-900">MAX ID</span>
                    <span className="text-xs text-gray-500">
                         {linkedAccounts.max ? "Подключен" : "Не подключен"}
                    </span>
                </div>
            </div>

            <Button
                size="sm"
                variant={linkedAccounts.max ? "outline" : "default"}
                onClick={toggleMax}
                disabled={!!activeAction}
                className={!linkedAccounts.max ? "bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90 text-white border-0" : ""}
            >
                 {activeAction === "max_link" ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                    linkedAccounts.max ? "Отвязать" : "Привязать"
                )}
            </Button>
        </div>
      </div>
    </div>
  );
}