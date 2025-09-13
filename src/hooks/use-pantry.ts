"use client";

import { useState, useEffect, useCallback } from 'react';

const INGREDIENTS_KEY = 'pantry-pal-ingredients';
const FAVORITES_KEY = 'pantry-pal-favorites';

// Custom event to sync tabs across different browser tabs/windows
const storageEvent = 'pantry-storage';

export const usePantry = () => {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadFromStorage = useCallback(() => {
    try {
      const storedIngredients = localStorage.getItem(INGREDIENTS_KEY);
      const storedFavorites = localStorage.getItem(FAVORITES_KEY);

      if (storedIngredients) {
        setIngredients(JSON.parse(storedIngredients));
      }
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
    } catch (error) {
      console.error("Failed to parse from localStorage", error);
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
    
    const handleCustomStorageChange = () => {
        loadFromStorage();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener(storageEvent, handleCustomStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener(storageEvent, handleCustomStorageChange);
    };
  }, [loadFromStorage]);


  const addIngredient = (ingredient: string) => {
    setIngredients(prev => {
      const lowerCaseIngredient = ingredient.toLowerCase();
      if (prev.includes(lowerCaseIngredient)) {
        return prev;
      }
      const newIngredients = [...prev, lowerCaseIngredient];
      localStorage.setItem(INGREDIENTS_KEY, JSON.stringify(newIngredients));
      window.dispatchEvent(new Event(storageEvent));
      return newIngredients;
    });
  };

  const removeIngredient = (ingredient: string) => {
    setIngredients(prev => {
      const newIngredients = prev.filter(i => i !== ingredient);
      localStorage.setItem(INGREDIENTS_KEY, JSON.stringify(newIngredients));
      window.dispatchEvent(new Event(storageEvent));
      return newIngredients;
    });
  };

  const clearIngredients = () => {
    setIngredients([]);
    localStorage.removeItem(INGREDIENTS_KEY);
    window.dispatchEvent(new Event(storageEvent));
  };

  const toggleFavorite = (recipeId: number) => {
    setFavorites(prev => {
      const isFavorite = prev.includes(recipeId);
      const newFavorites = isFavorite
        ? prev.filter(id => id !== recipeId)
        : [...prev, recipeId];
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
      window.dispatchEvent(new Event(storageEvent));
      return newFavorites;
    });
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
