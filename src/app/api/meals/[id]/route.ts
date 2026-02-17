import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { query } from '@/lib/db';
import { authOptions } from '@/lib/auth';

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
        const { food_name, calories, description, meal_type } = await req.json();

        await query(
            "UPDATE meals SET food_name = ?, calories = ?, description = ?, meal_type = ? WHERE id = ? AND user_id = ?",
            [food_name, calories, description, meal_type, mealId, session.user.id]
        );

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

        await query(
            "DELETE FROM meals WHERE id = ? AND user_id = ?",
            [mealId, session.user.id]
        );

        return NextResponse.json({ status: 'success' });
    } catch (error: any) {
        console.error('Meal deletion error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
