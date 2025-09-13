"use client";

import { useState, useEffect, useCallback } from 'react';

const INGREDIENTS_KEY = 'pantry-pal-ingredients';
const FAVORITES_KEY = 'pantry-pal-favorites';

export const usePantry = () => {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadFromStorage = useCallback(() => {
    try {
      const storedIngredients = localStorage.getItem(INGREDIENTS_KEY);
      const storedFavorites = localStorage.getItem(FAVORITES_KEY);

      setIngredients(storedIngredients ? JSON.parse(storedIngredients) : []);
      setFavorites(storedFavorites ? JSON.parse(storedFavorites) : []);
    } catch (error) {
      console.error("Failed to parse from localStorage", error);
      setIngredients([]);
      setFavorites([]);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    loadFromStorage();
    
    const handleStorageChange = (event: StorageEvent) => {
        if (event.key === INGREDIENTS_KEY || event.key === FAVORITES_KEY) {
            loadFromStorage();
        }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [loadFromStorage]);


  const addIngredient = (ingredient: string) => {
    const lowerCaseIngredient = ingredient.toLowerCase();
    if (ingredients.includes(lowerCaseIngredient)) {
        return;
    }
    const newIngredients = [...ingredients, lowerCaseIngredient];
    localStorage.setItem(INGREDIENTS_KEY, JSON.stringify(newIngredients));
    setIngredients(newIngredients);
  };

  const removeIngredient = (ingredient: string) => {
      const newIngredients = ingredients.filter(i => i !== ingredient);
      localStorage.setItem(INGREDIENTS_KEY, JSON.stringify(newIngredients));
      setIngredients(newIngredients);
  };

  const clearIngredients = () => {
    localStorage.removeItem(INGREDIENTS_KEY);
    setIngredients([]);
  };

  const toggleFavorite = (recipeId: number) => {
      const isFavorite = favorites.includes(recipeId);
      const newFavorites = isFavorite
        ? favorites.filter(id => id !== recipeId)
        : [...favorites, recipeId];
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
      setFavorites(newFavorites);
  };

  return {
    ingredients,
    addIngredient,
    removeIngredient,
    clearIngredients,
    favorites,
    toggleFavorite,
    isPantryLoaded: isLoaded,
  };
};
