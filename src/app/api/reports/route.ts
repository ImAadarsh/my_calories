import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { query } from '@/lib/db';
import { authOptions } from '@/lib/auth';
import { analyzeDay } from '@/lib/gemini';
import { formatInTimeZone } from 'date-fns-tz';

const TIMEZONE = 'Asia/Kolkata';

export async function GET(req: Request) {
    const session = await getServerSession(authOptions) as any;
    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const requestedDate = searchParams.get('date');
        const range = searchParams.get('range'); // 'daily', 'weekly', 'custom'
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        if (range) {
            let dateFilter = "";
            let params: any[] = [session.user.id];

            if (range === 'daily') {
                const todayIST = formatInTimeZone(new Date(), TIMEZONE, 'yyyy-MM-dd');
                dateFilter = "report_date = ?";
                params.push(todayIST);
            } else if (range === 'weekly') {
                dateFilter = "report_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)";
            } else if (range === 'custom' && startDate && endDate) {
                dateFilter = "report_date BETWEEN ? AND ?";
                params.push(startDate, endDate);
            } else {
                // Fallback or default
                dateFilter = "report_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)";
            }

            const aggregated = await query(
                `SELECT 
                    SUM(total_calories) as total_calories,
                    AVG(total_calories) as avg_calories,
                    SUM(total_protein) as total_protein,
                    SUM(total_carbs) as total_carbs,
                    SUM(total_fats) as total_fats,
                    COUNT(*) as days_logged
                 FROM daily_reports 
                 WHERE user_id = ? AND ${dateFilter}`,
                params
            ) as any[];

            const dailyTrend = await query(
                `SELECT report_date, total_calories, total_protein, total_carbs, total_fats, feeling, is_ai_report FROM daily_reports 
                 WHERE user_id = ? AND ${dateFilter} 
                 ORDER BY report_date ASC`,
                params
            ) as any[];

            return NextResponse.json({
                summary: aggregated[0],
                trend: dailyTrend
            });
        }

        const targetDate = requestedDate || formatInTimeZone(new Date(), TIMEZONE, 'yyyy-MM-dd');
        const existingReport = await query(
            "SELECT * FROM daily_reports WHERE user_id = ? AND report_date = ?",
            [session.user.id, targetDate]
        ) as any[];

        return NextResponse.json(existingReport[0] || null);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions) as any;
    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { feeling } = await req.json();
        const todayIST = formatInTimeZone(new Date(), TIMEZONE, 'yyyy-MM-dd');

        // Check if report already exists
        const existing = await query(
            "SELECT id, is_ai_report FROM daily_reports WHERE user_id = ? AND report_date = ?",
            [session.user.id, todayIST]
        ) as any[];

        if (existing.length > 0 && existing[0].is_ai_report === 1) {
            return NextResponse.json({ error: "AI Report already generated for today" }, { status: 400 });
        }

        // Get today's meals
        const meals = await query(
            "SELECT * FROM meals WHERE user_id = ? AND DATE(eaten_at) = ?",
            [session.user.id, todayIST]
        ) as any[];

        if (meals.length === 0) {
            return NextResponse.json({ error: "No meals logged today to analyze" }, { status: 400 });
        }

        // Get user profile for goal context
        const profile = await query("SELECT * FROM users WHERE id = ?", [session.user.id]) as any[];

        // Generate AI analysis
        const analysis = await analyzeDay(meals, profile[0]);

        // Calculate actual totals from meals to ensure consistency
        const totalCalories = meals.reduce((sum, m) => sum + (m.calories || 0), 0);
        const totalProtein = meals.reduce((sum, m) => sum + (m.protein || 0), 0);
        const totalCarbs = meals.reduce((sum, m) => sum + (m.carbs || 0), 0);
        const totalFats = meals.reduce((sum, m) => sum + (m.fats || 0), 0);

        // Save report (UPSERT style)
        if (existing.length > 0) {
            await query(
                `UPDATE daily_reports 
                 SET analysis_content = ?, feeling = ?, total_calories = ?, total_protein = ?, total_carbs = ?, total_fats = ?, is_ai_report = 1
                 WHERE id = ?`,
                [
                    JSON.stringify(analysis),
                    feeling,
                    totalCalories || analysis.stats?.calories || 0,
                    totalProtein || analysis.stats?.protein || 0,
                    totalCarbs || analysis.stats?.carbs || 0,
                    totalFats || analysis.stats?.fats || 0,
                    existing[0].id
                ]
            );
        } else {
            await query(
                `INSERT INTO daily_reports 
                (user_id, report_date, analysis_content, feeling, total_calories, total_protein, total_carbs, total_fats, is_ai_report) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
                [
                    session.user.id,
                    todayIST,
                    JSON.stringify(analysis),
                    feeling,
                    totalCalories || analysis.stats?.calories || 0,
                    totalProtein || analysis.stats?.protein || 0,
                    totalCarbs || analysis.stats?.carbs || 0,
                    totalFats || analysis.stats?.fats || 0
                ]
            );
        }

        return NextResponse.json({ status: 'success', analysis });
    } catch (error: any) {
        console.error('Report error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
