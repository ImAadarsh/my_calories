export interface User {
    id: string;
    name: string;
    email: string;
    image: string;
    sex?: 'male' | 'female' | 'other';
    age?: number;
    height?: number; // cm
    weight?: number; // kg
    target_weight?: number;
    activity_level?: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active';
    goal?: 'lose' | 'maintain' | 'gain' | 'muscle' | 'other';
    daily_calorie_goal?: number;
    created_at: string;
}

export interface Meal {
    id: number;
    user_id: string;
    food_name: string;
    description: string;
    calories: number;
    image_url: string;
    eaten_at: string; // IST
}

export interface DailyStats {
    date: string;
    total_calories: number;
    meals: Meal[];
}
