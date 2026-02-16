"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { Camera, Plus, BarChart3, History, LogOut, Utensils, Flame } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import MealLogger from "@/components/MealLogger";
import InductionFlow from "@/components/InductionFlow";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState<'daily' | 'stats'>('daily');
  const [meals, setMeals] = useState<any[]>([]);
  const [isLogging, setIsLogging] = useState(false);
  const [stats, setStats] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [needsInduction, setNeedsInduction] = useState(false);

  useEffect(() => {
    if (session) {
      fetchUserProfile();
      fetchMeals();
      fetchStats();
    }
  }, [session]);

  const fetchUserProfile = async () => {
    const res = await fetch('/api/user');
    if (res.ok) {
      const data = await res.json();
      setUserProfile(data);
      if (!data?.daily_calorie_goal) {
        setNeedsInduction(true);
      }
    }
  };

  const handleInductionComplete = async (calories: number, metrics: any) => {
    try {
      const res = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...metrics, daily_calorie_goal: calories })
      });
      if (res.ok) {
        setNeedsInduction(false);
        fetchUserProfile();
        fetchMeals();
        fetchStats();
      }
    } catch (e) {
      console.error("Failed to save induction data", e);
    }
  };

  const fetchStats = async () => {
    const res = await fetch('/api/stats');
    if (res.ok) {
      const data = await res.json();
      setStats(data);
    }
  };

  const fetchMeals = async () => {
    const res = await fetch('/api/meals');
    if (res.ok) {
      const data = await res.json();
      setMeals(data);
    }
  };

  if (status === "loading") return <div className="p-12 text-center text-slate-400">Loading your profile...</div>;

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center space-y-8">
        <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary">
          <Utensils size={40} />
        </div>
        <h1 className="text-4xl font-black tracking-tight">AI Calorie Tracker</h1>
        <p className="text-slate-500">Log your meals simply by taking a photo. Powered by Gemini AI.</p>
        <button
          onClick={() => signIn("google")}
          className="w-full py-4 px-8 bg-blue-600 text-white font-bold rounded-2xl shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-3"
        >
          <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
          Continue with Google
        </button>
      </div>
    );
  }

  const totalCalories = meals.reduce((acc, m) => acc + m.calories, 0);

  return (
    <div className="flex flex-col min-h-screen bg-white pb-24">
      {/* Header */}
      <header className="p-6 flex items-center justify-between border-b bg-white sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <img src={session.user?.image || ""} className="w-10 h-10 rounded-full border shadow-sm" alt="Profile" />
          <div>
            <p className="text-xs text-slate-500 font-medium">Welcome back,</p>
            <p className="text-sm font-bold">{session.user?.name}</p>
          </div>
        </div>
        <button onClick={() => signOut()} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
          <LogOut size={20} />
        </button>
      </header>

      {/* Hero Stats Card */}
      <section className="p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl"
        >
          <div className="relative z-10">
            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-2">Today's Intake</p>
            <div className="flex items-end gap-3 mb-6">
              <h2 className="text-6xl font-black">{totalCalories}</h2>
              <p className="text-slate-400 font-bold mb-2">kcal</p>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((totalCalories / (userProfile?.daily_calorie_goal || 2500)) * 100, 100)}%` }}
                className="h-full bg-blue-500 rounded-full"
              />
            </div>
            <p className="text-xs text-slate-500 font-medium">Daily Target: {userProfile?.daily_calorie_goal || 2500} kcal</p>
          </div>
          <Flame size={120} className="absolute -bottom-10 -right-10 text-white/5 rotate-12" />
        </motion.div>
      </section>

      {/* Induction Flow Overlay */}
      <AnimatePresence>
        {needsInduction && (
          <InductionFlow onComplete={handleInductionComplete} />
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="px-6 flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('daily')}
          className={`flex-1 py-3 font-bold rounded-2xl transition-all ${activeTab === 'daily' ? 'bg-slate-100 text-slate-900' : 'text-slate-400'}`}
        >
          Daily Meals
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`flex-1 py-3 font-bold rounded-2xl transition-all ${activeTab === 'stats' ? 'bg-slate-100 text-slate-900' : 'text-slate-400'}`}
        >
          Analytics
        </button>
      </div>

      {/* Content */}
      <div className="px-6 flex-1">
        <AnimatePresence mode="wait">
          {activeTab === 'daily' ? (
            <motion.div
              key="daily"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              {meals.length === 0 ? (
                <div className="py-20 text-center space-y-4">
                  <History size={40} className="mx-auto text-slate-200" />
                  <p className="text-slate-400 font-medium">No meals logged today yet.</p>
                </div>
              ) : (
                meals.map((meal, i) => (
                  <div key={i} className="flex gap-4 p-4 bg-slate-50 rounded-3xl items-center">
                    <div className="w-16 h-16 bg-white rounded-2xl border shadow-sm flex items-center justify-center font-bold text-primary">
                      {meal.image_url ? <img src={meal.image_url} className="w-full h-full object-cover rounded-2xl" /> : '🍽️'}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-900">{meal.food_name}</h4>
                      <p className="text-xs text-slate-500 line-clamp-1">{meal.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-slate-900">{meal.calories}</p>
                      <p className="text-[10px] font-bold text-slate-400">kcal</p>
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          ) : (
            <motion.div
              key="stats"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="bg-slate-50 p-6 rounded-[2.5rem]">
                <h4 className="font-bold mb-4 flex items-center gap-2"><BarChart3 size={18} /> Weekly Trend</h4>
                <div className="h-64 w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="date" hide={false} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                      <YAxis hide axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        cursor={{ fill: 'transparent' }}
                      />
                      <Bar dataKey="total_calories" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => setIsLogging(true)}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 w-16 h-16 bg-blue-600 text-white rounded-full shadow-2xl shadow-blue-600/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-30"
      >
        <Plus size={32} />
      </button>

      {/* Logger Overlay */}
      <AnimatePresence>
        {isLogging && (
          <MealLogger
            onClose={() => setIsLogging(false)}
            onComplete={fetchMeals}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
