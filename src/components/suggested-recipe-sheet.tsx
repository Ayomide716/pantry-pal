
'use client';

import { Heart, Clock, List, BookOpenCheck } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter
} from '@/components/ui/sheet';
import { usePantry } from '@/hooks/use-pantry';
import { cn } from '@/lib/utils';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import type { GeneratedRecipe } from '@/hooks/use-pantry';

interface SuggestedRecipeSheetProps {
  recipe: GeneratedRecipe | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SuggestedRecipeSheet({
  recipe,
  isOpen,
  onOpenChange,
}: SuggestedRecipeSheetProps) {
  const { ingredients: userIngredients, generatedFavorites, toggleGeneratedFavorite } = usePantry();

  if (!recipe) return null;

  const isFavorite = generatedFavorites.some(r => r.id === recipe.id);

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg p-0">
        <ScrollArea className="h-full">
          <SheetHeader className="p-6 pb-0 relative">
            {recipe.image && (
                 <div className="relative h-64 w-full -mx-6 -mt-6">
                    <Image
                        src={recipe.image}
                        alt={recipe.title}
                        data-ai-hint="ai generated food"
                        fill
                        className="object-cover"
                    />
                 </div>
            )}
            <div className="pt-6">
                <SheetTitle className="text-3xl font-headline">{recipe.title}</SheetTitle>
                <SheetDescription className="mt-2">{recipe.description}</SheetDescription>
            </div>
             <div className="flex justify-between items-center pt-4">
                 <Badge variant="secondary" className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{recipe.prepTime}</span>
                </Badge>
            </div>
          </SheetHeader>
          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <List className="h-5 w-5 text-primary" />
                Ingredients
              </h3>
              <ul className="list-none space-y-2 pl-2">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index} className={cn("flex items-center text-sm", userIngredients.includes(ingredient.name.toLowerCase()) && "font-bold text-foreground")}>
                    <span className={cn("mr-2 h-1.5 w-1.5 rounded-full", userIngredients.includes(ingredient.name.toLowerCase()) ? "bg-primary" : "bg-muted-foreground")}></span>
                    {ingredient.quantity} {ingredient.name}
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-2">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                    <BookOpenCheck className="h-5 w-5 text-primary" />
                    Instructions
                </h3>
              <ol className="list-decimal list-outside space-y-3 pl-6">
                {recipe.instructions.map((step, index) => (
                  <li key={index} className="text-sm leading-relaxed">{step}</li>
                ))}
              </ol>
            </div>
          </div>
            <SheetFooter className="p-6 pt-4 bg-background/80 sticky bottom-0">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => recipe && toggleGeneratedFavorite(recipe)}
                  >
                    <Heart className={cn('mr-2 h-4 w-4', isFavorite && 'fill-primary text-primary')} />
                    {isFavorite ? 'Saved to Favorites' : 'Save to Favorites'}
                  </Button>
              </SheetFooter>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
