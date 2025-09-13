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

const MealSchema = z.object({
  name: z.string().describe('The name of the meal.'),
  recipe: z.string().describe('A short recipe or preparation steps.'),
});

const DailyPlanSchema = z.object({
  day: z.string().describe('The day of the week (e.g., Monday).'),
  breakfast: MealSchema,
  lunch: MealSchema,
  dinner: MealSchema,
});

const GenerateMealPlanOutputSchema = z.object({
  mealPlan: z
    .array(DailyPlanSchema)
    .describe('A detailed 7-day weekly meal plan.'),
});
export type GenerateMealPlanOutput = z.infer<
  typeof GenerateMealPlanOutputSchema
>;

export async function generateMealPlan(
  input: GenerateMealPlanInput
): Promise<GenerateMealPlanOutput> {
  return generateMealPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMealPlanPrompt',
  model: 'googleai/gemini-1.5-flash',
  input: {schema: GenerateMealPlanInputSchema},
  output: {schema: GenerateMealPlanOutputSchema},
  prompt: `You are a master chef and meal planning assistant. Your task is to generate a complete 7-day meal plan based on the ingredients a user has available and their stated dietary preferences.

Your response MUST be a valid JSON object that conforms to the output schema.

You need to create a plan for Breakfast, Lunch, and Dinner for each day of the week, from Monday to Sunday.

- Use the provided ingredients creatively.
- Supplement with common pantry staples if necessary, but prioritize the user's ingredients.
- Adhere strictly to the dietary preferences.
- For each meal, provide a simple name and a brief recipe or preparation steps.

Available Ingredients: {{{ingredients}}}
Dietary Preferences: {{{dietaryPreferences}}}

Generate the 7-day meal plan now.
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
