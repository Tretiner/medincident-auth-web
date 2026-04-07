import { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageHeader } from "../_components/page-header";
import { ShieldCheck } from "lucide-react";
import { SecurityView } from "./security-view";
import { completeLinkAction } from "./security.actions";

export const metadata: Metadata = {
  title: "Безопасность",
  description: "Управление доступом и сессиями",
};

export default async function SecurityPage({
  searchParams,
}: {
  searchParams: Promise<{ link?: string; id?: string; token?: string }>;
}) {
  const { link, id, token } = await searchParams;

  // OAuth-callback от Zitadel после попытки привязки провайдера
  if (link === "success" && id && token) {
    const result = await completeLinkAction(id, token);
    redirect(result.success ? "/profile/security?link=done" : "/profile/security?link=failed");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Безопасность и вход"
        description="Управление привязанными аккаунтами и активными сессиями"
        icon={ShieldCheck}
      />

      <SecurityView linkStatus={link} />
    </div>
  );
}