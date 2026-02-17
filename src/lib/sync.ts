import { query } from './db';

/**
 * Synchronizes the daily_reports table with the sum of all meals for a given user and date.
 * If a report doesn't exist, it creates one with is_ai_report = 0.
 * If it exists, it updates the macro totals while preserving AI analysis content.
 */
export async function syncDailyReport(userId: string, date: string) {
    console.log(`[Sync] Synchronizing report for user ${userId} on ${date}`);

    try {
        // 1. Get sums from meals
        const [totals] = await query(
            `SELECT 
                SUM(calories) as total_calories,
                SUM(protein) as total_protein,
                SUM(carbs) as total_carbs,
                SUM(fats) as total_fats
             FROM meals 
             WHERE user_id = ? AND DATE(eaten_at) = ?`,
            [userId, date]
        ) as any[];

        const calories = totals?.total_calories || 0;
        const protein = totals?.total_protein || 0;
        const carbs = totals?.total_carbs || 0;
        const fats = totals?.total_fats || 0;

        // 2. Check if report exists
        const reports = await query(
            "SELECT id, is_ai_report FROM daily_reports WHERE user_id = ? AND report_date = ?",
            [userId, date]
        ) as any[];

        if (reports.length > 0) {
            // Update existing
            await query(
                `UPDATE daily_reports 
                 SET total_calories = ?, total_protein = ?, total_carbs = ?, total_fats = ?
                 WHERE user_id = ? AND report_date = ?`,
                [calories, protein, carbs, fats, userId, date]
            );
            console.log(`[Sync] Updated existing report for ${date}`);
        } else {
            // Create new (non-AI report by default)
            await query(
                `INSERT INTO daily_reports 
                 (user_id, report_date, total_calories, total_protein, total_carbs, total_fats, is_ai_report, analysis_content, feeling)
                 VALUES (?, ?, ?, ?, ?, ?, 0, '', 'neutral')`,
                [userId, date, calories, protein, carbs, fats]
            );
            console.log(`[Sync] Created new summary report for ${date}`);
        }

        return { success: true, totals: { calories, protein, carbs, fats } };
    } catch (error) {
        console.error(`[Sync] Error synchronizing report:`, error);
        throw error;
    }
}
