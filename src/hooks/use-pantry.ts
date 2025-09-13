"use client";

import { useSyncExternalStore, useCallback, useEffect } from 'react';

const INGREDIENTS_KEY = 'pantry-pal-ingredients';
const FAVORITES_KEY = 'pantry-pal-favorites';

type PantryState = {
  ingredients: string[];
  favorites: number[];
};

let pantryState: PantryState = {
  ingredients: [],
  favorites: [],
};

// Only run on the client
if (typeof window !== 'undefined') {
    try {
        const storedIngredients = localStorage.getItem(INGREDIENTS_KEY);
        const storedFavorites = localStorage.getItem(FAVORITES_KEY);
        pantryState = {
            ingredients: storedIngredients ? JSON.parse(storedIngredients) : [],
            favorites: storedFavorites ? JSON.parse(storedFavorites) : [],
        };
    } catch (e) {
        console.error("Failed to load pantry from localStorage", e);
        pantryState = { ingredients: [], favorites: [] };
    }
}


const listeners = new Set<() => void>();

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const getSnapshot = () => pantryState;

const serverSnapshot: PantryState = {
  ingredients: [],
  favorites: [],
};

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

// --- Hook ---

export const usePantry = () => {
    const state = useSyncExternalStore(subscribe, getSnapshot, () => serverSnapshot);
    
    // This is a bit of a hack to deal with initial client-side loading
    // from localStorage. When the app first loads, serverSnapshot is used.
    // After hydration, this makes sure the client has the real data.
    const isPantryLoaded = typeof window !== 'undefined';

    const handleStorageChange = useCallback((event: StorageEvent) => {
        if (event.key === INGREDIENTS_KEY || event.key === FAVORITES_KEY) {
            try {
                const storedIngredients = localStorage.getItem(INGREDIENTS_KEY);
                const storedFavorites = localStorage.getItem(FAVORITES_KEY);
                pantryState = {
                    ingredients: storedIngredients ? JSON.parse(storedIngredients) : [],
                    favorites: storedFavorites ? JSON.parse(storedFavorites) : [],
                };
                emitChange();
            } catch (e) {
                console.error("Failed to update pantry from localStorage", e);
            }
        }
    }, []);

    useEffect(() => {
        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        }
    }, [handleStorageChange]);


  return {
    ingredients: state.ingredients,
    addIngredient,
    removeIngredient,
    clearIngredients,
    favorites: state.favorites,
    toggleFavorite,
    isPantryLoaded: isPantryLoaded,
  };
};
