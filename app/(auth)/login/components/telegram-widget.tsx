'use client';

import { useEffect, useRef } from 'react';

interface Props {
  botName: string;
  authUrl: string;
}

export function TelegramWidget({ botName, authUrl }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    if (ref.current.querySelector('script')) return;

    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    
    // Настройки виджета
    script.setAttribute('data-telegram-login', botName);
    script.setAttribute('data-size', 'large');
    // script.setAttribute('data-radius', '16');
    // script.setAttribute('data-userpic', 'false');
    script.setAttribute('data-auth-url', authUrl);
    script.setAttribute('data-request-access', 'write');

    script.async = true;
    ref.current.appendChild(script);
  }, [botName, authUrl]);

  return <div ref={ref} className="flex justify-center py-4" />;
}



// МОК
import { Button } from "@/presentation/components/ui/button";
import { User } from "lucide-react";

export function MockTelegramWidget({ botName, authUrl }: Props) {
  
  const handleMockLogin = () => {
    const mockParams = new URLSearchParams({
      id: "123456789",
      first_name: "Ivan",
      last_name: "Mockov",
      username: "ivan_mock",
      photo_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ivan",
      auth_date: Math.floor(Date.now() / 1000).toString(),
      hash: "mock_dev_hash"
    });

    window.location.href = `${authUrl}?${mockParams.toString()}`;
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-yellow-400 bg-yellow-50/50 rounded-xl w-full max-w-[300px]">
      <div className="text-xs font-mono text-yellow-600 mb-3 uppercase tracking-wider font-bold">
        Dev Mode: Mock Widget
      </div>
      
      <Button 
        onClick={handleMockLogin}
        className="bg-[#54a9eb] hover:bg-[#4092d1] text-white w-full rounded-full"
      >
        <User className="w-4 h-4 mr-2" />
        Log in as Ivan (Mock)
      </Button>
      
      <p className="text-[10px] text-muted-foreground mt-3 text-center">
        Нажатие отправит фейковые данные на сервер без проверки подписи.
      </p>
    </div>
  );
}