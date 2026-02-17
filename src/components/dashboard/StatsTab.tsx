"use client";

import { motion } from "framer-motion";
import { BarChart3, Utensils, Activity } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from 'recharts';

interface StatsTabProps {
    selectedRange: 'daily' | 'weekly' | 'custom';
    setSelectedRange: (range: 'daily' | 'weekly' | 'custom') => void;
    customRange: { start: string; end: string };
    setCustomRange: (range: { start: string; end: string }) => void;
    stats: any[];
    meals: any[];
}

export function StatsTab({
    selectedRange,
    setSelectedRange,
    customRange,
    setCustomRange,
    stats,
    meals
}: StatsTabProps) {
    return (
        <motion.div
            key="stats"
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

            <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
                <div className="relative z-10">
                    <h4 className="font-black text-2xl font-display mb-8 flex items-center gap-3 text-cream/90">
                        <BarChart3 className="text-gold" /> Performance
                    </h4>

                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats}>
                                <defs>
                                    <linearGradient id="colorCal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)', fontWeight: 'bold' }}
                                    tickFormatter={(val) => new Date(val).toLocaleDateString('en-IN', { weekday: 'short' })}
                                />
                                <YAxis hide />
                                <Tooltip
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="glass-dark p-4 rounded-2xl border border-white/10 shadow-2xl bg-slate-900/90 backdrop-blur-md">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-cream/50 mb-1">Intake</p>
                                                    <p className="text-xl font-black text-cream">{payload[0].value} <span className="text-sm font-bold text-gold">kcal</span></p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Area type="monotone" dataKey="total_calories" stroke="#D4AF37" strokeWidth={4} fillOpacity={1} fill="url(#colorCal)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-gold opacity-10 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2" />
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 border border-slate-100 dark:border-white/5 shadow-xl">
                <h4 className="font-black text-lg text-slate-900 dark:text-cream mb-6 uppercase tracking-widest flex items-center gap-2">
                    <Utensils size={18} className="text-blue-600 dark:text-gold" /> Meal Breakdown
                </h4>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={[
                                    { name: 'Breakfast', value: meals.filter(m => m.meal_type === 'breakfast').reduce((a, b) => a + b.calories, 0) },
                                    { name: 'Lunch', value: meals.filter(m => m.meal_type === 'lunch').reduce((a, b) => a + b.calories, 0) },
                                    { name: 'Dinner', value: meals.filter(m => m.meal_type === 'dinner').reduce((a, b) => a + b.calories, 0) },
                                    { name: 'Snacks', value: meals.filter(m => m.meal_type === 'snack').reduce((a, b) => a + b.calories, 0) },
                                ].filter(d => d.value > 0)}
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {['#D4AF37', '#E5C100', '#F9E27E', '#FCF3CF'].map((color, index) => (
                                    <Cell key={`cell-${index}`} fill={color} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '1rem', color: '#fff' }}
                                itemStyle={{ color: '#fff', fontSize: '10px', fontWeight: 'bold' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-6">
                    {['breakfast', 'lunch', 'dinner', 'snack'].map((type, i) => (
                        <div key={type} className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ['#D4AF37', '#E5C100', '#F9E27E', '#FCF3CF'][i] }} />
                            <span className="text-[10px] font-black uppercase text-slate-400 dark:text-cream/50">{type}</span>
                            <span className="text-[10px] font-black text-slate-900 dark:text-cream ml-auto">
                                {meals.filter(m => m.meal_type === type).reduce((a, b) => a + b.calories, 0)} kcal
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Weekly High</p>
                    <p className="text-2xl font-black text-slate-900 dark:text-cream">{stats.length > 0 ? Math.max(...stats.map(s => s.total_calories)) : 0}</p>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Avg Intake</p>
                    <p className="text-2xl font-black text-slate-900 dark:text-cream">
                        {stats.length > 0 ? Math.round(stats.reduce((a, b) => a + b.total_calories, 0) / stats.length) : 0}
                    </p>
                </div>
            </div>

            {/* Nutrient Profile Section */}
            <div className="bg-slate-900 rounded-[3rem] p-8 text-white shadow-2xl space-y-8">
                <h4 className="font-black text-lg text-cream/90 mb-6 uppercase tracking-widest flex items-center gap-2">
                    <Activity size={18} className="text-emerald-400" /> Nutrient Profile
                </h4>

                <div className="grid grid-cols-3 gap-4">
                    {[
                        { label: 'Protein', value: stats.reduce((a, b) => a + (b.total_protein || 0), 0), color: 'emerald-400' },
                        { label: 'Carbs', value: stats.reduce((a, b) => a + (b.total_carbs || 0), 0), color: 'amber-400' },
                        { label: 'Fats', value: stats.reduce((a, b) => a + (b.total_fats || 0), 0), color: 'rose-400' }
                    ].map((macro) => (
                        <div key={macro.label} className="text-center space-y-1">
                            <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">{macro.label}</p>
                            <p className="text-xl font-black text-white">{Math.round(macro.value / (stats.length || 1))}g</p>
                            <div className="w-12 h-1 bg-white/10 mx-auto rounded-full overflow-hidden">
                                <div className={`h-full bg-${macro.color}`} style={{ width: '60%' }} />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="pt-6 border-t border-white/5">
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-4">Calorie Contribution</p>
                    <div className="flex h-3 w-full rounded-full overflow-hidden bg-white/5">
                        {(() => {
                            const p = stats.reduce((a, b) => a + (b.total_protein || 0), 0) * 4;
                            const c = stats.reduce((a, b) => a + (b.total_carbs || 0), 0) * 4;
                            const f = stats.reduce((a, b) => a + (b.total_fats || 0), 0) * 9;
                            const total = p + c + f || 1;
                            return (
                                <>
                                    <div style={{ width: `${(p / total) * 100}%` }} className="bg-emerald-400" title="Protein" />
                                    <div style={{ width: `${(c / total) * 100}%` }} className="bg-amber-400" title="Carbs" />
                                    <div style={{ width: `${(f / total) * 100}%` }} className="bg-rose-400" title="Fats" />
                                </>
                            );
                        })()}
                    </div>
                    <div className="flex justify-between mt-2">
                        <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400" /><span className="text-[8px] font-black text-white/40 uppercase">Protein</span></div>
                        <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-amber-400" /><span className="text-[8px] font-black text-white/40 uppercase">Carbs</span></div>
                        <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-rose-400" /><span className="text-[8px] font-black text-white/40 uppercase">Fats</span></div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
