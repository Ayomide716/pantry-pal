'use server';

/**
 * @fileOverview Standardizes ingredient names using a Large Language Model (LLM). This flow is used to
 * convert various forms of ingredient names (e.g., "tomato" vs "tomatoes") into a standardized format.
 *
 * - `standardizeIngredient` - Function to standardize an ingredient name.
 * - `IngredientStandardizationInput` - Input type for the standardization process.
 * - `IngredientStandardizationOutput` - Output type containing the standardized ingredient name.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IngredientStandardizationInputSchema = z.object({
  ingredientName: z
    .string()
    .describe('The ingredient name to be standardized.'),
});
export type IngredientStandardizationInput =
  z.infer<typeof IngredientStandardizationInputSchema>;

const IngredientStandardizationOutputSchema = z.object({
  standardizedName: z
    .string()
    .describe('The standardized form of the ingredient name.'),
});
export type IngredientStandardizationOutput =
  z.infer<typeof IngredientStandardizationOutputSchema>;

export async function standardizeIngredient(
  input: IngredientStandardizationInput
): Promise<IngredientStandardizationOutput> {
  return ingredientStandardizationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'ingredientStandardizationPrompt',
  model: 'googleai/gemini-1.5-flash-latest',
  input: {
    schema: IngredientStandardizationInputSchema,
  },
  output: {
    schema: IngredientStandardizationOutputSchema,
  },
  prompt: `You are an expert in food and ingredients. You will standardize the ingredient name provided by the user.

  Ingredient Name: {{{ingredientName}}}

  Return the standardized ingredient name.
  `,
});

const ingredientStandardizationFlow = ai.defineFlow(
  {
    name: 'ingredientStandardizationFlow',
    inputSchema: IngredientStandardizationInputSchema,
    outputSchema: IngredientStandardizationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
