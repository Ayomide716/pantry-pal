'use server';

/**
 * @fileOverview Suggests a new recipe based on available ingredients, including a generated image.
 *
 * - suggestRecipe - A function that suggests the recipe.
 * - SuggestRecipeInput - The input type for the suggestRecipe function.
 * - SuggestRecipeOutput - The return type for the suggestRecipe function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { generateRecipeImage } from './generate-recipe-image';
import { recipes as standardRecipes } from '@/lib/recipes';

const SuggestRecipeInputSchema = z.object({
  ingredients: z
    .string()
    .describe('A comma-separated list of ingredients the user has available.'),
});
export type SuggestRecipeInput = z.infer<typeof SuggestRecipeInputSchema>;

const IngredientSchema = z.object({
    name: z.string().describe("The name of the ingredient."),
    quantity: z.string().describe("The quantity required for the recipe, e.g., '2 cups' or '1 large'.")
});

const SuggestRecipeOutputSchema = z.object({
  title: z.string().describe('The creative title of the recipe.'),
  description: z
    .string()
    .describe('A brief, enticing description of the dish.'),
  prepTime: z.string().describe('The estimated preparation and cook time.'),
  ingredients: z
    .array(IngredientSchema)
    .describe('A list of ingredients required for the recipe.'),
  instructions: z
    .array(z.string())
    .describe('A list of step-by-step instructions for preparing the dish.'),
  image: z.string().describe('A data URI of a generated image for the recipe.').optional(),
});
export type SuggestRecipeOutput = z.infer<typeof SuggestRecipeOutputSchema>;

export async function suggestRecipe(
  input: SuggestRecipeInput
): Promise<SuggestRecipeOutput> {
  return suggestRecipeFlow(input);
}

const knownRecipeTitles = standardRecipes.map(r => r.title).join(', ');

const recipePrompt = ai.definePrompt({
  name: 'suggestRecipePrompt',
  model: 'googleai/gemini-1.5-flash-latest',
  input: {schema: SuggestRecipeInputSchema},
  output: {schema: SuggestRecipeOutputSchema.omit({ image: true })},
  prompt: `You are an expert chef who excels at creating new and exciting recipes from a limited set of ingredients. A user will provide you with ingredients they have, and you must invent a new, delicious recipe.

Your response MUST be a valid JSON object that conforms to the output schema.

- The recipe should primarily use the ingredients provided by the user.
- You can assume the user has common pantry staples like oil, salt, pepper, and basic spices. You can include these in the ingredient list.
- To ensure the suggestion is unique, the recipe should NOT be one of the following standard dishes: ${knownRecipeTitles}.
- Make the recipe sound appealing and the instructions clear and easy to follow.

User's Available Ingredients: {{{ingredients}}}

Generate a new recipe based on these ingredients now.
`,
});

const suggestRecipeFlow = ai.defineFlow(
  {
    name: 'suggestRecipeFlow',
    inputSchema: SuggestRecipeInputSchema,
    outputSchema: SuggestRecipeOutputSchema,
  },
  async input => {
    const {output: recipeDetails} = await recipePrompt(input);
    if (!recipeDetails) {
        throw new Error('Failed to generate recipe details.');
    }

    try {
        const imageResult = await generateRecipeImage({
          recipeTitle: `A photorealistic image of ${recipeDetails.title}, presented beautifully on a plate.`
        });

        return {
            ...recipeDetails,
            image: imageResult.imageUrl,
        };
    } catch (error) {
        console.error("Image generation failed, returning recipe without image.", error);
        return {
            ...recipeDetails,
            image: undefined,
        }
    }
  }
);
