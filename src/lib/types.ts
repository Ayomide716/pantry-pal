export type Ingredient = {
  name: string;
  quantity: string;
};

export type Recipe = {
  id: number;
  title: string;
  description: string;
  ingredients: Ingredient[];
  instructions: string[];
  prepTime: string;
  image: string;
  imageHint: string;
};

// This is now defined in use-pantry.ts to avoid circular dependencies
// export type GeneratedRecipe = import('@/ai/flows/suggest-recipe').SuggestRecipeOutput & { id: number };
