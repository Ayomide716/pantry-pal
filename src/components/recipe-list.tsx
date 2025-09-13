'use client';

import { useState, useMemo } from 'react';
import { recipes as allRecipes } from '@/lib/recipes';
import { usePantry } from '@/hooks/use-pantry';
import RecipeCard from './recipe-card';
import type { Recipe } from '@/lib/types';
import RecipeDetailsSheet from './recipe-details-sheet';
import { Skeleton } from './ui/skeleton';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';

function RecipeListSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
            <CardHeader className="p-0">
                <Skeleton className="h-48 w-full" />
            </CardHeader>
            <CardContent className="p-4 space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-10 w-full mt-4" />
            </CardContent>
        </Card>
      ))}
    </div>
  );
}


export default function RecipeList() {
  const { ingredients, isPantryLoaded } = usePantry();
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const suggestedRecipes = useMemo(() => {
    if (ingredients.length === 0) {
      return [];
    }
    
    return allRecipes
      .map(recipe => {
        const matchingIngredients = recipe.ingredients.filter(ing =>
          ingredients.includes(ing.name.toLowerCase())
        );
        return {
          ...recipe,
          matchCount: matchingIngredients.length,
          userIngredients: matchingIngredients.map(i => i.name)
        };
      })
      .filter(recipe => recipe.matchCount > 0)
      .sort((a, b) => b.matchCount - a.matchCount);
  }, [ingredients]);


  if (!isPantryLoaded) {
    return <RecipeListSkeleton />;
  }

  return (
    <>
        <Card>
            <CardHeader>
                <CardTitle>Available Recipes</CardTitle>
            </CardHeader>
            <CardContent>
                {ingredients.length > 0 ? (
                    suggestedRecipes.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {suggestedRecipes.map(recipe => (
                        <RecipeCard 
                            key={recipe.id}
                            recipe={recipe} 
                            onViewRecipe={() => setSelectedRecipe(recipe)}
                            userIngredients={recipe.userIngredients}
                        />
                        ))}
                    </div>
                    ) : (
                    <div className="text-center py-10 px-4 border-2 border-dashed rounded-lg">
                        <h3 className="text-xl font-semibold">No recipes found</h3>
                        <p className="text-muted-foreground mt-2">Try adding more or different ingredients to discover new recipes.</p>
                    </div>
                    )
                ) : (
                    <div className="text-center py-10 px-4 border-2 border-dashed rounded-lg">
                    <h3 className="text-xl font-semibold">Ready to cook?</h3>
                    <p className="text-muted-foreground mt-2">Add some ingredients you have, and we'll show you what you can make!</p>
                    </div>
                )}
            </CardContent>
        </Card>


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
