
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { SuggestRecipeOutput } from '@/ai/flows/suggest-recipe';

const INGREDIENTS_KEY = 'pantry-pal-ingredients';
const FAVORITES_KEY = 'pantry-pal-favorites';
const GENERATED_FAVORITES_KEY = 'pantry-pal-generated-favorites';

export type GeneratedRecipe = SuggestRecipeOutput & { id: number };

type PantryState = {
  ingredients: string[];
  favorites: number[];
  generatedFavorites: GeneratedRecipe[];
};

export const usePantry = () => {
  const [pantryState, setPantryState] = useState<PantryState>({
    ingredients: [],
    favorites: [],
    generatedFavorites: [],
  });
  const [isPantryLoaded, setIsPantryLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedIngredients = localStorage.getItem(INGREDIENTS_KEY);
      const storedFavorites = localStorage.getItem(FAVORITES_KEY);
      const storedGeneratedFavorites = localStorage.getItem(GENERATED_FAVORITES_KEY);

      setPantryState({
        ingredients: storedIngredients ? JSON.parse(storedIngredients) : [],
        favorites: storedFavorites ? JSON.parse(storedFavorites) : [],
        generatedFavorites: storedGeneratedFavorites ? JSON.parse(storedGeneratedFavorites) : [],
      });
    } catch (error) {
      console.error("Failed to load pantry from localStorage", error);
    } finally {
      setIsPantryLoaded(true);
    }
  }, []);

  const updateStateAndStorage = useCallback((updater: (prevState: PantryState) => PantryState) => {
    setPantryState(prevState => {
      const newState = updater(prevState);
      try {
        localStorage.setItem(INGREDIENTS_KEY, JSON.stringify(newState.ingredients));
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(newState.favorites));
        localStorage.setItem(GENERATED_FAVORITES_KEY, JSON.stringify(newState.generatedFavorites));
      } catch (error) {
        console.error("Failed to save pantry to localStorage", error);
      }
      return newState;
    });
  }, []);

  const addIngredient = useCallback((ingredient: string) => {
    const lowerCaseIngredient = ingredient.toLowerCase();
    updateStateAndStorage(prevState => {
      if (prevState.ingredients.includes(lowerCaseIngredient)) {
        return prevState;
      }
      return { ...prevState, ingredients: [...prevState.ingredients, lowerCaseIngredient] };
    });
  }, [updateStateAndStorage]);

  const removeIngredient = useCallback((ingredient: string) => {
    updateStateAndStorage(prevState => ({
        ...prevState,
        ingredients: prevState.ingredients.filter(i => i !== ingredient),
    }));
  }, [updateStateAndStorage]);

  const clearIngredients = useCallback(() => {
    updateStateAndStorage(prevState => ({
        ...prevState,
        ingredients: [],
    }));
  }, [updateStateAndStorage]);

  const toggleFavorite = useCallback((recipeId: number) => {
    updateStateAndStorage(prevState => {
      const isFavorite = prevState.favorites.includes(recipeId);
      const newFavorites = isFavorite
        ? prevState.favorites.filter(id => id !== recipeId)
        : [...prevState.favorites, recipeId];
      return { ...prevState, favorites: newFavorites };
    });
  }, [updateStateAndStorage]);

  const toggleGeneratedFavorite = useCallback((recipe: GeneratedRecipe) => {
     updateStateAndStorage(prevState => {
        const isFavorite = prevState.generatedFavorites.some(r => r.id === recipe.id);
        const newFavorites = isFavorite
          ? prevState.generatedFavorites.filter(r => r.id !== recipe.id)
          : [...prevState.generatedFavorites, recipe];
        return { ...prevState, generatedFavorites: newFavorites };
     });
  }, [updateStateAndStorage]);

  return {
    ...pantryState,
    addIngredient,
    removeIngredient,
    clearIngredients,
    toggleFavorite,
    toggleGeneratedFavorite,
    isPantryLoaded,
  };
};
