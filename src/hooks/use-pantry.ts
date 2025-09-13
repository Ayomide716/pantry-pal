"use client";

import { useState, useEffect, useCallback } from 'react';

const INGREDIENTS_KEY = 'pantry-pal-ingredients';
const FAVORITES_KEY = 'pantry-pal-favorites';

// Custom event to sync tabs
const dispatchStorageEvent = () => {
  window.dispatchEvent(new Event('storage'));
};

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
    window.addEventListener('storage', loadFromStorage);
    return () => {
      window.removeEventListener('storage', loadFromStorage);
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
      dispatchStorageEvent();
      return newIngredients;
    });
  };

  const removeIngredient = (ingredient: string) => {
    setIngredients(prev => {
      const newIngredients = prev.filter(i => i !== ingredient);
      localStorage.setItem(INGREDIENTS_KEY, JSON.stringify(newIngredients));
      dispatchStorageEvent();
      return newIngredients;
    });
  };

  const clearIngredients = () => {
    setIngredients([]);
    localStorage.removeItem(INGREDIENTS_KEY);
    dispatchStorageEvent();
  };

  const toggleFavorite = (recipeId: number) => {
    setFavorites(prev => {
      const isFavorite = prev.includes(recipeId);
      const newFavorites = isFavorite
        ? prev.filter(id => id !== recipeId)
        : [...prev, recipeId];
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
      dispatchStorageEvent();
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
