'use client';

import { useState } from 'react';
import { Lightbulb, Sparkles, Loader2, List, BookOpenCheck, Clock, Heart } from 'lucide-react';
import { suggestRecipe, type SuggestRecipeOutput } from '@/ai/flows/suggest-recipe';
import { usePantry } from '@/hooks/use-pantry';
import { useToast } from '@/hooks/use-toast';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';
import type { GeneratedRecipe } from '@/hooks/use-pantry';


export default function SuggestedRecipe() {
  const { ingredients, isPantryLoaded, generatedFavorites, toggleGeneratedFavorite } = usePantry();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedRecipe, setSuggestedRecipe] = useState<GeneratedRecipe | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleSuggestRecipe = async () => {
    if (ingredients.length < 1) {
      toast({
        variant: 'destructive',
        title: 'No Ingredients',
        description: 'Please add at least one ingredient to get a recipe suggestion.',
      });
      return;
    }

    setIsLoading(true);
    setSuggestedRecipe(null);
    try {
      const result = await suggestRecipe({ ingredients: ingredients.join(', ') });
      const recipeWithId = { ...result, id: new Date().getTime() };
      setSuggestedRecipe(recipeWithId);
      setIsSheetOpen(true);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Suggestion Failed',
        description: 'We couldn\'t come up with a recipe right now. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const hasEnoughIngredients = ingredients.length > 0;

  const isCurrentRecipeFavorite = suggestedRecipe ? generatedFavorites.some(r => r.id === suggestedRecipe.id) : false;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="text-primary" />
            Need Inspiration?
          </CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Let our AI chef invent a new recipe just for you based on your ingredients.</p>
          <Button
            onClick={handleSuggestRecipe}
            disabled={isLoading || !isPantryLoaded || !hasEnoughIngredients}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Thinking...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                {hasEnoughIngredients ? "Suggest a Recipe" : "Add ingredients first"}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {suggestedRecipe && (
        <Dialog open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <DialogContent className="p-0 max-w-2xl">
            <ScrollArea className="max-h-[90vh]">
              <DialogHeader className="p-6 pb-4">
                 <Badge variant="secondary" className="w-fit self-center flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4" />
                    <span>{suggestedRecipe.prepTime}</span>
                </Badge>
                <DialogTitle className="text-3xl font-headline text-center">{suggestedRecipe.title}</DialogTitle>
                <DialogDescription className="text-center mt-2">{suggestedRecipe.description}</DialogDescription>
              </DialogHeader>
              <div className="p-6 pt-0 space-y-6">
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <List className="h-5 w-5 text-primary" />
                    Ingredients
                  </h3>
                  <ul className="list-none space-y-2 pl-2">
                    {suggestedRecipe.ingredients.map((ingredient, index) => (
                       <li key={index} className={cn("flex items-center text-sm", ingredients.includes(ingredient.name.toLowerCase()) && "font-bold text-foreground")}>
                         <span className={cn("mr-2 h-1.5 w-1.5 rounded-full", ingredients.includes(ingredient.name.toLowerCase()) ? "bg-primary" : "bg-muted-foreground")}></span>
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
                    {suggestedRecipe.instructions.map((step, index) => (
                      <li key={index} className="text-sm leading-relaxed">{step}</li>
                    ))}
                  </ol>
                </div>
              </div>
              <DialogFooter className="p-6 pt-4 bg-background/80 sticky bottom-0">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => suggestedRecipe && toggleGeneratedFavorite(suggestedRecipe)}
                  >
                    <Heart className={cn('mr-2 h-4 w-4', isCurrentRecipeFavorite && 'fill-primary text-primary')} />
                    {isCurrentRecipeFavorite ? 'Saved to Favorites' : 'Save to Favorites'}
                  </Button>
              </DialogFooter>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
