"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { Camera, Plus, BarChart3, History, LogOut, Utensils, Flame, User, Target, ChevronRight, Activity, Weight, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AreaChart, Area, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import MealLogger from "@/components/MealLogger";
import InductionFlow from "@/components/InductionFlow";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState<'daily' | 'stats' | 'profile'>('daily');
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

  if (status === "loading") return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <motion.div
        animate={{ scale: [1, 1.1, 1], rotate: [0, 10, -10, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="w-16 h-16 bg-blue-600 rounded-[1.5rem] flex items-center justify-center text-white mb-4 shadow-xl shadow-blue-600/30"
      >
        <Utensils size={32} />
      </motion.div>
      <p className="text-slate-400 font-medium animate-pulse">Initializing your health space...</p>
    </div>
  );

  if (!session) {
    return (
      <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 overflow-x-hidden selection:bg-blue-100 dark:selection:bg-blue-900/30">
        {/* Animated Background Decor */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] aspect-square bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] aspect-square bg-purple-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />

          {/* Floating Premium Elements */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 100 }}
              animate={{
                opacity: [0.1, 0.3, 0.1],
                y: [-20, 20, -20],
                x: [-10, 10, -10],
                scale: [1, 1.1, 1]
              }}
              transition={{
                duration: 5 + i,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute"
              style={{
                top: `${20 + i * 15}%`,
                left: `${10 + (i * 17) % 80}%`,
                color: i % 2 === 0 ? 'rgba(59, 130, 246, 0.5)' : 'rgba(147, 51, 234, 0.5)'
              }}
            >
              {i % 3 === 0 ? <Sparkles size={24 + i * 4} /> : <div className="w-2 h-2 rounded-full bg-current blur-[1px]" />}
            </motion.div>
          ))}
        </div>

        {/* Header/Nav */}
        <nav className="fixed top-0 left-0 right-0 h-20 z-50 flex items-center justify-between px-8 glass dark:glass-dark border-b border-white/20 dark:border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
              <Utensils size={24} />
            </div>
            <span className="text-xl font-black font-display tracking-tight text-slate-900 dark:text-white">My Calories.</span>
          </div>
          <button
            onClick={() => signIn("google")}
            className="px-6 py-2.5 bg-blue-600 text-white font-black text-sm rounded-2xl shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all hover:scale-105 active:scale-95"
          >
            Sign In
          </button>
        </nav>

        {/* Hero Section */}
        <section className="relative pt-44 pb-20 px-8 flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-8 max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-600/10 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4">
              <Sparkles size={12} className="fill-blue-600" />
              Next Gen Nutrition Tracking
            </div>
            <h1 className="text-6xl md:text-8xl font-black font-display tracking-tight text-slate-900 dark:text-white leading-[0.95] md:leading-[0.9]">
              Eat. Snap.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Level Up.</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-500 font-medium max-w-xl mx-auto md:leading-relaxed">
              Ditch the manual logging. Let our Gemini-powered vision engine analyze your meals in real-time.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
            >
              <button
                onClick={() => signIn("google")}
                className="group relative w-full sm:w-auto px-10 py-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black rounded-[2.5rem] shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-4 overflow-hidden"
              >
                <div className="absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-10 dark:group-hover:opacity-5 transition-opacity" />
                <img src="https://www.google.com/favicon.ico" className="w-5 h-5 grayscale-0" alt="Google" />
                Launch Experience
              </button>
              <div className="flex items-center gap-2 px-6 py-4 glass dark:glass-dark rounded-[2rem] border border-white/50 dark:border-white/10 text-slate-400 font-black text-xs uppercase tracking-widest">
                <Activity size={16} className="text-blue-500" />
                Live in IST
              </div>
            </motion.div>
          </motion.div>

          {/* Hero Preview Card */}
          <motion.div
            initial={{ opacity: 0, y: 100, rotateX: 20 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
            style={{ perspective: 2000 }}
            className="w-full max-w-4xl mt-24 relative"
          >
            <div className="absolute inset-0 bg-blue-600/30 blur-[100px] -z-10 opacity-30" />
            <div className="glass dark:glass-dark border border-white/50 dark:border-white/10 rounded-[4rem] p-4 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] dark:shadow-none">
              <div className="bg-[#f8fafc] dark:bg-slate-950 rounded-[3.5rem] overflow-hidden aspect-video relative flex items-center justify-center">
                <div className="absolute inset-0 bg-blue-600/5 dark:bg-blue-600/10" />
                {/* Mock UI Elements */}
                <div className="relative z-10 w-full px-12 space-y-8">
                  <div className="h-12 w-48 bg-slate-200 dark:bg-white/5 rounded-2xl animate-pulse" />
                  <div className="grid grid-cols-3 gap-6">
                    <div className="h-32 bg-slate-100 dark:bg-white/5 rounded-[2rem] animate-pulse" />
                    <div className="h-32 bg-slate-100 dark:bg-white/5 rounded-[2rem] animate-pulse" style={{ animationDelay: '0.2s' }} />
                    <div className="h-32 bg-slate-100 dark:bg-white/5 rounded-[2rem] animate-pulse" style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-24 h-24 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-2xl animate-bounce">
                    <Activity size={40} />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Features Flow */}
        <section className="px-8 py-40 max-w-6xl mx-auto space-y-40">
          {/* Step 1 */}
          <div className="grid md:grid-cols-2 gap-20 items-center">
            <motion.div
              whileInView={{ opacity: 1, x: 0 }}
              initial={{ opacity: 0, x: -50 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="w-16 h-16 bg-blue-600/10 text-blue-600 rounded-3xl flex items-center justify-center font-black text-2xl">01</div>
              <h2 className="text-4xl md:text-5xl font-black font-display tracking-tight text-slate-900 dark:text-white leading-tight">
                Smart Vision. <br />
                No Typing.
              </h2>
              <p className="text-lg text-slate-500 font-medium leading-relaxed">
                Simply take a photo of your meal. Our custom Gemini 2.5 Flash model detects ingredients and portion sizes instantly.
              </p>
              <ul className="space-y-4">
                {['Precision Calorie Estimation', 'Ingredient Breakdown', 'AI Context Processing'].map((f, i) => (
                  <li key={i} className="flex items-center gap-3 font-black text-xs uppercase tracking-widest text-slate-400">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" /> {f}
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div
              whileInView={{ opacity: 1, scale: 1 }}
              initial={{ opacity: 0, scale: 0.9 }}
              viewport={{ once: true }}
              className="aspect-square bg-slate-100 dark:bg-white/5 rounded-[4rem] border border-slate-200 dark:border-white/5 flex items-center justify-center text-slate-300 dark:text-white/10"
            >
              <Camera size={120} strokeWidth={1} />
            </motion.div>
          </div>

          {/* Step 2 */}
          <div className="grid md:grid-cols-2 gap-20 items-center">
            <motion.div
              whileInView={{ opacity: 1, scale: 1 }}
              initial={{ opacity: 0, scale: 0.9 }}
              viewport={{ once: true }}
              className="order-2 md:order-1 aspect-square bg-blue-600 rounded-[4rem] shadow-2xl flex items-center justify-center text-white"
            >
              <Sparkles size={120} strokeWidth={1} />
            </motion.div>
            <motion.div
              whileInView={{ opacity: 1, x: 0 }}
              initial={{ opacity: 0, x: 50 }}
              viewport={{ once: true }}
              className="order-1 md:order-2 space-y-6"
            >
              <div className="w-16 h-16 bg-blue-600/10 text-blue-600 rounded-3xl flex items-center justify-center font-black text-2xl">02</div>
              <h2 className="text-4xl md:text-5xl font-black font-display tracking-tight text-slate-900 dark:text-white leading-tight">
                High-End <br />
                Analytics.
              </h2>
              <p className="text-lg text-slate-500 font-medium leading-relaxed">
                Visualize your health journey with premium AreaCharts, weekly moving averages, and detailed performance metrics.
              </p>
              <button onClick={() => signIn("google")} className="group flex items-center gap-3 font-black text-sm uppercase tracking-widest text-blue-600">
                Explore Analytics <ChevronRight className="group-hover:translate-x-2 transition-transform" />
              </button>
            </motion.div>
          </div>

          {/* Step 3 */}
          <div className="grid md:grid-cols-2 gap-20 items-center">
            <motion.div
              whileInView={{ opacity: 1, x: 0 }}
              initial={{ opacity: 0, x: -50 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="w-16 h-16 bg-blue-600/10 text-blue-600 rounded-3xl flex items-center justify-center font-black text-2xl">03</div>
              <h2 className="text-4xl md:text-5xl font-black font-display tracking-tight text-slate-900 dark:text-white leading-tight">
                Personalized <br />
                Success.
              </h2>
              <p className="text-lg text-slate-500 font-medium leading-relaxed">
                Set goals—Lose, Maintain, or Gain. We calculate your BMR and TDEE using the Mifflin-St Jeor equation for clinical accuracy.
              </p>
              <div className="pt-4 flex gap-4">
                <div className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 p-4 rounded-3xl text-center flex-1">
                  <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Health Goal</p>
                  <p className="font-black text-slate-900 dark:text-white italic">Muscle Build</p>
                </div>
                <div className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 p-4 rounded-3xl text-center flex-1">
                  <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Precision</p>
                  <p className="font-black text-slate-900 dark:text-white italic">100% Calibrated</p>
                </div>
              </div>
            </motion.div>
            <motion.div
              whileInView={{ opacity: 1, scale: 1 }}
              initial={{ opacity: 0, scale: 0.9 }}
              viewport={{ once: true }}
              className="aspect-square bg-slate-900 dark:bg-white rounded-[4rem] flex items-center justify-center text-white dark:text-slate-900"
            >
              <Target size={120} strokeWidth={1} />
            </motion.div>
          </div>
        </section>

        {/* Footer CTA */}
        <section className="px-8 py-32 bg-slate-900 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-blue-600/10" />
          <div className="relative z-10 max-w-2xl mx-auto space-y-10">
            <h2 className="text-5xl md:text-7xl font-black font-display leading-[1.1]">Ready to Start?</h2>
            <p className="text-white/60 font-medium text-lg">Join thousands in the 2026 health revolution. <br />Privacy focused. AI driven. Free to use.</p>
            <button
              onClick={() => signIn("google")}
              className="px-12 py-6 bg-white text-slate-900 font-black rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4 mx-auto"
            >
              Initialize My Tracker →
            </button>
            <div className="pt-10 flex flex-col items-center">
              <a
                href="https://www.linkedin.com/in/imkaadarsh/"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col items-center gap-4 hover:scale-105 transition-all"
              >
                <div className="flex items-center gap-3 px-6 py-3 glass rounded-2xl border border-white/10 group-hover:bg-blue-600/20 transition-all">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                    <Utensils size={18} />
                  </div>
                  <span className="text-white/80 font-black text-xs uppercase tracking-widest">Developed For Need By Aadarsh</span>
                </div>
              </a>
            </div>
          </div>
        </section>
      </div>
    );
  }

  const totalCalories = meals.reduce((acc, m) => acc + m.calories, 0);
  const calorieGoal = userProfile?.daily_calorie_goal || 2500;
  const progress = Math.min((totalCalories / calorieGoal) * 100, 100);

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc] dark:bg-slate-950 pb-32">
      {/* Navbar Upper */}
      <header className="p-6 flex items-center justify-between sticky top-0 z-40 glass dark:glass-dark transition-all">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img src={session.user?.image || ""} className="w-12 h-12 rounded-2xl border-2 border-white/50 shadow-xl" alt="Profile" />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white" />
          </div>
          <div>
            <h2 className="text-slate-900 dark:text-white font-black text-lg font-display">Dashboard</h2>
            <div className="flex items-center gap-1.5">
              <Activity size={12} className="text-green-500" />
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest tracking-[0.2em]">Connected Live</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setNeedsInduction(true)} className="p-3 bg-white dark:bg-white/5 text-slate-600 dark:text-slate-400 rounded-2xl border border-slate-100 dark:border-white/10 hover:bg-slate-50 transition-all">
            <Target size={20} />
          </button>
          <button onClick={() => signOut()} className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-100 transition-all">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pt-4">
        <AnimatePresence mode="wait">
          {activeTab === 'daily' && (
            <motion.div
              key="daily"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="px-6 space-y-10"
            >
              {/* Premium Progress Card */}
              <div className="relative group">
                <div className="absolute inset-0 bg-blue-600 rounded-[3rem] blur-3xl opacity-20 group-hover:opacity-30 transition-opacity" />
                <div className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl">
                  {/* Decorative Elements */}
                  <div className="absolute top-0 right-0 w-40 h-40 bg-blue-600 opacity-20 rounded-full blur-[60px] translate-x-1/2 -translate-y-1/2" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-600 opacity-20 rounded-full blur-[50px] -translate-x-1/2 translate-y-1/2" />

                  <div className="relative z-10 space-y-10">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-white/50 text-xs font-black uppercase tracking-widest mb-2">Current Status</p>
                        <div className="flex items-baseline gap-2">
                          <h2 className="text-7xl font-black font-display leading-none tracking-tighter">{totalCalories}</h2>
                          <span className="text-white/40 font-bold text-xl">kcal</span>
                        </div>
                      </div>
                      <div className="w-16 h-16 bg-white/10 rounded-[1.5rem] border border-white/10 flex items-center justify-center text-blue-400">
                        <Flame size={32} className="animate-pulse" />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between text-xs font-black uppercase tracking-[0.15em] text-white/40">
                        <span>Energy Burn</span>
                        <span>{Math.round(progress)}% of daily</span>
                      </div>
                      <div className="h-4 bg-white/5 rounded-full overflow-hidden p-1 border border-white/5">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 1, ease: "circOut" }}
                          className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.6)]"
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex items-center gap-1.5 border-t border-white/5">
                      <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Optimized Target:</p>
                      <p className="text-white text-[11px] font-black">{calorieGoal} kcal</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Meal List Section */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-slate-900 font-black text-xl font-display">Eaten Today</h3>
                  <div className="px-3 py-1.5 bg-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500">
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
                    meals.map((meal, i) => (
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={i}
                        className="flex gap-5 p-6 bg-white rounded-[2.5rem] items-center border border-slate-100 shadow-sm hover:shadow-xl hover:scale-[1.01] transition-all group"
                      >
                        <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 font-black group-hover:bg-blue-600 group-hover:text-white transition-all">
                          {meal.calories}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-black text-slate-900 truncate leading-none mb-2 text-lg">{meal.food_name}</h4>
                          <p className="text-xs text-slate-400 font-bold tracking-tight line-clamp-2">{meal.description}</p>
                        </div>
                        <div className="bg-slate-50 p-2 rounded-xl group-hover:bg-blue-50 transition-colors">
                          <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-600" />
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'stats' && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="px-6 space-y-8"
            >
              <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
                <div className="relative z-10">
                  <h4 className="font-black text-2xl font-display mb-8 flex items-center gap-3">
                    <BarChart3 className="text-blue-500" /> Performance
                  </h4>

                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={stats}>
                        <defs>
                          <linearGradient id="colorCal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
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
                                <div className="glass-dark p-4 rounded-2xl border-white/10 shadow-2xl">
                                  <p className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-1">Intake</p>
                                  <p className="text-xl font-black text-white">{payload[0].value} <span className="text-sm font-bold text-blue-400">kcal</span></p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Area type="monotone" dataKey="total_calories" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorCal)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 opacity-10 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Weekly High</p>
                  <p className="text-2xl font-black text-slate-900">{stats.length > 0 ? Math.max(...stats.map(s => s.total_calories)) : 0}</p>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Avg Intake</p>
                  <p className="text-2xl font-black text-slate-900">
                    {stats.length > 0 ? Math.round(stats.reduce((a, b) => a + b.total_calories, 0) / stats.length) : 0}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="px-6 space-y-10"
            >
              <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-xl space-y-10">
                <div className="flex flex-col items-center gap-4 border-b border-slate-50 pb-8">
                  <div className="relative">
                    <img src={session.user?.image || ""} className="w-24 h-24 rounded-[2.5rem] border-4 border-[#f8fafc] shadow-2xl" alt="Profile" />
                    <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 rounded-2xl shadow-lg">
                      <Plus size={20} />
                    </div>
                  </div>
                  <div className="text-center">
                    <h2 className="text-2xl font-black text-slate-900 font-display">{session.user?.name}</h2>
                    <p className="text-sm font-bold text-slate-400">{session.user?.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                      <Weight size={12} className="text-blue-500" /> Current Weight
                    </p>
                    <p className="text-2xl font-black text-slate-900">{userProfile?.weight || '--'}<span className="text-sm text-slate-400 ml-1">kg</span></p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                      <Target size={12} className="text-purple-500" /> Target Weight
                    </p>
                    <p className="text-2xl font-black text-slate-900">{userProfile?.target_weight || '--'}<span className="text-sm text-slate-400 ml-1">kg</span></p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                      <Activity size={12} className="text-orange-500" /> Daily Goal
                    </p>
                    <p className="text-2xl font-black text-slate-900">{userProfile?.daily_calorie_goal || '--'}<span className="text-sm text-slate-400 ml-1">kcal</span></p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                      <User size={12} className="text-green-500" /> Height
                    </p>
                    <p className="text-2xl font-black text-slate-900">{userProfile?.height || '--'}<span className="text-sm text-slate-400 ml-1">cm</span></p>
                  </div>
                </div>

                <div className="pt-4">
                  <p className="text-[10px] font-black text-slate-400 mb-4 uppercase tracking-widest">Selected Goal</p>
                  <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white">
                        <Flame size={20} />
                      </div>
                      <p className="font-black text-slate-900 capitalize">{userProfile?.goal || 'Maintain'}</p>
                    </div>
                    <ChevronRight size={20} className="text-slate-300" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Tab Bar Bottom */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto h-24 glass dark:glass-dark border-t border-slate-100 dark:border-white/5 px-10 flex items-center justify-between z-50">
        <button
          onClick={() => setActiveTab('daily')}
          className={`relative p-3 transition-all ${activeTab === 'daily' ? 'text-blue-600' : 'text-slate-400'}`}
        >
          <Utensils size={24} />
          {activeTab === 'daily' && <motion.div layoutId="tab-active" className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full" />}
        </button>

        {/* Integrated Floating Action Button */}
        <div className="relative -top-10">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsLogging(true)}
            className="w-16 h-16 bg-blue-600 text-white rounded-[1.5rem] shadow-[0_20px_40px_rgba(59,130,246,0.4)] flex items-center justify-center transition-all group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-[1.5rem]" />
            <Plus size={32} className="group-hover:rotate-90 transition-transform duration-500" />
          </motion.button>
        </div>

        <button
          onClick={() => setActiveTab('stats')}
          className={`relative p-3 transition-all ${activeTab === 'stats' ? 'text-blue-600' : 'text-slate-400'}`}
        >
          <BarChart3 size={24} />
          {activeTab === 'stats' && <motion.div layoutId="tab-active" className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full" />}
        </button>
      </nav>

      {/* Overlays */}
      <AnimatePresence>
        {isLogging && (
          <MealLogger
            onClose={() => setIsLogging(false)}
            onComplete={fetchMeals}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {needsInduction && (
          <InductionFlow onComplete={handleInductionComplete} />
        )}
      </AnimatePresence>
    </div>
  );
}
