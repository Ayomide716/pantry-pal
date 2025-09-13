'use client';

import Image from 'next/image';
import { Heart, CheckCircle2 } from 'lucide-react';
import { Recipe } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePantry } from '@/hooks/use-pantry';
import { cn } from '@/lib/utils';
import { Badge } from './ui/badge';

interface RecipeCardProps {
  recipe: Recipe & { matchCount?: number, userIngredients?: string[] };
  onViewRecipe: () => void;
  userIngredients?: string[];
}

export default function RecipeCard({ recipe, onViewRecipe, userIngredients = [] }: RecipeCardProps) {
  const { favorites, toggleFavorite } = usePantry();
  const isFavorite = favorites.includes(recipe.id);

  return (
    <Card className="flex flex-col h-full overflow-hidden transition-all hover:shadow-lg">
      <CardHeader className="p-0 relative">
        <Image
          src={recipe.image}
          alt={recipe.title}
          data-ai-hint={recipe.imageHint}
          width={600}
          height={400}
          className="object-cover w-full h-48 cursor-pointer"
          onClick={onViewRecipe}
        />
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 bg-background/70 hover:bg-background rounded-full"
          onClick={() => toggleFavorite(recipe.id)}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart className={cn('h-5 w-5 text-primary', isFavorite && 'fill-primary')} />
        </Button>
        {recipe.matchCount !== undefined && (
          <Badge className="absolute bottom-2 left-2 bg-primary/90 text-primary-foreground">
            {recipe.matchCount} ingredient{recipe.matchCount !== 1 ? 's' : ''} match
          </Badge>
        )}
      </CardHeader>
      <CardContent className="flex-grow p-4">
        <CardTitle className="font-headline text-xl mb-2 cursor-pointer" onClick={onViewRecipe}>
          {recipe.title}
        </CardTitle>
        <p className="text-sm text-muted-foreground line-clamp-2">{recipe.description}</p>
        
        {userIngredients.length > 0 && (
          <div className="mt-3">
              <h4 className="text-sm font-semibold mb-1">You have:</h4>
              <div className="flex flex-wrap gap-1">
                {userIngredients.map(ing => (
                    <Badge key={ing} variant="outline" className="text-xs py-0.5 px-1.5 border-green-500/50 text-green-700 bg-green-500/10">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        {ing}
                    </Badge>
                ))}
              </div>
          </div>
        )}

      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button onClick={onViewRecipe} className="w-full">
          View Recipe
        </Button>
      </CardFooter>
    </Card>
  );
}
