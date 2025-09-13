import { config } from 'dotenv';
config();

import '@/ai/flows/ingredient-standardization.ts';
import '@/ai/flows/generate-meal-plan.ts';
import '@/ai/flows/suggest-recipe.ts';
import '@/ai/flows/generate-recipe-image.ts';
