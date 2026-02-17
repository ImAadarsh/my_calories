"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Check, Calculator, Info, Sparkles, Target, Zap } from "lucide-react";

interface Metrics {
    sex: 'male' | 'female';
    age: number;
    height: number;
    weight: number;
    target_weight: number;
    activity_level: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active';
    goal: 'lose' | 'maintain' | 'gain' | 'muscle';
}

export default function InductionFlow({ onComplete }: { onComplete: (calories: number, metrics: Metrics) => void }) {
    const [step, setStep] = useState(1);
    const [metrics, setMetrics] = useState<Metrics>({
        sex: 'male',
        age: 26,
        height: 170,
        weight: 85,
        target_weight: 75,
        activity_level: 'moderately_active',
        goal: 'maintain'
    });

    const totalSteps = 6;

    const calculateCalories = () => {
        let bmr = (10 * metrics.weight) + (6.25 * metrics.height) - (5 * metrics.age);
        if (metrics.sex === 'male') bmr += 5;
        else bmr -= 161;

        const activityMultipliers = {
            sedentary: 1.2,
            lightly_active: 1.375,
            moderately_active: 1.55,
            very_active: 1.725,
            extra_active: 1.9
        };

        const tdee = bmr * activityMultipliers[metrics.activity_level];
        if (metrics.goal === 'lose') return Math.round(tdee - 500);
        if (metrics.goal === 'gain' || metrics.goal === 'muscle') return Math.round(tdee + 500);
        return Math.round(tdee);
    };

    const nextStep = () => {
        if (step < totalSteps) setStep(step + 1);
        else {
            const calories = calculateCalories();
            onComplete(calories, metrics);
        }
    };

    const prevStep = () => {
        if (step > 1) setStep(step - 1);
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-3xl z-50 flex flex-col items-center justify-center p-4">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 dark:from-gold/10 via-transparent to-purple-600/10 dark:to-muted-gold/10" />

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[3rem] p-8 shadow-[0_40px_100px_rgba(0,0,0,0.1)] relative flex flex-col max-h-[90vh] border border-slate-100 dark:border-white/10"
            >
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gold opacity-5 rounded-full blur-[60px] translate-x-1/2 -translate-y-1/2" />

                {/* Progress Bar */}
                <div className="w-full h-1.5 bg-slate-100 dark:bg-white/5 rounded-full mb-6 flex gap-1 p-0.5">
                    {Array.from({ length: totalSteps }).map((_, i) => (
                        <div key={i} className="flex-1 h-full rounded-full overflow-hidden bg-slate-100 dark:bg-white/5">
                            <motion.div
                                initial={false}
                                animate={{ width: i + 1 <= step ? "100%" : "0%" }}
                                className="h-full bg-blue-600 dark:bg-gold"
                            />
                        </div>
                    ))}
                </div>

                <div className="flex-1 relative flex flex-col overflow-y-auto pr-1">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-10 flex-1 flex flex-col"
                        >
                            {step === 1 && (
                                <div className="space-y-8 text-center flex-1 flex flex-col justify-center">
                                    <div className="w-16 h-16 bg-blue-50 dark:bg-gold/10 rounded-2xl overflow-hidden flex items-center justify-center mb-4 mx-auto">
                                        <img src="/logo.png" className="w-full h-full object-cover" alt="Logo" />
                                    </div>
                                    <h2 className="text-2xl font-black font-display tracking-tight text-slate-900 dark:text-cream leading-tight">What is your sex?</h2>
                                    <div className="grid grid-cols-1 gap-3 pt-4">
                                        {['male', 'female'].map((s) => (
                                            <button
                                                key={s}
                                                onClick={() => { setMetrics({ ...metrics, sex: s as any }); nextStep(); }}
                                                className={`py-6 px-6 rounded-2xl border-2 transition-all font-black text-lg flex items-center justify-between group ${metrics.sex === s ? 'border-blue-600 dark:border-gold bg-blue-600 dark:bg-gold text-white dark:text-slate-950 shadow-xl shadow-blue-600/20 dark:shadow-gold/20' : 'border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 text-slate-400 hover:border-slate-200'}`}
                                            >
                                                <span className="capitalize">{s}</span>
                                                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${metrics.sex === s ? 'border-white bg-white/20 dark:border-slate-800' : 'border-slate-200'}`}>
                                                    {metrics.sex === s && <Check size={16} />}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-8 flex-1 flex flex-col justify-center">
                                    <div className="text-center space-y-2 mb-2">
                                        <h2 className="text-2xl font-black font-display tracking-tight text-slate-900 dark:text-cream leading-tight">Personal Profile</h2>
                                        <p className="text-slate-400 dark:text-cream/40 font-bold uppercase tracking-widest text-[10px]">Calculate your BMR</p>
                                    </div>
                                    <div className="space-y-6">
                                        <div className="group">
                                            <div className="flex justify-between items-center mb-2 px-1">
                                                <label className="text-[10px] font-black text-slate-400 dark:text-cream/40 uppercase tracking-[0.2em]">Age (Years)</label>
                                                <span className="text-blue-500 dark:text-gold font-black text-xs">{metrics.age} yr</span>
                                            </div>
                                            <input
                                                type="number"
                                                value={metrics.age}
                                                onChange={(e) => setMetrics({ ...metrics, age: parseInt(e.target.value) })}
                                                className="w-full p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border-2 border-slate-100 dark:border-transparent focus:border-blue-600 dark:focus:border-gold focus:bg-white dark:focus:bg-white/10 outline-none font-black text-xl transition-all dark:text-cream"
                                            />
                                        </div>
                                        <div>
                                            <div className="flex justify-between items-center mb-2 px-1">
                                                <label className="text-[10px] font-black text-slate-400 dark:text-cream/40 uppercase tracking-[0.2em]">Height (cm)</label>
                                                <span className="text-blue-500 dark:text-gold font-black text-xs">{metrics.height} cm</span>
                                            </div>
                                            <input
                                                type="number"
                                                value={metrics.height}
                                                onChange={(e) => setMetrics({ ...metrics, height: parseInt(e.target.value) })}
                                                className="w-full p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border-2 border-slate-100 dark:border-transparent focus:border-blue-600 dark:focus:border-gold focus:bg-white dark:focus:bg-white/10 outline-none font-black text-xl transition-all dark:text-cream"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="space-y-8 flex-1 flex flex-col justify-center text-center">
                                    <div className="space-y-2">
                                        <h2 className="text-2xl font-black font-display tracking-tight text-slate-900 dark:text-cream leading-tight">Current Weight</h2>
                                        <p className="text-slate-400 dark:text-cream/40 text-sm font-medium">Your starting point today.</p>
                                    </div>
                                    <div className="relative pt-6">
                                        <div className="absolute inset-0 bg-gold/5 blur-[50px] rounded-full" />
                                        <input
                                            type="number"
                                            value={metrics.weight}
                                            onChange={(e) => setMetrics({ ...metrics, weight: parseFloat(e.target.value) })}
                                            className="w-full p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-slate-100 dark:border-white/10 focus:border-blue-600 dark:focus:border-gold outline-none font-black text-5xl text-center relative z-10 shadow-2xl transition-all dark:text-cream"
                                        />
                                        <span className="absolute right-8 top-1/2 translate-y-2 font-black text-slate-200 dark:text-cream/10 text-xl z-20">kg</span>
                                    </div>
                                </div>
                            )}

                            {step === 4 && (
                                <div className="space-y-8 flex-1">
                                    <h2 className="text-2xl font-black font-display text-slate-900 dark:text-cream leading-tight">Activity Level</h2>
                                    <div className="space-y-3">
                                        {[
                                            { id: 'sedentary', label: 'Sedentary', desc: 'Minimal movement' },
                                            { id: 'lightly_active', label: 'Light', desc: '1-3 days exercise' },
                                            { id: 'moderately_active', label: 'Moderate', desc: '3-5 days workout' },
                                            { id: 'very_active', label: 'Very Active', desc: '6-7 days extreme' }
                                        ].map((act) => (
                                            <button
                                                key={act.id}
                                                onClick={() => { setMetrics({ ...metrics, activity_level: act.id as any }); nextStep(); }}
                                                className={`w-full p-5 rounded-2xl border-2 text-left transition-all relative overflow-hidden group ${metrics.activity_level === act.id ? 'border-blue-600 dark:border-gold bg-blue-50 dark:bg-gold/10' : 'border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5'}`}
                                            >
                                                <div className="relative z-10 flex justify-between items-center">
                                                    <div>
                                                        <p className={`font-black text-lg transition-colors ${metrics.activity_level === act.id ? 'text-blue-600 dark:text-gold' : 'text-slate-900 dark:text-cream'}`}>{act.label}</p>
                                                        <p className="text-xs text-slate-400 dark:text-cream/40 font-bold">{act.desc}</p>
                                                    </div>
                                                    {metrics.activity_level === act.id && <Zap size={20} className="text-blue-600 dark:text-gold fill-blue-600 dark:fill-gold" />}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {step === 5 && (
                                <div className="space-y-8 flex-1">
                                    <h2 className="text-2xl font-black font-display text-slate-900 dark:text-cream">What's the goal?</h2>
                                    <div className="grid grid-cols-2 gap-4">
                                        {[
                                            { id: 'lose', label: 'Lose', icon: '📉' },
                                            { id: 'maintain', label: 'Maintain', icon: '👀' },
                                            { id: 'gain', label: 'Gain', icon: '📈' },
                                            { id: 'muscle', label: 'Muscle', icon: '💪' }
                                        ].map((g) => (
                                            <button
                                                key={g.id}
                                                onClick={() => { setMetrics({ ...metrics, goal: g.id as any }); nextStep(); }}
                                                className={`p-6 rounded-[2rem] border-2 text-center flex flex-col items-center gap-2 transition-all ${metrics.goal === g.id ? 'border-blue-600 dark:border-gold bg-blue-50 dark:bg-gold/10' : 'border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5'}`}
                                            >
                                                <span className="text-3xl grayscale group-hover:grayscale-0 transition-all">{g.icon}</span>
                                                <p className={`font-black uppercase tracking-widest text-[9px] ${metrics.goal === g.id ? 'text-blue-600 dark:text-gold' : 'text-slate-400 dark:text-cream/40'}`}>{g.label}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {step === 6 && (
                                <div className="space-y-10 flex-1 flex flex-col justify-center">
                                    <div className="text-center">
                                        <h2 className="text-2xl font-black font-display text-slate-900 dark:text-cream leading-tight">Your Master Plan</h2>
                                    </div>
                                    <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white text-center space-y-2 relative overflow-hidden shadow-2xl border border-white/5">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-gold opacity-20 rounded-full blur-[60px]" />
                                        <p className="text-gold font-black uppercase tracking-[0.2em] text-[10px]">Optimal Daily Intake</p>
                                        <div className="flex items-baseline justify-center gap-2">
                                            <h3 className="text-6xl font-black font-display tracking-tighter text-cream">{calculateCalories()}</h3>
                                            <span className="text-cream/30 font-bold text-lg uppercase italic">kcal</span>
                                        </div>
                                        <p className="text-cream/40 text-xs font-medium px-4 leading-relaxed">
                                            Customized logic based on Mifflin-St Jeor & {metrics.goal} goal.
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center px-1">
                                            <label className="text-[10px] font-black text-slate-400 dark:text-cream/40 uppercase tracking-widest">Target Weight (kg)</label>
                                            <Target size={14} className="text-blue-500 dark:text-gold" />
                                        </div>
                                        <input
                                            type="number"
                                            value={metrics.target_weight}
                                            onChange={(e) => setMetrics({ ...metrics, target_weight: parseFloat(e.target.value) })}
                                            className="w-full p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border-2 border-slate-100 dark:border-transparent focus:border-blue-600 dark:focus:border-gold outline-none font-black text-xl transition-all dark:text-cream"
                                        />
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Footer Navigation */}
                <div className="pt-6 flex gap-3 relative z-10">
                    {step > 1 && (
                        <button
                            onClick={prevStep}
                            className="p-4 bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-cream rounded-2xl hover:bg-slate-200 dark:hover:bg-white/10 transition-all border border-slate-100 dark:border-white/5"
                        >
                            <ChevronLeft size={20} />
                        </button>
                    )}
                    <button
                        onClick={nextStep}
                        className="flex-1 py-4 bg-blue-600 dark:bg-gold text-white dark:text-slate-950 font-black rounded-2xl shadow-xl shadow-blue-600/30 dark:shadow-gold/30 hover:bg-blue-700 dark:hover:bg-gold/90 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-base"
                    >
                        {step === totalSteps ? 'Activate Profile' : 'Next Step'} <ChevronRight size={20} />
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
