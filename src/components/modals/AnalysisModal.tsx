"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Info, ChevronRight } from "lucide-react";

interface AnalysisModalProps {
    isOpen: boolean;
    onClose: () => void;
    dailyReport: any;
    isSavingReport: boolean;
    onSaveReport: (feeling: string) => void;
    selectedFeeling: string | null;
}

export function AnalysisModal({
    isOpen,
    onClose,
    dailyReport,
    isSavingReport,
    onSaveReport,
    selectedFeeling
}: AnalysisModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
                    onClick={() => !isSavingReport && onClose()}
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        className="w-full max-w-lg bg-white dark:bg-slate-950 rounded-[3rem] p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2 bg-slate-100 dark:bg-white/5 rounded-full hover:bg-slate-200 transition-all text-slate-500"
                        >
                            <X size={20} />
                        </button>

                        <div className="space-y-8">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-blue-600/10 dark:bg-gold/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <Sparkles className="text-blue-600 dark:text-gold" size={32} />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-cream font-display">Daily Intelligence</h3>
                                <p className="text-slate-400 dark:text-cream/40 text-xs font-bold uppercase tracking-widest mt-1">AI report</p>
                            </div>

                            {!dailyReport ? (
                                <div className="space-y-8 py-4">
                                    <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-2xl border border-amber-100 dark:border-amber-900/30 flex items-start gap-3">
                                        <div className="w-5 h-5 bg-amber-100 dark:bg-amber-900/40 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                                            <Info className="text-amber-600" size={14} />
                                        </div>
                                        <p className="text-amber-800 dark:text-amber-200 text-xs font-bold leading-relaxed">
                                            Generate this report after your last meal, as it can only be generated once for today.
                                        </p>
                                    </div>

                                    <div className="text-center space-y-4">
                                        <p className="text-slate-600 dark:text-slate-400 font-medium">How are you feeling about your nutrition today?</p>
                                        <div className="grid grid-cols-3 gap-3">
                                            {[
                                                { emoji: "🤩", label: "Proud" },
                                                { emoji: "😊", label: "Energetic" },
                                                { emoji: "⚖️", label: "Balanced" },
                                                { emoji: "🥦", label: "Healthy" },
                                                { emoji: "😌", label: "Relieved" },
                                                { emoji: "🤔", label: "Mindful" },
                                                { emoji: "😴", label: "Tired" },
                                                { emoji: "🥵", label: "Full" },
                                                { emoji: "🍕", label: "Indulgent" }
                                            ].map((f) => (
                                                <button
                                                    key={f.label}
                                                    onClick={() => onSaveReport(f.label)}
                                                    disabled={isSavingReport}
                                                    className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl hover:bg-blue-600 dark:hover:bg-gold hover:text-white dark:hover:text-slate-950 transition-all flex flex-col items-center gap-1 group"
                                                >
                                                    <span className="text-2xl group-hover:scale-125 transition-transform">{f.emoji}</span>
                                                    <span className="text-[10px] font-black uppercase tracking-tighter text-slate-500 dark:text-slate-400 group-hover:text-white/80">{f.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    {isSavingReport && (
                                        <div className="flex flex-col items-center gap-4 py-8">
                                            <div className="w-12 h-12 border-4 border-blue-600/20 dark:border-gold/20 border-t-blue-600 dark:border-t-gold rounded-full animate-spin" />
                                            <p className="font-black text-slate-900 dark:text-cream animate-pulse">Consulting AI Dietitian...</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                    <div className="p-6 bg-slate-900 rounded-[2rem] text-white border border-white/5 overflow-hidden relative shadow-2xl">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-gold opacity-20 rounded-full blur-[60px]" />
                                        <p className="text-gold text-[10px] font-black uppercase tracking-[0.2em] mb-3 relative z-10">AI Synthesis</p>
                                        <p className="text-lg font-bold leading-relaxed relative z-10 text-cream">{dailyReport.summary}</p>
                                    </div>

                                    <div className="overflow-hidden rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-sm overflow-x-auto">
                                        <table className="w-full text-left border-collapse min-w-[300px]">
                                            <thead>
                                                <tr className="bg-slate-50 dark:bg-white/5">
                                                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Nutrient</th>
                                                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Intake</th>
                                                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Target</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                                {dailyReport.table?.map((row: any, i: number) => (
                                                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                                        <td className="px-4 py-4 font-bold text-slate-900 dark:text-cream text-sm">{row.nutrient}</td>
                                                        <td className="px-4 py-4 text-right whitespace-nowrap">
                                                            <span className="text-blue-600 dark:text-gold font-black text-sm">{row.intake}</span>
                                                            <span className="text-[10px] text-slate-400 dark:text-cream/30 ml-1">{row.unit}</span>
                                                        </td>
                                                        <td className="px-4 py-4 text-right text-slate-400 dark:text-cream/30 text-xs font-bold whitespace-nowrap">{row.target} {row.unit}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="grid grid-cols-1 gap-3">
                                        {dailyReport.metrics?.map((m: any, i: number) => (
                                            <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 dark:text-cream/40 uppercase tracking-widest">{m.label}</p>
                                                    <p className="text-sm font-black text-slate-900 dark:text-cream">{m.value}</p>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${m.status === 'Positive' || m.status === 'Good' || m.status === 'Optimized'
                                                    ? 'bg-green-100 dark:bg-gold/20 text-green-600 dark:text-gold'
                                                    : 'bg-orange-100 dark:bg-gold/10 text-orange-600 dark:text-gold/80'
                                                    }`}>
                                                    {m.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="p-6 bg-blue-50 dark:bg-gold/10 rounded-[2rem] border-2 border-blue-600/10 dark:border-gold/10">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-5 h-5 bg-blue-100 dark:bg-gold/20 rounded-lg flex items-center justify-center shrink-0">
                                                <Info size={14} className="text-blue-600 dark:text-gold" />
                                            </div>
                                            <p className="text-blue-600 dark:text-gold text-[10px] font-black uppercase tracking-widest">Actionable Advice</p>
                                        </div>
                                        <p className="text-slate-700 dark:text-cream font-bold text-sm leading-relaxed">{dailyReport.advice}</p>
                                    </div>

                                    {selectedFeeling && (
                                        <div className="flex items-center justify-center gap-3 py-4 border-t border-slate-100 dark:border-white/5">
                                            <p className="text-slate-400 dark:text-cream/40 text-[10px] font-black uppercase tracking-widest">You felt:</p>
                                            <span className="px-4 py-2 bg-blue-600 dark:bg-gold text-white dark:text-slate-950 rounded-full text-xs font-black shadow-lg shadow-blue-600/20 dark:shadow-gold/20">{selectedFeeling}</span>
                                        </div>
                                    )}

                                    <button
                                        onClick={onClose}
                                        className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95"
                                    >
                                        Close Report
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
