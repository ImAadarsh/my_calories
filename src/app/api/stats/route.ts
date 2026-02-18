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
            // Monday to Sunday logic
            const today = new Date(todayIST);
            const day = today.getDay(); // 0 (Sun) to 6 (Sat)
            const diffToMonday = (day + 6) % 7;
            const monday = new Date(today);
            monday.setDate(today.getDate() - diffToMonday);
            const sunday = new Date(monday);
            sunday.setDate(monday.getDate() + 6);

            const mondayStr = monday.toISOString().split('T')[0];
            const sundayStr = sunday.toISOString().split('T')[0];

            sql += " AND DATE(eaten_at) BETWEEN ? AND ?";
            params.push(mondayStr, sundayStr);
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
            // Monday to Sunday logic
            const today = new Date(todayIST);
            const day = today.getDay();
            const diffToMonday = (day + 6) % 7;
            const monday = new Date(today);
            monday.setDate(today.getDate() - diffToMonday);
            const sunday = new Date(monday);
            sunday.setDate(monday.getDate() + 6);

            const mondayStr = monday.toISOString().split('T')[0];
            const sundayStr = sunday.toISOString().split('T')[0];

            breakdownSql += " AND DATE(eaten_at) BETWEEN ? AND ?";
            breakdownParams.push(mondayStr, sundayStr);
        }
        breakdownSql += " GROUP BY meal_type";

        const breakdown = await query(breakdownSql, breakdownParams);

        return NextResponse.json({ trend: stats, breakdown });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
