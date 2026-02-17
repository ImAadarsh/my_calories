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
        const contentType = req.headers.get('content-type') || '';
        let food_name, calories, description, mealType;

        if (contentType.includes('application/json')) {
            const body = await req.json();
            food_name = body.food_name;
            calories = body.calories;
            description = body.description;
            mealType = body.mealType;
        } else {
            const formData = await req.formData();
            const image = formData.get('image') as File;
            const userDescription = formData.get('userDescription') as string | undefined;
            const subtractionMealId = formData.get('subtractionMealId') as string | undefined;
            mealType = formData.get('mealType') as string || 'snack';

            if (!image) {
                return NextResponse.json({ error: "No image provided" }, { status: 400 });
            }

            const buffer = Buffer.from(await image.arrayBuffer());
            const analysis = await analyzeFoodImage(buffer, image.type, userDescription, !!subtractionMealId);

            food_name = analysis.food_name;
            calories = analysis.calories;
            description = analysis.description;

            if (subtractionMealId) {
                // If subtraction, we update the original meal by subtracting these calories
                await query(
                    "UPDATE meals SET calories = GREATEST(0, calories - ?), description = CONCAT(description, ' [Leftover subtraction: -', ?, ' kcal: ', ?, ']') WHERE id = ? AND user_id = ?",
                    [calories, calories, food_name, subtractionMealId, session.user.id]
                );
                return NextResponse.json({ status: 'success' });
            }
        }

        // Get current time in IST
        const nowIST = formatInTimeZone(new Date(), TIMEZONE, 'yyyy-MM-dd HH:mm:ss');

        await query(
            "INSERT INTO meals (user_id, food_name, description, calories, eaten_at, meal_type) VALUES (?, ?, ?, ?, ?, ?)",
            [
                session.user.id,
                food_name,
                description,
                calories,
                nowIST,
                mealType
            ]
        );

        return NextResponse.json({ status: 'success' });
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
    const frequent = searchParams.get('frequent') === 'true';

    try {
        const todayIST = formatInTimeZone(new Date(), TIMEZONE, 'yyyy-MM-dd');

        const mealTypeParam = searchParams.get('mealType');

        if (frequent) {
            let sql = `
                SELECT food_name, description, calories, COUNT(*) as frequency 
                FROM (
                    SELECT * FROM meals 
                    WHERE user_id = ? 
                    ORDER BY eaten_at DESC 
                    LIMIT 10
                ) as last_10
            `;
            let params: any[] = [session.user.id];

            if (mealTypeParam) {
                sql += " WHERE meal_type = ?";
                params.push(mealTypeParam);
            }

            sql += " GROUP BY food_name, description, calories ORDER BY frequency DESC LIMIT 3";

            const frequentMeals = await query(sql, params);
            return NextResponse.json(frequentMeals);
        }

        let sql = "SELECT * FROM meals WHERE user_id = ?";
        let params = [session.user.id];

        if (type === 'daily') {
            sql += " AND DATE(CONVERT_TZ(eaten_at, '+00:00', '+05:30')) = ?";
            params.push(todayIST);
        }

        const meals = await query(sql, params);
        return NextResponse.json(meals);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
