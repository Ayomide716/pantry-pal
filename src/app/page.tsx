import IngredientInput from '@/components/ingredient-input';
import RecipeList from '@/components/recipe-list';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UtensilsCrossed } from 'lucide-react';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold text-foreground mb-2 tracking-tight">
          What's in your pantry?
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Enter the ingredients you have on hand, and PantryPal will whip up a list of delicious recipes you can make right now.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-4 xl:col-span-3">
          <div className="sticky top-24">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UtensilsCrossed className="text-primary" />
                  Your Ingredients
                </CardTitle>
              </CardHeader>
              <CardContent>
                <IngredientInput />
              </CardContent>
            </Card>
          </div>
        </div>
        <div className="lg:col-span-8 xl:col-span-9">
          <RecipeList />
        </div>
      </div>
    </div>
  );
}
