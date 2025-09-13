"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { PlusCircle, Trash2, X, Sparkles } from 'lucide-react';
import { standardizeIngredient } from '@/ai/flows/ingredient-standardization';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { usePantry } from '@/hooks/use-pantry';
import { Badge } from '@/components/ui/badge';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from './ui/form';

const formSchema = z.object({
  ingredient: z.string().min(2, 'Ingredient must be at least 2 characters.'),
});

export default function IngredientInput() {
  const { toast } = useToast();
  const { ingredients, addIngredient, removeIngredient, clearIngredients, isPantryLoaded } = usePantry();
  const [isStandardizing, setIsStandardizing] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ingredient: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsStandardizing(true);
    try {
      const result = await standardizeIngredient({ ingredientName: values.ingredient });
      if (result.standardizedName) {
        addIngredient(result.standardizedName);
        form.reset();
      } else {
        throw new Error('Could not standardize ingredient.');
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to add ingredient. Please try again.',
      });
      // Fallback to adding the raw ingredient if AI fails
      addIngredient(values.ingredient.toLowerCase());
      form.reset();

    } finally {
      setIsStandardizing(false);
    }
  }

  return (
    <div className="space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-start gap-2">
          <FormField
            control={form.control}
            name="ingredient"
            render={({ field }) => (
              <FormItem className="flex-grow">
                <FormControl>
                  <Input placeholder="e.g., tomatoes, cheese..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" size="icon" aria-label="Add ingredient" disabled={isStandardizing}>
            {isStandardizing ? <Sparkles className="animate-pulse" /> : <PlusCircle />}
          </Button>
        </form>
      </Form>

      {isPantryLoaded && ingredients.length > 0 && (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {ingredients.map(ingredient => (
              <Badge
                key={ingredient}
                variant="secondary"
                className="py-1 pl-3 pr-1 text-sm bg-secondary hover:bg-muted"
              >
                {ingredient}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 ml-1"
                  onClick={() => removeIngredient(ingredient)}
                  aria-label={`Remove ${ingredient}`}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={clearIngredients}
            className="w-full"
          >
            <Trash2 className="mr-2 h-4 w-4" /> Clear All
          </Button>
        </div>
      )}
       {isPantryLoaded && ingredients.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">Your pantry is empty. Add some ingredients to get started!</p>
        )}
    </div>
  );
}
