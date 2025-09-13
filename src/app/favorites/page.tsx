'use client';

import { useState } from 'react';
import { recipes as allRecipes } from '@/lib/recipes';
import { usePantry } from '@/hooks/use-pantry';
import RecipeCard from '@/components/recipe-card';
import type { Recipe } from '@/lib/types';
import RecipeDetailsSheet from '@/components/recipe-details-sheet';
import { BookHeart } from 'lucide-react';

export default function FavoritesPage() {
  const { favorites, isPantryLoaded } = usePantry();
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const favoriteRecipes = allRecipes.filter(recipe => favorites.includes(recipe.id));

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-12">
          <h1 className="font-headline text-4xl md:text-5xl font-bold text-foreground mb-2 tracking-tight">Your Favorite Recipes</h1>
          <p className="text-lg text-muted-foreground">A collection of your most-loved dishes, ready when you are.</p>
        </div>

        {isPantryLoaded && favoriteRecipes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favoriteRecipes.map(recipe => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onViewRecipe={() => setSelectedRecipe(recipe)}
              />
            ))}
          </div>
        ) : (
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
    </>
  );
}
