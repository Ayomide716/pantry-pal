'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { recipes as allRecipes } from '@/lib/recipes';
import { usePantry } from '@/hooks/use-pantry';
import RecipeCard from '@/components/recipe-card';
import type { Recipe } from '@/lib/types';
import RecipeDetailsSheet from '@/components/recipe-details-sheet';
import { BookHeart, ArrowLeft, Sparkles, ChefHat, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { GeneratedRecipe } from '@/hooks/use-pantry';
import SuggestedRecipeSheet from '@/components/suggested-recipe-sheet';

export default function FavoritesPage() {
  const { favorites, generatedFavorites, isPantryLoaded, toggleGeneratedFavorite } = usePantry();
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [selectedGeneratedRecipe, setSelectedGeneratedRecipe] = useState<GeneratedRecipe | null>(null);

  const favoriteRecipes = allRecipes.filter(recipe => favorites.includes(recipe.id));

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-12">
            <Button variant="ghost" asChild className="mb-4">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Recipes
              </Link>
            </Button>
          <h1 className="font-headline text-4xl md:text-5xl font-bold text-foreground mb-2 tracking-tight">Your Favorite Recipes</h1>
          <p className="text-lg text-muted-foreground">A collection of your most-loved dishes, ready when you are.</p>
        </div>

        {isPantryLoaded && favoriteRecipes.length > 0 && (
          <div className="mb-12">
            <h2 className="font-headline text-3xl font-bold text-foreground mb-6 flex items-center gap-3">
              <ChefHat className="h-7 w-7 text-primary" />
              PantryPal Classics
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {favoriteRecipes.map(recipe => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  onViewRecipe={() => setSelectedRecipe(recipe)}
                />
              ))}
            </div>
          </div>
        )}

        {isPantryLoaded && generatedFavorites.length > 0 && (
          <div className="mb-12">
             <h2 className="font-headline text-3xl font-bold text-foreground mb-6 flex items-center gap-3">
              <Sparkles className="h-7 w-7 text-primary" />
              Your AI Creations
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {generatedFavorites.map(recipe => (
                <Card key={recipe.id} className="flex flex-col h-full overflow-hidden transition-all hover:shadow-lg">
                  <CardHeader className="p-0 relative">
                    {recipe.image && (
                        <Image
                        src={recipe.image}
                        alt={recipe.title}
                        data-ai-hint="ai generated food"
                        width={600}
                        height={400}
                        className="object-cover w-full h-48 cursor-pointer"
                        onClick={() => setSelectedGeneratedRecipe(recipe)}
                        />
                    )}
                     <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 bg-background/70 hover:bg-background rounded-full"
                      onClick={() => toggleGeneratedFavorite(recipe)}
                      aria-label="Remove from favorites"
                    >
                      <Heart className="h-5 w-5 text-primary fill-primary" />
                    </Button>
                     <Badge className="absolute bottom-2 left-2 bg-primary/90 text-primary-foreground">
                        {recipe.prepTime}
                    </Badge>
                  </CardHeader>
                  <CardContent className="flex-grow p-4">
                    <CardTitle className="font-headline text-xl mb-2 cursor-pointer" onClick={() => setSelectedGeneratedRecipe(recipe)}>
                      {recipe.title}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground line-clamp-2">{recipe.description}</p>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Button onClick={() => setSelectedGeneratedRecipe(recipe)} className="w-full">
                      View Recipe
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        )}

        {isPantryLoaded && favoriteRecipes.length === 0 && generatedFavorites.length === 0 && (
          <div className="text-center py-20 px-4 border-2 border-dashed rounded-lg">
            <BookHeart className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-xl font-semibold">No favorites yet!</h3>
            <p className="text-muted-foreground mt-2">
              Explore recipes and click the heart icon to save them here.
            </p>
          </div>
        )}
      </div>

      <RecipeDetailsSheet
        recipe={selectedRecipe}
        isOpen={!!selectedRecipe}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedRecipe(null);
          }
        }}
      />

      <SuggestedRecipeSheet
        recipe={selectedGeneratedRecipe}
        isOpen={!!selectedGeneratedRecipe}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedGeneratedRecipe(null);
          }
        }}
       />
    </>
  );
}
