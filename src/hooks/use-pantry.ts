"use client";

import { useState, useEffect, useCallback } from 'react';

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
        const newState: PantryState = {
            ingredients: storedIngredients ? JSON.parse(storedIngredients) : [],
            favorites: storedFavorites ? JSON.parse(storedFavorites) : [],
        };
        // Only update and emit if the state has actually changed
        if (JSON.stringify(newState) !== JSON.stringify(pantryState)) {
          pantryState = newState;
          emitChange();
        }
    } catch (e) {
        console.error("Failed to load pantry from localStorage", e);
        pantryState = { ingredients: [], favorites: [] };
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
        if (event.key === INGREDIENTS_KEY || event.key === FAVORITES_KEY) {
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
    isPantryLoaded,
  };
};
