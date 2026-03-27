// app/login/register/page.tsx
import { retrieveIdpIntent } from "@/lib/zitadel/api";
import { RegisterView } from "./_components/register-view";
import { AppLogoIcon } from "@/components/icons";
import { registerUserSubmit } from "./register-actions";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; token?: string; requestId?: string }>;
}) {
  const { id, token, requestId } = await searchParams;

  if (!id || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <h1 className="text-xl text-destructive font-bold">Ошибка: Неполные данные (нет id или token)</h1>
      </div>
    );
  }

  // Получаем данные провайдера по интенту (Telegram, MAX и т.д.)
  console.log("RETRIEVE IDP INTENT")
  const response = await retrieveIdpIntent(id, token);

  if (!response.success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="p-6 bg-destructive/10 text-destructive rounded-xl border border-destructive/20 text-center">
          <h2 className="font-bold mb-2">Ошибка при извлечении данных провайдера</h2>
          <p className="text-sm">{response.error?.message || "Неизвестная ошибка"}</p>
        </div>
      </div>
    );
  }

  // 1. Собираем предзаполненные данные для формы
  const rawInfo = response.data?.idpInformation?.rawInformation || {};
  const nameString = rawInfo?.name?.trim() || response.data?.idpInformation?.userName?.trim() || "";
  const [defaultGivenName, ...familyNames] = nameString.split(/\s+/);
  
  const initialData = {
    givenName: defaultGivenName,
    familyName: familyNames.join(" ") || "",
    middleName: "",
    email: rawInfo?.email || "",
  };

  // 2. БИНДИМ чувствительные данные к экшену (Next.js зашифрует их)
  const securePayload = {
    intentId: id,
    intentToken: token,
    requestId,
    idpInformation: response.data?.idpInformation,
  };
  const boundRegisterAction = registerUserSubmit.bind(null, securePayload);

  return (
    // Поднимаем контент выше: justify-start + pt-16 (padding-top)
    <div className="min-h-screen flex flex-col items-center justify-start pt-16 md:pt-24 p-4 bg-background font-sans">
      <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
        
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 text-primary border border-primary/20">
            <AppLogoIcon className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Регистрация</h1>
          <p className="text-muted-foreground mt-2 text-md">
            Проверьте и заполните ваши данные
          </p>
        </div>

        {/* Передаем привязанный экшен и изначальные данные */}
        <RegisterView action={boundRegisterAction} initialData={initialData} />
        
      </div>
    </div>
  );
}