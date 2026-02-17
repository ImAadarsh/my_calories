"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function ThemeToggle() {
    const { theme, setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="p-2.5 w-10 h-10 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10" />
        );
    }

    const isDark = resolvedTheme === "dark";

    return (
        <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="p-2.5 bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-400 rounded-2xl border border-slate-100 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 transition-all relative overflow-hidden group"
            aria-label="Toggle theme"
        >
            <AnimatePresence mode="wait" initial={false}>
                <motion.div
                    key={isDark ? "dark" : "light"}
                    initial={{ y: 20, opacity: 0, rotate: -45 }}
                    animate={{ y: 0, opacity: 1, rotate: 0 }}
                    exit={{ y: -20, opacity: 0, rotate: 45 }}
                    transition={{ duration: 0.2, ease: "circOut" }}
                    className="flex items-center justify-center"
                >
                    {isDark ? (
                        <Moon size={18} className="text-blue-400" />
                    ) : (
                        <Sun size={18} className="text-orange-500" />
                    )}
                </motion.div>
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
    );
}
