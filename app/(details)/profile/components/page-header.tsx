import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { Separator } from "@/presentation/components/ui/separator";

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  className?: string;
}

export function PageHeader({ title, description, icon: Icon, className }: PageHeaderProps) {
  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-start gap-4">
        {/* Если иконка передана, рендерим её в красивом блоке */}
        {Icon && (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon className="h-6 w-6" />
          </div>
        )}
        
        <div className="space-y-1">
          <h3 className="text-xl font-semibold tracking-tight text-foreground">
            {title}
          </h3>
          {description && (
             <p className="text-sm text-muted-foreground leading-relaxed">
               {description}
             </p>
          )}
        </div>
      </div>
      
      <Separator />
    </div>
  );
}