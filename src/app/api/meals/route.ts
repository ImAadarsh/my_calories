import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { query } from '@/lib/db';
import { analyzeFoodImage } from '@/lib/gemini';
import { authOptions } from '@/lib/auth';
import { formatInTimeZone } from 'date-fns-tz';

const TIMEZONE = 'Asia/Kolkata';

export async function POST(req: Request) {
    const session = await getServerSession(authOptions) as any;
    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const formData = await req.formData();
        const image = formData.get('image') as File;
        const userDescription = formData.get('userDescription') as string | undefined;

        if (!image) {
            return NextResponse.json({ error: "No image provided" }, { status: 400 });
        }

        const buffer = Buffer.from(await image.arrayBuffer());
        const analysis = await analyzeFoodImage(buffer, image.type, userDescription);

        // Get current time in IST
        const nowIST = formatInTimeZone(new Date(), TIMEZONE, 'yyyy-MM-dd HH:mm:ss');

        const mealType = formData.get('mealType') as string || 'snack';

        await query(
            "INSERT INTO meals (user_id, food_name, description, calories, eaten_at, meal_type) VALUES (?, ?, ?, ?, ?, ?)",
            [
                session.user.id,
                analysis.food_name,
                analysis.description,
                analysis.calories,
                nowIST,
                mealType
            ]
        );

        return NextResponse.json({ status: 'success', analysis });
    } catch (error: any) {
        console.error('Meal logging error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(req: Request) {
    const session = await getServerSession(authOptions) as any;
    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'daily';

    try {
        const todayIST = formatInTimeZone(new Date(), TIMEZONE, 'yyyy-MM-dd');

        let sql = "SELECT * FROM meals WHERE user_id = ?";
        let params = [session.user.id];

        if (type === 'daily') {
            // Using +05:30 offset explicitly for robustness in MySQL
            sql += " AND DATE(CONVERT_TZ(eaten_at, '+00:00', '+05:30')) = ?";
            params.push(todayIST);
        }

        const meals = await query(sql, params);
        return NextResponse.json(meals);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
