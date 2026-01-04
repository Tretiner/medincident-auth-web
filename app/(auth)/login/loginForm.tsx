'use client';

import { Card, CardContent } from "@/presentation/components/ui/card";
import { Button } from "@/presentation/components/ui/button";
import { Loader2 } from "lucide-react";
import { ServiceLogoIcon } from "@/presentation/components/icons/base";
import { MaxLogoIcon, TelegramLogoIcon } from "@/presentation/components/icons/auth";
import { useLoginViewModel } from "./loginViewModel";

interface AuthButtonProps {
  onClick: () => void;
  disabled: boolean;
}

const TelegramButton = ({ onClick, disabled }: AuthButtonProps) => (
  <Button 
    onClick={onClick}
    disabled={disabled}
    className="w-full h-14 text-lg font-bold rounded-2xl flex items-center justify-center gap-3 
               border-0 text-white 
               bg-gradient-to-r from-[#2AABEE] to-[#229ED9] hover:from-[#2AABEE] hover:to-[#229ED9]
               shadow-md hover:shadow-xl
               transition-all duration-300 hover:scale-[1.01] active:scale-[0.99]"
  >
    {disabled 
      ? <Loader2 className="w-6 h-6 animate-spin text-white" /> 
      : <TelegramLogoIcon className="w-6 h-6 text-white" />}
    Telegram
  </Button>
);

const MaxButton = ({ onClick, disabled }: AuthButtonProps) => (
  <Button 
    onClick={onClick}
    disabled={disabled}
    className="w-full h-14 text-lg font-bold rounded-2xl flex items-center justify-center gap-3 
               border-0 text-white 
               bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 
               shadow-md hover:shadow-xl
               transition-all duration-300 hover:scale-[1.01] active:scale-[0.99]"
  >
    {disabled 
      ? <Loader2 className="w-6 h-6 animate-spin text-white" /> 
      : <MaxLogoIcon className="w-7 h-7 text-white" />}
    MAX
  </Button>
);

// --- Main Client Component ---

interface LoginFormProps {
  initialQrUrl: string;
}

export function LoginForm({ initialQrUrl }: LoginFormProps) {
  const { state, dispatch } = useLoginViewModel(initialQrUrl);
  const { qrUrl, isLoading: isLoginProcessing, error } = state;

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-brand-bg p-4">
      
      <Card className="w-full max-w-[960px] overflow-hidden rounded-[2rem] shadow-none 
                       border border-gray-200 hover:shadow-xl transition-all duration-300 ease-in-out
                       grid md:grid-cols-2 bg-white">
        
        {/* LEFT COLUMN: Dynamic QR Code */}
        <div className="bg-brand-bg/30 p-12 flex flex-col items-center justify-center text-center relative overflow-hidden border-b md:border-b-0 md:border-r border-gray-200 h-full min-h-[400px]">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-brand-green/5 to-transparent pointer-events-none" />
            
            <div className="relative z-10 flex flex-col items-center">
                {/* QR Container */}
                <div className="bg-white p-4 rounded-3xl border-2 border-brand-green/10 relative overflow-hidden group w-56 h-56 flex items-center justify-center shadow-sm">
                    {!qrUrl ? (
                        <div className="w-full h-full bg-gray-100 animate-pulse rounded-xl" />
                    ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img 
                          src={qrUrl} 
                          alt="QR Code" 
                          className="w-full h-full object-contain transition-opacity duration-500" 
                        />
                    )}
                    
                    {/* Scan Animation Overlay */}
                    {qrUrl && (
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-green/20 to-transparent -translate-y-full animate-[accordion-down_2s_infinite]" />
                    )}
                </div>
                
                <h2 className="text-2xl font-bold text-brand-dark mt-8 mb-3">Вход по QR-коду</h2>
                <p className="text-gray-500 max-w-xs text-sm leading-relaxed">
                    Наведите камеру телефона на QR-код, чтобы быстро войти в систему.
                </p>
            </div>
        </div>

        {/* RIGHT COLUMN: Login Form */}
        <CardContent className="p-12 flex flex-col justify-center">
          <div className="flex flex-col items-center md:items-start mb-10">
            <div className="w-16 h-16 bg-brand-green/10 rounded-2xl flex items-center justify-center mb-4">
               <ServiceLogoIcon className="w-8 h-8 text-brand-green" />
            </div>
            <h1 className="text-3xl font-bold text-brand-dark text-center md:text-left">
              Вход в «Ilizarov ID»
            </h1>
          </div>

          <div className="space-y-6">
            <p className="text-lg text-gray-600 font-medium">
              Войдите с помощью:
            </p>

            {error && (
                <div className="p-3 rounded-lg bg-red-50 text-red-500 text-sm text-center">
                    {error}
                </div>
            )}

            <div className="grid gap-4">
              <TelegramButton 
                disabled={isLoginProcessing}
                onClick={() => dispatch({ type: 'LOGIN_CLICKED', provider: 'telegram' })} 
              />
              <MaxButton 
                disabled={isLoginProcessing}
                onClick={() => dispatch({ type: 'LOGIN_CLICKED', provider: 'max' })} 
              />
            </div>
          </div>
           
           <p className="mt-10 text-center text-xs text-gray-400 leading-relaxed">
             Нажимая на кнопки входа, вы принимаете{' '} 
             <a href="#" className="text-brand-green hover:underline">пользовательское соглашение</a>
             {' '}и{' '}
             <a href="#" className="text-brand-green hover:underline">политику конфиденциальности</a> 
             {' '}сервиса Ilizarov ID.
           </p>
        </CardContent>
      </Card>
    </div>
  );
}