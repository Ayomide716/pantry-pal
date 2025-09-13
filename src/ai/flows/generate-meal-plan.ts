// This file is machine-generated - edit at your own risk.

'use server';

/**
 * @fileOverview Generates a weekly meal plan based on available ingredients and dietary preferences.
 *
 * - generateMealPlan - A function that generates the meal plan.
 * - GenerateMealPlanInput - The input type for the generateMealPlan function.
 * - GenerateMealPlanOutput - The return type for the generateMealPlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateMealPlanInputSchema = z.object({
  ingredients: z
    .string()
    .describe('A comma-separated list of ingredients the user has available.'),
  dietaryPreferences: z
    .string()
    .describe(
      'The dietary preferences of the user, such as vegetarian, vegan, gluten-free, etc.'
    ),
});
export type GenerateMealPlanInput = z.infer<typeof GenerateMealPlanInputSchema>;

const GenerateMealPlanOutputSchema = z.object({
  mealPlan: z
    .string()
    .describe(
      'A detailed weekly meal plan, including recipes for breakfast, lunch, and dinner, considering the available ingredients and dietary preferences.'
    ),
});
export type GenerateMealPlanOutput = z.infer<typeof GenerateMealPlanOutputSchema>;

export async function generateMealPlan(
  input: GenerateMealPlanInput
): Promise<GenerateMealPlanOutput> {
  return generateMealPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMealPlanPrompt',
  input: {schema: GenerateMealPlanInputSchema},
  output: {schema: GenerateMealPlanOutputSchema},
  prompt: `You are a meal planning assistant. Generate a weekly meal plan based on the ingredients available and dietary preferences provided by the user. 

Ingredients: {{{ingredients}}}
Dietary Preferences: {{{dietaryPreferences}}}

Provide a detailed meal plan including recipes for breakfast, lunch, and dinner for each day of the week. Consider the available ingredients and dietary preferences when creating the meal plan.
`,
});

const generateMealPlanFlow = ai.defineFlow(
  {
    name: 'generateMealPlanFlow',
    inputSchema: GenerateMealPlanInputSchema,
    outputSchema: GenerateMealPlanOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
