'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { generateMealPlan } from '@/ai/flows/generate-meal-plan';
import { usePantry } from '@/hooks/use-pantry';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const formSchema = z.object({
  preferences: z.string().optional(),
});

function MealPlanSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
  );
}

export default function MealPlanPage() {
  const { ingredients, isPantryLoaded } = usePantry();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [mealPlan, setMealPlan] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      preferences: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (ingredients.length === 0) {
        toast({
            variant: 'destructive',
            title: 'No Ingredients',
            description: 'Please add some ingredients before generating a meal plan.',
        });
        return;
    }

    setIsLoading(true);
    setMealPlan(null);
    try {
      const result = await generateMealPlan({
        ingredients: ingredients.join(', '),
        dietaryPreferences: values.preferences || 'None',
      });
      setMealPlan(result.mealPlan);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to generate meal plan. Please try again later.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12 text-center">
            <h1 className="font-headline text-4xl md:text-5xl font-bold text-foreground mb-2 tracking-tight">
            Weekly Meal Plan Generator
            </h1>
            <p className="text-lg text-muted-foreground">
            Let AI create a delicious week-long meal plan using your available ingredients.
            </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Create Your Plan</CardTitle>
            <CardDescription>
              We'll use your saved ingredients. Add any dietary preferences below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                 <div>
                    <h3 className="text-sm font-medium mb-2">Your Ingredients:</h3>
                    {isPantryLoaded && ingredients.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                        {ingredients.map(ing => (
                            <Badge key={ing} variant="secondary">{ing}</Badge>
                        ))}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">Add ingredients on the main page first.</p>
                    )}
                </div>

                <FormField
                  control={form.control}
                  name="preferences"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dietary Preferences (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., vegetarian, gluten-free, low-carb" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isLoading || ingredients.length === 0}>
                  {isLoading ? 'Generating...' : 'Generate Meal Plan'}
                  <Sparkles className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {isLoading && <MealPlanSkeleton />}
        
        {mealPlan && (
          <Card>
            <CardHeader>
              <CardTitle>Your Personalized Meal Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm md:prose-base prose-headings:font-headline max-w-none text-foreground prose-strong:text-foreground">
                {mealPlan.split('\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
