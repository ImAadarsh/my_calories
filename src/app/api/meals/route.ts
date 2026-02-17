import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { query } from '@/lib/db';
import { analyzeFoodImage } from '@/lib/gemini';
import { authOptions } from '@/lib/auth';
import { formatInTimeZone } from 'date-fns-tz';
import { syncDailyReport } from '@/lib/sync';

const TIMEZONE = 'Asia/Kolkata';

export async function POST(req: Request) {
    const session = await getServerSession(authOptions) as any;
    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const istNow = formatInTimeZone(new Date(), TIMEZONE, 'yyyy-MM-dd HH:mm:ss');
        const contentType = req.headers.get('content-type') || '';
        let food_name, calories, description, mealType, protein, carbs, fats;

        if (contentType.includes('application/json')) {
            const body = await req.json();
            food_name = body.food_name;
            calories = body.calories;
            description = body.description;
            mealType = body.mealType;
            protein = body.protein || 0;
            carbs = body.carbs || 0;
            fats = body.fats || 0;
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
            protein = analysis.protein || 0;
            carbs = analysis.carbs || 0;
            fats = analysis.fats || 0;

            if (subtractionMealId) {
                // If subtraction, we update the original meal by subtracting these values
                await query(
                    "UPDATE meals SET calories = GREATEST(0, calories - ?), protein = GREATEST(0, protein - ?), carbs = GREATEST(0, carbs - ?), fats = GREATEST(0, fats - ?), description = CONCAT(description, ' [Leftover subtraction: -', ?, ' kcal, -', ?, 'g P, -', ?, 'g C, -', ?, 'g F: ', ?, ']') WHERE id = ? AND user_id = ?",
                    [calories, protein, carbs, fats, calories, protein, carbs, fats, food_name, subtractionMealId, session.user.id]
                );

                // SYNC: Update daily report totals for the original meal's date
                const originalMeal = await query(
                    "SELECT DATE(eaten_at) as date FROM meals WHERE id = ? AND user_id = ?",
                    [subtractionMealId, session.user.id]
                ) as any[];
                if (originalMeal.length > 0) {
                    await syncDailyReport(session.user.id, formatInTimeZone(new Date(originalMeal[0].date), TIMEZONE, 'yyyy-MM-dd'));
                }

                return NextResponse.json({ status: 'success' });
            }
        }

        await query(
            "INSERT INTO meals (user_id, food_name, description, calories, protein, carbs, fats, eaten_at, meal_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [
                session.user.id,
                food_name,
                description,
                calories,
                protein,
                carbs,
                fats,
                istNow,
                mealType
            ]
        );

        // SYNC: Update daily report totals
        const todayIST = istNow.split(' ')[0];
        await syncDailyReport(session.user.id, todayIST);

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
                    ORDER BY id DESC 
                    LIMIT 20
                ) as last_20
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

        let sql = "SELECT id, user_id, food_name, description, calories, protein, carbs, fats, eaten_at, meal_type, image_url, TIME_FORMAT(eaten_at, '%h:%i %p') as time FROM meals WHERE user_id = ?";
        let params = [session.user.id];

        if (type === 'daily') {
            const requestedDate = searchParams.get('date');
            if (requestedDate) {
                sql += " AND DATE(eaten_at) = ?";
                params.push(requestedDate);
            } else {
                sql += " AND DATE(eaten_at) = ?";
                params.push(todayIST);
            }
        }

        const meals = await query(sql, params);
        return NextResponse.json(meals);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
