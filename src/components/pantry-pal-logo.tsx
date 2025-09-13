import { ChefHat } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function PantryPalLogo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <ChefHat className="h-7 w-7 text-primary" />
      <span className="font-headline text-2xl font-bold tracking-tight">
        PantryPal
      </span>
    </div>
  );
}
