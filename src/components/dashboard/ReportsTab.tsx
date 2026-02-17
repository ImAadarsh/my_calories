"use client";

import { motion } from "framer-motion";
import { Activity, History, Sparkles, ChevronRight } from "lucide-react";
import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip, CartesianGrid } from 'recharts';

interface ReportsTabProps {
    selectedRange: 'daily' | 'weekly' | 'custom';
    setSelectedRange: (range: 'daily' | 'weekly' | 'custom') => void;
    customRange: { start: string; end: string };
    setCustomRange: (range: { start: string; end: string }) => void;
    cumulativeData: any;
    historicalDate: string;
    onHistoricalDateChange: (date: string) => void;
    historicalReport: any;
    historicalMeals: any[];
    onMealClick: (meal: any) => void;
    onViewFullReport: (report: any) => void;
}

export function ReportsTab({
    selectedRange,
    setSelectedRange,
    customRange,
    setCustomRange,
    cumulativeData,
    historicalDate,
    onHistoricalDateChange,
    historicalReport,
    historicalMeals,
    onMealClick,
    onViewFullReport
}: ReportsTabProps) {
    return (
        <motion.div
            key="reports"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="px-6 space-y-8"
        >
            {/* Unified Range Filter */}
            <div className="space-y-4">
                <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-2xl shadow-inner">
                    {(['daily', 'weekly', 'custom'] as const).map((r) => (
                        <button
                            key={r}
                            onClick={() => setSelectedRange(r)}
                            className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${selectedRange === r ? 'bg-white dark:bg-gold text-blue-600 dark:text-slate-950 shadow-sm' : 'text-slate-400'}`}
                        >
                            {r}
                        </button>
                    ))}
                </div>

                {selectedRange === 'custom' && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="flex gap-2 items-center px-2"
                    >
                        <input
                            type="date"
                            value={customRange.start}
                            onChange={(e) => setCustomRange({ ...customRange, start: e.target.value })}
                            className="flex-1 p-3 bg-slate-50 dark:bg-white/5 rounded-2xl text-[10px] font-black dark:text-white outline-none border border-slate-100 dark:border-white/10"
                        />
                        <span className="text-slate-400 font-black text-[10px] uppercase">to</span>
                        <input
                            type="date"
                            value={customRange.end}
                            onChange={(e) => setCustomRange({ ...customRange, end: e.target.value })}
                            className="flex-1 p-3 bg-slate-50 dark:bg-white/5 rounded-2xl text-[10px] font-black dark:text-white outline-none border border-slate-100 dark:border-white/10"
                        />
                    </motion.div>
                )}
            </div>

            {cumulativeData && (
                <div className="bg-slate-900 rounded-[2.5rem] p-7 text-white shadow-2xl relative overflow-hidden">
                    <div className="relative z-10 space-y-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-gold text-[10px] font-black uppercase tracking-[0.2em] mb-2">Cumulative Stats</p>
                                <div className="flex items-baseline gap-2">
                                    <h2 className="text-5xl font-black font-display leading-none tracking-tighter text-cream">
                                        {Math.round(cumulativeData.summary?.total_calories || 0).toLocaleString()}
                                    </h2>
                                    <span className="text-slate-400 dark:text-cream/50 font-bold text-lg">total kcal</span>
                                </div>
                            </div>
                            <div className="w-12 h-12 bg-gold/20 rounded-xl flex items-center justify-center border border-gold/30">
                                <Activity className="text-gold" size={24} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-1">
                                <p className="text-slate-500 dark:text-cream/40 text-[8px] font-black uppercase tracking-widest leading-none">Avg Calories</p>
                                <p className="text-xl font-black text-white dark:text-cream">{Math.round(cumulativeData.summary?.avg_calories || 0)} <span className="text-[10px] text-slate-500 dark:text-cream/30">kcal</span></p>
                                <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: '65%' }}
                                        className="h-full bg-gold"
                                    />
                                </div>
                            </div>
                            <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-1">
                                <p className="text-slate-500 dark:text-cream/40 text-[8px] font-black uppercase tracking-widest leading-none">Days Tracked</p>
                                <p className="text-xl font-black text-white dark:text-cream">{cumulativeData.summary?.days_logged || 0} <span className="text-[10px] text-slate-500 dark:text-cream/30">days</span></p>
                                <div className="flex gap-1 mt-1">
                                    {[1, 2, 3, 4, 5].map(i => <div key={i} className={`w-1 h-1 rounded-full ${i <= ((cumulativeData.summary?.days_logged || 0) % 5) ? 'bg-gold' : 'bg-white/10'}`} />)}
                                </div>
                            </div>
                            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                <p className="text-slate-500 text-[8px] font-black uppercase tracking-widest mb-1">Total Protein</p>
                                <p className="text-xl font-black text-emerald-400 dark:text-gold">{Math.round(cumulativeData.summary?.total_protein || 0)}g</p>
                            </div>
                            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                <p className="text-slate-500 text-[8px] font-black uppercase tracking-widest mb-1">Total Carbs</p>
                                <p className="text-xl font-black text-amber-400">{Math.round(cumulativeData.summary?.total_carbs || 0)}g</p>
                            </div>
                        </div>

                        <div className="pt-4 h-48 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={cumulativeData.trend}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                    <XAxis dataKey="report_date" hide />
                                    <Tooltip
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                return (
                                                    <div className="glass-dark p-4 rounded-2xl border-white/10 shadow-2xl space-y-2 bg-slate-900/90 backdrop-blur-md">
                                                        <p className="text-[10px] font-black text-white/50">{new Date(payload[0].payload.report_date).toLocaleDateString()}</p>
                                                        <div className="space-y-1">
                                                            {payload.map((p: any) => (
                                                                <div key={p.name} className="flex items-center justify-between gap-4">
                                                                    <span className="text-[9px] font-black uppercase text-slate-400">{p.name}</span>
                                                                    <span className="text-xs font-black text-white" style={{ color: p.color }}>{p.value}{p.name === 'Calories' ? 'kcal' : 'g'}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Bar name="Calories" dataKey="total_calories" fill="#D4AF37" radius={[4, 4, 0, 0]} />
                                    <Bar name="Protein" dataKey="total_protein" fill="#E5C100" radius={[4, 4, 0, 0]} />
                                    <Bar name="Carbs" dataKey="total_carbs" fill="#F9E27E" radius={[4, 4, 0, 0]} />
                                    <Bar name="Fats" dataKey="total_fats" fill="#806B2C" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="grid grid-cols-4 gap-2 pt-2">
                            {[
                                { label: 'Energy', color: 'bg-gold' },
                                { label: 'Protein', color: 'bg-gold/80' },
                                { label: 'Carbs', color: 'bg-gold/60' },
                                { label: 'Fats', color: 'bg-gold/40' }
                            ].map(item => (
                                <div key={item.label} className="flex items-center gap-1.5">
                                    <div className={`w-1.5 h-1.5 rounded-full ${item.color}`} />
                                    <span className="text-[8px] font-black uppercase text-slate-500 dark:text-cream/40">{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600 dark:bg-gold opacity-10 rounded-full blur-[80px]" />
                </div>
            )}

            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-7 border border-slate-100 dark:border-white/5 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                    <h4 className="font-black text-slate-900 dark:text-cream uppercase tracking-widest flex items-center gap-2">
                        <History size={18} className="text-blue-600 dark:text-gold" /> Historical Reports
                    </h4>
                    <input
                        type="date"
                        value={historicalDate}
                        onChange={(e) => onHistoricalDateChange(e.target.value)}
                        className="p-2 bg-slate-50 dark:bg-white/5 rounded-xl text-[10px] font-black tracking-tight dark:text-white outline-none"
                    />
                </div>

                <div className="space-y-8">
                    <div className="space-y-6">
                        <div className="flex items-center justify-between px-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Daily Insights</p>
                            {historicalReport && (
                                <div className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-wider ${historicalReport.is_ai_report ? 'bg-blue-600/10 text-blue-600 dark:bg-gold/10 dark:text-gold border border-blue-600/20 dark:border-gold/20' : 'bg-slate-100 text-slate-400 dark:bg-white/5 dark:text-cream/40'}`}>
                                    {historicalReport.is_ai_report ? 'AI Deep Dive' : 'Live Sync Progress'}
                                </div>
                            )}
                        </div>
                        {historicalReport ? (
                            <div className="space-y-6">
                                {historicalReport.summary && (
                                    <div className="p-4 bg-blue-50 dark:bg-gold/5 rounded-2xl border border-blue-100 dark:border-gold/10">
                                        <p className="text-slate-700 dark:text-cream/80 text-xs italic leading-relaxed">"{historicalReport.summary}"</p>
                                    </div>
                                )}
                                <div className="grid grid-cols-2 gap-3">
                                    {historicalReport.table?.slice(0, 4).map((row: any, i: number) => (
                                        <div key={i} className="flex flex-col gap-1 bg-white dark:bg-white/5 p-4 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
                                            <span className="text-[8px] font-black text-slate-400 dark:text-cream/40 uppercase tracking-[0.2em]">{row.nutrient}</span>
                                            <span className="text-base font-black text-slate-900 dark:text-cream">{row.intake} <span className="text-[10px] text-slate-400 dark:text-cream/30 lowercase">{row.unit}</span></span>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={() => onViewFullReport(historicalReport)}
                                    className="w-full bg-blue-600 dark:bg-gold text-white dark:text-slate-950 p-5 rounded-[2rem] shadow-xl shadow-blue-600/20 dark:shadow-gold/20 flex items-center justify-between group hover:bg-blue-700 dark:hover:bg-gold/90 transition-all font-black text-[11px] uppercase tracking-widest"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-white/20 dark:bg-slate-950/20 rounded-xl flex items-center justify-center">
                                            <span className="relative">
                                                <Sparkles size={16} />
                                                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute inset-0 bg-white/20 dark:bg-cream/20 blur-md rounded-full" />
                                            </span>
                                        </div>
                                        Full Deep-Dive Analysis
                                    </div>
                                    <ChevronRight size={18} className="group-hover:translate-x-1 transition-all" />
                                </button>
                            </div>
                        ) : (
                            <div className="py-12 text-center bg-slate-50 dark:bg-white/5 rounded-[2rem] border-2 border-dashed border-slate-100 dark:border-white/5">
                                <Sparkles size={32} className="text-slate-200 mx-auto mb-3 opacity-30" />
                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest leading-none mb-1">No AI Report</p>
                                <p className="text-[8px] text-slate-300 uppercase font-black tracking-widest">Select a date with logs</p>
                            </div>
                        )}
                    </div>

                    <div className="space-y-4 pt-6 border-t border-slate-50 dark:border-white/5">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Daily Log</p>
                        <div className="space-y-3">
                            {historicalMeals.length > 0 ? (
                                historicalMeals.map((meal, i) => (
                                    <div
                                        key={i}
                                        onClick={() => onMealClick(meal)}
                                        className="flex items-center gap-4 p-4 bg-white dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/5 cursor-pointer hover:scale-[1.01] transition-all group shadow-sm hover:shadow-md"
                                    >
                                        <div className="w-12 h-12 rounded-2xl bg-blue-600 dark:bg-gold text-white dark:text-slate-950 flex items-center justify-center font-black text-sm shadow-lg shadow-blue-600/20 dark:shadow-gold/20 group-hover:scale-110 transition-transform">
                                            {meal.calories}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h5 className="text-xs font-black text-slate-900 dark:text-cream truncate uppercase tracking-tight">{meal.food_name}</h5>
                                            <p className="text-[9px] text-slate-400 dark:text-cream/40 font-bold uppercase tracking-wider">{meal.meal_type || 'snack'}</p>
                                        </div>
                                        <ChevronRight size={16} className="text-slate-300 group-hover:text-gold transition-colors" />
                                    </div>
                                ))
                            ) : (
                                <div className="py-10 text-center bg-slate-50 dark:bg-white/5 rounded-[2rem] border-2 border-dashed border-slate-100 dark:border-white/5">
                                    <History size={24} className="text-slate-200 mx-auto mb-2" />
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">No individual logs</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
