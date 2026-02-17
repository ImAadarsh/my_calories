import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { query } from '@/lib/db';
import { authOptions } from '@/lib/auth';
import { syncDailyReport } from '@/lib/sync';
import { formatInTimeZone } from 'date-fns-tz';

const TIMEZONE = 'Asia/Kolkata';

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: mealId } = await params;
    const session = await getServerSession(authOptions) as any;
    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { food_name, calories, description, meal_type, protein, carbs, fats } = await req.json();

        // 1. Get original date for sync
        const originalMeal = await query(
            "SELECT DATE(eaten_at) as date FROM meals WHERE id = ? AND user_id = ?",
            [mealId, session.user.id]
        ) as any[];

        if (originalMeal.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });

        // 2. Update meal
        await query(
            "UPDATE meals SET food_name = ?, calories = ?, description = ?, meal_type = ?, protein = ?, carbs = ?, fats = ? WHERE id = ? AND user_id = ?",
            [food_name, calories, description, meal_type, protein || 0, carbs || 0, fats || 0, mealId, session.user.id]
        );

        // 3. Sync
        await syncDailyReport(session.user.id, formatInTimeZone(new Date(originalMeal[0].date), TIMEZONE, 'yyyy-MM-dd'));

        return NextResponse.json({ status: 'success' });
    } catch (error: any) {
        console.error('Meal update error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: mealId } = await params;
    const session = await getServerSession(authOptions) as any;
    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // 1. Get date for sync
        const originalMeal = await query(
            "SELECT DATE(eaten_at) as date FROM meals WHERE id = ? AND user_id = ?",
            [mealId, session.user.id]
        ) as any[];

        if (originalMeal.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });

        // 2. Delete
        await query(
            "DELETE FROM meals WHERE id = ? AND user_id = ?",
            [mealId, session.user.id]
        );

        // 3. Sync
        await syncDailyReport(session.user.id, formatInTimeZone(new Date(originalMeal[0].date), TIMEZONE, 'yyyy-MM-dd'));

        return NextResponse.json({ status: 'success' });
    } catch (error: any) {
        console.error('Meal deletion error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
