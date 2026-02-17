"use client";

import { LogOut, Target } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { signOut } from "next-auth/react";

interface HeaderProps {
    user: {
        name?: string | null;
        image?: string | null;
    };
    onProfileClick: () => void;
    onInductionClick: () => void;
    showInductionButton: boolean;
}

export function Header({ user, onProfileClick, onInductionClick, showInductionButton }: HeaderProps) {
    return (
        <header className="py-1.5 px-6 flex items-center justify-between sticky top-0 z-40 bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-white/5 transition-all">
            <div className="flex items-center gap-4">
                <button
                    onClick={onProfileClick}
                    className="relative cursor-pointer hover:scale-105 transition-transform active:scale-95"
                >
                    <img
                        src={user?.image || ""}
                        className="w-10 h-10 rounded-2xl border-2 border-slate-100 dark:border-white/10 shadow-sm"
                        alt="Profile"
                    />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-slate-950" />
                </button>
                <div>
                    <h2 className="text-slate-900 dark:text-cream font-black text-base font-display leading-tight">
                        Hey, {user?.name?.split(' ')[0]}!
                    </h2>
                </div>
            </div>
            <div className="flex gap-2 items-center">
                <ThemeToggle />
                {showInductionButton && (
                    <button
                        onClick={onInductionClick}
                        className="p-2.5 bg-white dark:bg-white/5 text-slate-600 dark:text-slate-400 rounded-2xl border border-slate-100 dark:border-white/10 hover:bg-slate-50 transition-all"
                    >
                        <Target size={18} />
                    </button>
                )}
                <button
                    onClick={() => signOut()}
                    className="p-2.5 bg-red-50 text-red-500 rounded-2xl hover:bg-red-100 transition-all"
                >
                    <LogOut size={18} />
                </button>
            </div>
        </header>
    );
}
