"use client";

import { motion } from "framer-motion";
import { Flame, Target, Sparkles, History, Sun, CloudSun, Moon, Coffee, Utensils, Clock, ChevronRight } from "lucide-react";

interface DailyTabProps {
    totalCalories: number;
    calorieGoal: number;
    progress: number;
    meals: any[];
    dailyReport: any;
    isDinnerTime: boolean;
    onAnalyzeDay: () => void;
    onMealClick: (meal: any) => void;
    summaryScale: any;
    summaryOpacity: any;
    summaryY: any;
}

export function DailyTab({
    totalCalories,
    calorieGoal,
    progress,
    meals,
    dailyReport,
    isDinnerTime,
    onAnalyzeDay,
    onMealClick,
    summaryScale,
    summaryOpacity,
    summaryY
}: DailyTabProps) {
    return (
        <motion.div
            key="daily"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="px-6 space-y-10"
        >
            {/* Premium Progress Card */}
            <motion.div
                style={{ scale: summaryScale, opacity: summaryOpacity, y: summaryY }}
                className="relative group sticky top-0 z-20 origin-top"
            >
                <div className="absolute inset-0 bg-gold rounded-[3rem] blur-3xl opacity-20 group-hover:opacity-30 transition-opacity" />
                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-7 text-slate-900 dark:text-cream relative overflow-hidden shadow-2xl border border-slate-100 dark:border-white/5">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gold opacity-20 rounded-full blur-[60px] translate-x-1/2 -translate-y-1/2" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-muted-gold opacity-20 rounded-full blur-[50px] -translate-x-1/2 translate-y-1/2" />

                    <div className="relative z-10 space-y-7">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1.5">Current Status</p>
                                <div className="flex items-baseline gap-2">
                                    <h2 className="text-6xl font-black font-display leading-none tracking-tighter text-slate-900 dark:text-cream">{totalCalories}</h2>
                                    <span className="text-slate-400 font-bold text-lg">kcal</span>
                                </div>
                            </div>
                            <div className="w-14 h-14 bg-blue-600 dark:bg-gold text-white dark:text-slate-950 rounded-[1.25rem] shadow-lg shadow-blue-600/30 dark:shadow-gold/30 flex items-center justify-center">
                                <Flame size={28} className="animate-pulse" />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between text-xs font-black uppercase tracking-[0.15em] text-slate-400">
                                <span>Energy Burn</span>
                                <span>{Math.round(progress)}% of daily</span>
                            </div>
                            <div className="h-4 bg-slate-50 dark:bg-white/5 rounded-full overflow-hidden p-1 border border-slate-100 dark:border-white/5">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 1, ease: "circOut" }}
                                    className="h-full bg-gradient-to-r from-blue-600 to-blue-400 dark:from-gold dark:to-muted-gold rounded-full shadow-[0_0_15px_rgba(59,130,246,0.3)] dark:shadow-[0_0_15px_rgba(212,175,55,0.3)]"
                                />
                            </div>
                        </div>

                        {/* Optimized Target - Catchy Style */}
                        <div className="pt-5 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 bg-blue-50 dark:bg-gold/10 rounded-lg flex items-center justify-center">
                                    <Target size={12} className="text-blue-600 dark:text-gold" />
                                </div>
                                <div>
                                    <p className="text-slate-400 text-[8px] font-black uppercase tracking-widest leading-none mb-1">Target Intake</p>
                                    <p className="text-slate-900 dark:text-cream text-xs font-black tracking-tight">{calorieGoal} <span className="text-[10px] text-slate-400">kcal</span></p>
                                </div>
                            </div>
                            <div className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${progress > 100 ? 'bg-red-100 text-red-600' : 'bg-blue-50 dark:bg-gold/20 text-blue-600 dark:text-gold'}`}>
                                {progress > 100 ? 'Over Limit' : 'On Track'}
                            </div>
                        </div>

                        {(isDinnerTime || dailyReport) && (
                            <div className="pt-3 mt-1">
                                <button
                                    onClick={onAnalyzeDay}
                                    disabled={meals.length === 0}
                                    className={`w-full py-3 ${dailyReport ? 'bg-slate-100 dark:bg-white/5 text-slate-500' : 'bg-blue-600 dark:bg-gold text-white dark:text-slate-950 shadow-xl shadow-blue-600/20 dark:shadow-gold/20'} rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 group disabled:opacity-50`}
                                >
                                    <Sparkles size={14} className={dailyReport ? "" : "text-blue-200 dark:text-slate-900 group-hover:rotate-12 transition-transform"} />
                                    {dailyReport ? 'View Your Daily Report' : 'Analyze My Day'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Meal List Section */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-slate-900 dark:text-cream font-black text-xl font-display">Eaten Today</h3>
                    <div className="px-3 py-1.5 bg-slate-100 dark:bg-gold/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gold">
                        {meals.length} Items
                    </div>
                </div>

                <div className="space-y-4">
                    {meals.length === 0 ? (
                        <div className="py-20 text-center glass border-dashed border-2 rounded-[2.5rem]">
                            <div className="w-20 h-20 bg-slate-100 rounded-full mx-auto mb-6 flex items-center justify-center text-slate-300">
                                <History size={32} />
                            </div>
                            <p className="text-slate-400 font-bold">No meals tracked yet.</p>
                            <p className="text-xs text-slate-300 mt-1 uppercase tracking-widest font-black">Waiting for your first snap</p>
                        </div>
                    ) : (
                        meals.map((meal, i) => {
                            const mealConfig = (() => {
                                switch (meal.meal_type?.toLowerCase()) {
                                    case 'breakfast': return {
                                        colors: 'bg-white/60 dark:bg-emerald-400/5 border-slate-100 dark:border-emerald-400/20',
                                        accent: 'bg-emerald-300 dark:bg-emerald-400',
                                        icon: <Sun size={14} className="text-emerald-400 dark:text-emerald-300" />,
                                        text: 'text-emerald-600 dark:text-emerald-300',
                                        badge: 'bg-emerald-50/50 dark:bg-emerald-400/10'
                                    };
                                    case 'lunch': return {
                                        colors: 'bg-white/60 dark:bg-amber-400/5 border-slate-100 dark:border-amber-400/20',
                                        accent: 'bg-amber-500 dark:bg-amber-400',
                                        icon: <CloudSun size={14} className="text-amber-600 dark:text-amber-400" />,
                                        text: 'text-amber-700 dark:text-amber-400',
                                        badge: 'bg-amber-100 dark:bg-amber-400/20'
                                    };
                                    case 'dinner': return {
                                        colors: 'bg-white/60 dark:bg-indigo-400/5 border-slate-100 dark:border-indigo-400/20',
                                        accent: 'bg-indigo-500 dark:bg-indigo-400',
                                        icon: <Moon size={14} className="text-indigo-600 dark:text-indigo-300" />,
                                        text: 'text-indigo-700 dark:text-indigo-300',
                                        badge: 'bg-indigo-50 dark:bg-indigo-400/20'
                                    };
                                    case 'snack': return {
                                        colors: 'bg-white/60 dark:bg-rose-400/5 border-slate-100 dark:border-rose-400/20',
                                        accent: 'bg-rose-500 dark:bg-rose-400',
                                        icon: <Coffee size={14} className="text-rose-600 dark:text-rose-300" />,
                                        text: 'text-rose-700 dark:text-rose-300',
                                        badge: 'bg-rose-50 dark:bg-rose-400/20'
                                    };
                                    default: return {
                                        colors: 'bg-white/60 dark:bg-white/5 border-slate-100 dark:border-white/10',
                                        accent: 'bg-slate-400 dark:bg-slate-500',
                                        icon: <Utensils size={14} className="text-slate-500 dark:text-cream/50" />,
                                        text: 'text-slate-600 dark:text-cream/60',
                                        badge: 'bg-slate-50 dark:bg-white/10'
                                    };
                                }
                            })();

                            return (
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    onClick={() => onMealClick(meal)}
                                    key={i}
                                    className={`flex gap-5 p-5 rounded-[2.5rem] items-center border shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all group cursor-pointer relative overflow-hidden backdrop-blur-md ${mealConfig.colors}`}
                                >
                                    {/* Left Accent Bar */}
                                    <div className={`absolute left-0 top-6 bottom-6 w-1 rounded-r-full group-hover:top-4 group-hover:bottom-4 transition-all duration-500 ${mealConfig.accent}`} />

                                    <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black group-hover:rotate-3 transition-all duration-500 shadow-lg ${mealConfig.badge} border border-white/20 dark:border-white/5`}>
                                        <span className="text-lg leading-none">{meal.calories}</span>
                                        <span className="text-[8px] opacity-60 uppercase tracking-tighter">kcal</span>
                                    </div>

                                    <div className="flex-1 min-w-0 py-1">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${mealConfig.badge} ${mealConfig.text} border border-black/5 dark:border-white/5`}>
                                                {mealConfig.icon}
                                                {meal.meal_type || 'snack'}
                                            </div>
                                            <div className="flex items-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                                                <Clock size={10} className="dark:text-cream" />
                                                <span className="text-[10px] font-bold text-slate-400 dark:text-cream">{meal.time || 'Today'}</span>
                                            </div>
                                        </div>
                                        <h4 className="text-base font-black text-slate-900 dark:text-cream truncate uppercase tracking-tight group-hover:translate-x-1 transition-transform">{meal.food_name}</h4>
                                        <p className="text-[11px] text-slate-400 dark:text-cream/30 font-medium truncate italic leading-relaxed pl-1 border-l border-slate-200 dark:border-white/10 mt-1">
                                            {meal.description || "No description provided"}
                                        </p>
                                    </div>
                                    <div className="opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-500">
                                        <div className={`p-2 rounded-xl ${mealConfig.badge}`}>
                                            <ChevronRight size={16} className={mealConfig.text} />
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </div>
            </div>
        </motion.div>
    );
}
