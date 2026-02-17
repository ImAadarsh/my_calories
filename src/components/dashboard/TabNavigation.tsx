"use client";

import { motion } from "framer-motion";
import { Plus, Utensils, BarChart3, History } from "lucide-react";

interface TabNavigationProps {
    activeTab: 'daily' | 'stats' | 'reports' | 'profile';
    onTabChange: (tab: 'daily' | 'stats' | 'reports' | 'profile') => void;
    setIsLogging: (isLogging: boolean) => void;
}

export function TabNavigation({ activeTab, onTabChange, setIsLogging }: TabNavigationProps) {
    return (
        <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto h-[70px] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-100 dark:border-white/5 px-6 flex items-center justify-between z-50 pb-2">
            <button
                onClick={() => setIsLogging(true)}
                className="relative flex flex-col items-center gap-1.5 group"
            >
                <div className="w-11 h-11 bg-blue-600 dark:bg-gold text-white dark:text-slate-950 rounded-2xl shadow-lg shadow-blue-600/30 dark:shadow-gold/30 flex items-center justify-center group-hover:scale-110 group-active:scale-95 transition-all">
                    <Plus size={22} className="group-hover:rotate-90 transition-transform duration-500" />
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest text-blue-600/60 dark:text-gold/60 group-hover:text-blue-600 dark:group-hover:text-gold transition-colors">Add</span>
            </button>

            <button
                onClick={() => onTabChange('daily')}
                className={`relative flex flex-col items-center gap-1.5 px-4 py-2 rounded-2xl transition-all ${activeTab === 'daily' ? 'text-indigo-600 dark:text-gold bg-indigo-50 dark:bg-gold/10' : 'text-slate-400 dark:text-cream/40'}`}
            >
                <Utensils size={20} className={activeTab === 'daily' ? 'drop-shadow-[0_0_8px_rgba(79,70,229,0.5)] dark:drop-shadow-[0_0_8px_rgba(212,175,55,0.5)]' : ''} />
                <span className="text-[9px] font-black uppercase tracking-widest">Home</span>
                {activeTab === 'daily' && <motion.div layoutId="tab-active" className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-indigo-600 dark:bg-gold rounded-full shadow-[0_0_10px_rgba(79,70,229,0.5)] dark:shadow-[0_0_10px_rgba(212,175,55,0.5)]" />}
            </button>

            <button
                onClick={() => onTabChange('stats')}
                className={`relative flex flex-col items-center gap-1.5 px-4 py-2 rounded-2xl transition-all ${activeTab === 'stats' ? 'text-emerald-600 dark:text-gold bg-emerald-50 dark:bg-gold/10' : 'text-slate-400 dark:text-cream/40'}`}
            >
                <BarChart3 size={20} className={activeTab === 'stats' ? 'drop-shadow-[0_0_8px_rgba(16,185,129,0.5)] dark:drop-shadow-[0_0_8px_rgba(212,175,55,0.5)]' : ''} />
                <span className="text-[9px] font-black uppercase tracking-widest">Stats</span>
                {activeTab === 'stats' && <motion.div layoutId="tab-active" className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-emerald-600 dark:bg-gold rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)] dark:shadow-[0_0_10px_rgba(212,175,55,0.5)]" />}
            </button>

            <button
                onClick={() => onTabChange('reports')}
                className={`relative flex flex-col items-center gap-1.5 px-4 py-2 rounded-2xl transition-all ${activeTab === 'reports' ? 'text-purple-600 dark:text-gold bg-purple-50 dark:bg-gold/10' : 'text-slate-400 dark:text-cream/40'}`}
            >
                <History size={20} className={activeTab === 'reports' ? 'drop-shadow-[0_0_8px_rgba(168,85,247,0.5)] dark:drop-shadow-[0_0_8px_rgba(212,175,55,0.5)]' : ''} />
                <span className="text-[9px] font-black uppercase tracking-widest">Reports</span>
                {activeTab === 'reports' && <motion.div layoutId="tab-active" className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-purple-600 dark:bg-gold rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)] dark:shadow-[0_0_10px_rgba(212,175,55,0.5)]" />}
            </button>
        </nav>
    );
}
