'use client';
import { Button } from "@/presentation/components/ui/button";
import { QrCode, Send } from "lucide-react";

export function LoginView() {
  return (
    <div className="flex w-full flex-col md:flex-row h-full min-h-[600px]">
      <div className="hidden md:flex w-1/2 bg-brand-green/10 items-center justify-center flex-col p-8 relative">
        <div className="bg-white p-6 rounded-3xl shadow-sm text-center space-y-4">
           <div className="border-4 border-brand-green p-2 rounded-2xl inline-block">
             <QrCode className="w-32 h-32 text-brand-green" />
           </div>
           <h3 className="font-bold text-lg text-gray-800">Вход по QR</h3>
        </div>
      </div>

      <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Вход</h1>
        <p className="text-gray-500 mb-8">Добро пожаловать в MedSafety</p>
        
        <div className="space-y-3">
             <Button variant="outline" className="w-full h-12 text-lg border-2 hover:bg-blue-50 hover:text-blue-600 rounded-xl justify-start px-4 relative">
                <Send className="w-5 h-5 mr-3 text-blue-500" /> Telegram
             </Button>
             <Button className="w-full h-12 text-lg bg-brand-green hover:bg-brand-green/90 text-white rounded-xl justify-start px-4 shadow-md shadow-brand-green/20">
                <div className="w-6 h-6 mr-3 bg-white text-brand-green font-bold rounded-full flex items-center justify-center text-xs">M</div>
                Войти через MAX
             </Button>
        </div>
      </div>
    </div>
  );
}