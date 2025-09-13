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

  const updateState = (newState: Partial<PantryState>) => {
    setPantryState(prevState => {
      const updatedState = { ...prevState, ...newState };
      try {
        if (newState.ingredients) {
          localStorage.setItem(INGREDIENTS_KEY, JSON.stringify(updatedState.ingredients));
        }
        if (newState.favorites) {
          localStorage.setItem(FAVORITES_KEY, JSON.stringify(updatedState.favorites));
        }
        if (newState.generatedFavorites) {
          localStorage.setItem(GENERATED_FAVORITES_KEY, JSON.stringify(updatedState.generatedFavorites));
        }
      } catch (error) {
        console.error("Failed to save pantry to localStorage", error);
      }
      return updatedState;
    });
  };

  const addIngredient = useCallback((ingredient: string) => {
    const lowerCaseIngredient = ingredient.toLowerCase();
    setPantryState(prevState => {
      if (prevState.ingredients.includes(lowerCaseIngredient)) {
        return prevState;
      }
      const newIngredients = [...prevState.ingredients, lowerCaseIngredient];
      updateState({ ingredients: newIngredients });
      return { ...prevState, ingredients: newIngredients };
    });
  }, []);

  const removeIngredient = useCallback((ingredient: string) => {
    const newIngredients = pantryState.ingredients.filter(i => i !== ingredient);
    updateState({ ingredients: newIngredients });
  }, [pantryState.ingredients]);

  const clearIngredients = useCallback(() => {
    updateState({ ingredients: [] });
  }, []);

  const toggleFavorite = useCallback((recipeId: number) => {
    const isFavorite = pantryState.favorites.includes(recipeId);
    const newFavorites = isFavorite
      ? pantryState.favorites.filter(id => id !== recipeId)
      : [...pantryState.favorites, recipeId];
    updateState({ favorites: newFavorites });
  }, [pantryState.favorites]);

  const toggleGeneratedFavorite = useCallback((recipe: GeneratedRecipe) => {
    const isFavorite = pantryState.generatedFavorites.some(r => r.id === recipe.id);
    const newFavorites = isFavorite
      ? pantryState.generatedFavorites.filter(r => r.id !== recipe.id)
      : [...pantryState.generatedFavorites, recipe];
    updateState({ generatedFavorites: newFavorites });
  }, [pantryState.generatedFavorites]);

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
