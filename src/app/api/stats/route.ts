import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { query } from '@/lib/db';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request) {
    const session = await getServerSession(authOptions) as any;
    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'weekly';

    try {
        let sql = "";
        if (type === 'weekly') {
            sql = `
        SELECT DATE(eaten_at) as date, SUM(calories) as total_calories 
        FROM meals 
        WHERE user_id = ? AND eaten_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        GROUP BY DATE(eaten_at)
        ORDER BY date ASC
      `;
        } else {
            sql = `
        SELECT DATE(eaten_at) as date, SUM(calories) as total_calories 
        FROM meals 
        WHERE user_id = ? AND eaten_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        GROUP BY DATE(eaten_at)
        ORDER BY date ASC
      `;
        }

        const stats = await query(sql, [session.user.id]);
        return NextResponse.json(stats);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
