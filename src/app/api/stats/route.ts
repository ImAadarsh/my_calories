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
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    try {
        const todayIST = formatInTimeZone(new Date(), TIMEZONE, 'yyyy-MM-dd');

        let sql = `
            SELECT 
                DATE(eaten_at) as date, 
                SUM(calories) as total_calories,
                SUM(protein) as total_protein,
                SUM(carbs) as total_carbs,
                SUM(fats) as total_fats
            FROM meals 
            WHERE user_id = ?
        `;
        let params: any[] = [session.user.id];

        if (type === 'daily') {
            sql += " AND DATE(eaten_at) = ?";
            params.push(todayIST);
        } else if (type === 'custom' && startDate && endDate) {
            sql += " AND DATE(eaten_at) BETWEEN ? AND ?";
            params.push(startDate, endDate);
        } else {
            // Default to weekly (7 days) or handle 'weekly' explicitly
            const interval = 7;
            sql += " AND DATE(eaten_at) BETWEEN DATE_SUB(?, INTERVAL ? DAY) AND ?";
            params.push(todayIST, interval, todayIST);
        }

        sql += " GROUP BY date ORDER BY date ASC";
        const stats = await query(sql, params);

        // Breakdown query
        let breakdownSql = `
            SELECT meal_type, SUM(calories) as calories
            FROM meals 
            WHERE user_id = ?
        `;
        let breakdownParams: any[] = [session.user.id];

        if (type === 'daily') {
            breakdownSql += " AND DATE(eaten_at) = ?";
            breakdownParams.push(todayIST);
        } else if (type === 'custom' && startDate && endDate) {
            breakdownSql += " AND DATE(eaten_at) BETWEEN ? AND ?";
            breakdownParams.push(startDate, endDate);
        } else {
            const interval = 7;
            breakdownSql += " AND DATE(eaten_at) BETWEEN DATE_SUB(?, INTERVAL ? DAY) AND ?";
            breakdownParams.push(todayIST, interval, todayIST);
        }
        breakdownSql += " GROUP BY meal_type";

        const breakdown = await query(breakdownSql, breakdownParams);

        return NextResponse.json({ trend: stats, breakdown });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
