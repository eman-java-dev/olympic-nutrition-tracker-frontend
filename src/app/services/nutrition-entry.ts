export interface NutritionEntry {
  id?: number;
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  notes?: string;

  athleteId?: number;
  athleteName?: string;
}