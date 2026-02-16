import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { query } from '@/lib/db';
import { analyzeFoodImage } from '@/lib/gemini';
import { authOptions } from '@/lib/auth';

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

        // Save to DB
        // Note: In a real app, you'd upload the image to S3/Cloudinary and save the URL.
        // For this demo, we'll store a placeholder or base64 (not recommended for production)
        const imageUrl = "https://via.placeholder.com/400x300?text=" + analysis.food_name;

        const result = await query(
            "INSERT INTO meals (user_id, food_name, description, calories, image_url, eaten_at) VALUES (?, ?, ?, ?, ?, ?)",
            [
                session.user.id,
                analysis.food_name,
                analysis.description,
                analysis.calories,
                imageUrl,
                new Date() // DB will handle current timestamp, but we can be explicit
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
    const type = searchParams.get('type') || 'daily'; // daily, weekly, monthly

    try {
        let sql = "SELECT * FROM meals WHERE user_id = ?";
        if (type === 'daily') {
            sql += " AND DATE(eaten_at) = CURDATE()";
        }
        // TODO: Implement weekly/monthly logic using built-in MySQL date functions

        const meals = await query(sql, [session.user.id]);
        return NextResponse.json(meals);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
