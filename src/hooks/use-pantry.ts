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

let pantryState: PantryState = {
  ingredients: [],
  favorites: [],
  generatedFavorites: [],
};

const listeners = new Set<() => void>();

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

const loadInitialState = () => {
    if (typeof window === 'undefined') {
        return;
    }
    try {
        const storedIngredients = localStorage.getItem(INGREDIENTS_KEY);
        const storedFavorites = localStorage.getItem(FAVORITES_KEY);
        const storedGeneratedFavorites = localStorage.getItem(GENERATED_FAVORITES_KEY);

        const newState: PantryState = {
            ingredients: storedIngredients ? JSON.parse(storedIngredients) : [],
            favorites: storedFavorites ? JSON.parse(storedFavorites) : [],
            generatedFavorites: storedGeneratedFavorites ? JSON.parse(storedGeneratedFavorites) : [],
        };
        // Only update and emit if the state has actually changed
        if (JSON.stringify(newState) !== JSON.stringify(pantryState)) {
          pantryState = newState;
          emitChange();
        }
    } catch (e) {
        console.error("Failed to load pantry from localStorage", e);
        pantryState = { ingredients: [], favorites: [], generatedFavorites: [] };
        emitChange();
    }
};


function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// --- Store Actions ---

function addIngredient(ingredient: string) {
  const lowerCaseIngredient = ingredient.toLowerCase();
  if (pantryState.ingredients.includes(lowerCaseIngredient)) {
    return;
  }
  pantryState = {
    ...pantryState,
    ingredients: [...pantryState.ingredients, lowerCaseIngredient],
  };
  localStorage.setItem(INGREDIENTS_KEY, JSON.stringify(pantryState.ingredients));
  emitChange();
}

function removeIngredient(ingredient: string) {
  pantryState = {
    ...pantryState,
    ingredients: pantryState.ingredients.filter(i => i !== ingredient),
  };
  localStorage.setItem(INGREDIENTS_KEY, JSON.stringify(pantryState.ingredients));
  emitChange();
}

function clearIngredients() {
  pantryState = { ...pantryState, ingredients: [] };
  localStorage.removeItem(INGREDIENTS_KEY);
  emitChange();
}

function toggleFavorite(recipeId: number) {
  const isFavorite = pantryState.favorites.includes(recipeId);
  const newFavorites = isFavorite
    ? pantryState.favorites.filter(id => id !== recipeId)
    : [...pantryState.favorites, recipeId];

  pantryState = { ...pantryState, favorites: newFavorites };
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(pantryState.favorites));
  emitChange();
}

function toggleGeneratedFavorite(recipe: GeneratedRecipe) {
    const isFavorite = pantryState.generatedFavorites.some(r => r.id === recipe.id);
    const newFavorites = isFavorite
        ? pantryState.generatedFavorites.filter(r => r.id !== recipe.id)
        : [...pantryState.generatedFavorites, recipe];

    pantryState = { ...pantryState, generatedFavorites: newFavorites };
    localStorage.setItem(GENERATED_FAVORITES_KEY, JSON.stringify(pantryState.generatedFavorites));
    emitChange();
}


// --- Hook ---

export const usePantry = () => {
  const [state, setState] = useState(pantryState);
  const [isPantryLoaded, setIsPantryLoaded] = useState(false);

  useEffect(() => {
    // This effect runs once on the client after hydration
    loadInitialState();
    setState(pantryState);
    setIsPantryLoaded(true);

    const handleStorageChange = (event: StorageEvent) => {
        if (event.key === INGREDIENTS_KEY || event.key === FAVORITES_KEY || event.key === GENERATED_FAVORITES_KEY) {
            loadInitialState();
        }
    };
    
    // Subscribe to our internal state changes
    const unsubscribe = subscribe(() => {
      setState(pantryState);
    });

    // Subscribe to cross-tab storage changes
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      unsubscribe();
      window.removeEventListener('storage', handleStorageChange);
    }
  }, []);

  return {
    ingredients: state.ingredients,
    addIngredient,
    removeIngredient,
    clearIngredients,
    favorites: state.favorites,
    toggleFavorite,
    generatedFavorites: state.generatedFavorites,
    toggleGeneratedFavorite,
    isPantryLoaded,
  };
};
