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
