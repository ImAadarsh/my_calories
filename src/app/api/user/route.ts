import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { query } from '@/lib/db';
import { authOptions } from '@/lib/auth';

export async function PUT(req: Request) {
    const session = await getServerSession(authOptions) as any;
    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const data = await req.json();
        const { sex, age, height, weight, target_weight, activity_level, goal, daily_calorie_goal } = data;

        await query(
            `UPDATE users SET 
        sex = ?, 
        age = ?, 
        height = ?, 
        weight = ?, 
        target_weight = ?, 
        activity_level = ?, 
        goal = ?, 
        daily_calorie_goal = ? 
      WHERE id = ?`,
            [sex, age, height, weight, target_weight, activity_level, goal, daily_calorie_goal, session.user.id]
        );

        return NextResponse.json({ status: 'success' });
    } catch (error: any) {
        console.error('Profile update error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(req: Request) {
    const session = await getServerSession(authOptions) as any;
    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const users = await query("SELECT * FROM users WHERE id = ?", [session.user.id]) as any[];
        return NextResponse.json(users[0] || null);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
