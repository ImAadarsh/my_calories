import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { query } from '@/lib/db';
import { authOptions } from '@/lib/auth';
import { formatInTimeZone } from 'date-fns-tz';

const TIMEZONE = 'Asia/Kolkata';

export async function GET(req: Request) {
    const session = await getServerSession(authOptions) as any;
    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'weekly';

    try {
        const todayIST = formatInTimeZone(new Date(), TIMEZONE, 'yyyy-MM-dd');
        const interval = type === 'weekly' ? 7 : 30;

        const sql = `
            SELECT 
                DATE(CONVERT_TZ(eaten_at, '+00:00', '+05:30')) as date, 
                SUM(calories) as total_calories 
            FROM meals 
            WHERE user_id = ? 
              AND DATE(CONVERT_TZ(eaten_at, '+00:00', '+05:30')) >= DATE_SUB(?, INTERVAL ? DAY)
            GROUP BY date
            ORDER BY date ASC
        `;

        const stats = await query(sql, [session.user.id, todayIST, interval]);
        return NextResponse.json(stats);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
