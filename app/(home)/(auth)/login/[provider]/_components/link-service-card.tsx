import Link from "next/link";
import { ArrowLeft, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AppLogoIcon } from "@/components/icons";

interface LinkServiceProps {
  title: string;
  description: string;
  serviceIcon: React.ElementType; 
  backLink: string;
  children: React.ReactNode;
}

export function LinkServiceCard({
  title,
  description,
  serviceIcon: ServiceIcon,
  backLink,
  children,
}: LinkServiceProps) {
  return (
    <Card className="w-full max-w-[420px] shadow-none border-border bg-card overflow-hidden relative animate-in fade-in slide-in-from-left-6 duration-300">
      <div className="absolute top-4 left-4 z-10">
        <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground -ml-2 h-8 px-2">
          <Link href={backLink}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            Назад
          </Link>
        </Button>
      </div>

      <CardHeader className="pt-12 pb-2 text-center flex flex-col items-center">
        <div className="flex flex-row items-center justify-center gap-4 mb-4">
          <div className="w-12 h-12 bg-primary/10 rounded-xl border border-primary/20 flex items-center justify-center text-primary shadow-lg shadow-primary/7">
              <AppLogoIcon className="w-6 h-6" />
          </div>
          <Link2 className="w-5 h-5 text-muted-foreground" />
          <div className="w-12 h-12 flex items-center justify-center">
             <ServiceIcon className="w-8 h-8" /> 
          </div>
        </div>
        
        <h2 className="text-2xl font-bold tracking-tight text-foreground">{title}</h2>
        <p className="text-muted-foreground text-sm max-w-[280px]">
          {description}
        </p>
      </CardHeader>

      <CardContent className="p-6 pb-10 flex flex-col items-center justify-center min-h-[140px] relative">
        {children}
      </CardContent>
    </Card>
  );
}