"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Check, Calculator, Info } from "lucide-react";

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
        // Mifflin-St Jeor Equation
        let bmr = (10 * metrics.weight) + (6.25 * metrics.height) - (5 * metrics.age);
        if (metrics.sex === 'male') {
            bmr += 5;
        } else {
            bmr -= 161;
        }

        const activityMultipliers = {
            sedentary: 1.2,
            lightly_active: 1.375,
            moderately_active: 1.55,
            very_active: 1.725,
            extra_active: 1.9
        };

        const tdee = bmr * activityMultipliers[metrics.activity_level];

        // Adjust based on goal
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
        <div className="fixed inset-0 bg-white z-50 flex flex-col p-8">
            {/* Progress Bar */}
            <div className="w-full h-1 bg-slate-100 rounded-full mb-12">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(step / totalSteps) * 100}%` }}
                    className="h-full bg-blue-600 rounded-full"
                />
            </div>

            <div className="flex-1 overflow-y-auto">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-8"
                    >
                        {step === 1 && (
                            <div className="space-y-6">
                                <h2 className="text-3xl font-black">What is your sex?</h2>
                                <div className="grid grid-cols-2 gap-4">
                                    {['male', 'female'].map((s) => (
                                        <button
                                            key={s}
                                            onClick={() => { setMetrics({ ...metrics, sex: s as any }); nextStep(); }}
                                            className={`py-8 rounded-3xl border-2 transition-all font-bold capitalize ${metrics.sex === s ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 hover:border-slate-200'}`}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-6">
                                <h2 className="text-3xl font-black">Tell us about you.</h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Age (Years)</label>
                                        <input
                                            type="number"
                                            value={metrics.age}
                                            onChange={(e) => setMetrics({ ...metrics, age: parseInt(e.target.value) })}
                                            className="w-full p-6 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-blue-600 focus:bg-white outline-none font-bold text-xl"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Height (cm)</label>
                                        <input
                                            type="number"
                                            value={metrics.height}
                                            onChange={(e) => setMetrics({ ...metrics, height: parseInt(e.target.value) })}
                                            className="w-full p-6 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-blue-600 focus:bg-white outline-none font-bold text-xl"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-6">
                                <h2 className="text-3xl font-black">Current Weight.</h2>
                                <p className="text-slate-500">It's okay to guess. You can always adjust this later.</p>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={metrics.weight}
                                        onChange={(e) => setMetrics({ ...metrics, weight: parseFloat(e.target.value) })}
                                        className="w-full p-8 bg-slate-50 rounded-[2.5rem] border-2 border-transparent focus:border-blue-600 focus:bg-white outline-none font-black text-5xl text-center"
                                    />
                                    <span className="absolute right-8 top-1/2 -translate-y-1/2 font-bold text-slate-300">kg</span>
                                </div>
                            </div>
                        )}

                        {step === 4 && (
                            <div className="space-y-6">
                                <h2 className="text-3xl font-black">Daily Activity.</h2>
                                <div className="space-y-3">
                                    {[
                                        { id: 'sedentary', label: 'Sedentary', desc: 'Little or no exercise' },
                                        { id: 'lightly_active', label: 'Lightly Active', desc: '1-3 days / week' },
                                        { id: 'moderately_active', label: 'Moderately Active', desc: '3-5 days / week' },
                                        { id: 'very_active', label: 'Very Active', desc: '6-7 days / week' },
                                        { id: 'extra_active', label: 'Extra Active', desc: 'Professional athlete' }
                                    ].map((act) => (
                                        <button
                                            key={act.id}
                                            onClick={() => { setMetrics({ ...metrics, activity_level: act.id as any }); nextStep(); }}
                                            className={`w-full p-6 rounded-2xl border-2 text-left transition-all ${metrics.activity_level === act.id ? 'border-blue-600 bg-blue-50' : 'border-slate-100'}`}
                                        >
                                            <p className="font-bold text-lg">{act.label}</p>
                                            <p className="text-sm text-slate-500">{act.desc}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {step === 5 && (
                            <div className="space-y-6">
                                <h2 className="text-3xl font-black">What’s your main goal?</h2>
                                <div className="space-y-3">
                                    {[
                                        { id: 'lose', label: 'Lose weight', icon: '📉' },
                                        { id: 'maintain', label: 'Maintain weight', icon: '👀' },
                                        { id: 'gain', label: 'Gain weight', icon: '📈' },
                                        { id: 'muscle', label: 'Build muscle', icon: '💪' }
                                    ].map((g) => (
                                        <button
                                            key={g.id}
                                            onClick={() => { setMetrics({ ...metrics, goal: g.id as any }); nextStep(); }}
                                            className={`w-full p-6 rounded-2xl border-2 text-left flex items-center gap-4 transition-all ${metrics.goal === g.id ? 'border-blue-600 bg-blue-50' : 'border-slate-100'}`}
                                        >
                                            <span className="text-2xl">{g.icon}</span>
                                            <p className="font-bold text-lg">{g.label}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {step === 6 && (
                            <div className="space-y-8">
                                <h2 className="text-3xl font-black text-center">Your personalized plan.</h2>
                                <div className="bg-slate-900 p-8 rounded-[3rem] text-white text-center space-y-4">
                                    <Calculator size={48} className="mx-auto text-blue-500 mb-4" />
                                    <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Target Daily Intake</p>
                                    <h3 className="text-6xl font-black">{calculateCalories()} <span className="text-2xl text-slate-500">kcal</span></h3>
                                    <p className="text-slate-500 leading-relaxed px-4 text-sm mt-4">
                                        Based on your Mifflin-St Jeor calculation, staying within this range will help you {metrics.goal} sustainably.
                                    </p>
                                </div>

                                <div className="bg-blue-50 p-6 rounded-3xl flex items-start gap-4">
                                    <Info className="text-blue-600 shrink-0" size={24} />
                                    <p className="text-blue-900 text-sm">
                                        Goal Weight: <strong>{metrics.target_weight}kg</strong>. We'll track your progress weekly.
                                    </p>
                                </div>

                                {metrics.goal === 'lose' && (
                                    <div className="space-y-4">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Target Weight (kg)</label>
                                        <input
                                            type="number"
                                            value={metrics.target_weight}
                                            onChange={(e) => setMetrics({ ...metrics, target_weight: parseFloat(e.target.value) })}
                                            className="w-full p-6 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-blue-600 outline-none font-bold text-xl"
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Navigation */}
            <div className="pt-8 flex gap-4">
                {step > 1 && (
                    <button
                        onClick={prevStep}
                        className="p-6 bg-slate-100 text-slate-600 rounded-2xl hover:bg-slate-200 transition-all"
                    >
                        <ChevronLeft size={24} />
                    </button>
                )}
                <button
                    onClick={nextStep}
                    className="flex-1 py-6 bg-blue-600 text-white font-bold rounded-2xl shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                >
                    {step === totalSteps ? 'Finish Profile' : 'Continue'} <ChevronRight size={20} />
                </button>
            </div>
        </div>
    );
}
