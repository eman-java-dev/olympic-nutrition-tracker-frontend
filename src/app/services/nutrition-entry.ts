export interface NutritionEntry {
  id?: number;
  /** YYYY-MM-DD */
  date: string;
  calories: number;
  protein: number;  // grams
  carbs: number;    // grams
  fat: number;      // grams
  notes?: string;
}
