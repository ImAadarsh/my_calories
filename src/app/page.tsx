"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { Camera, Plus, BarChart3, History, LogOut, Utensils, Flame, User, Target, ChevronRight, Activity, Weight, Sparkles, Trash2, Edit, Save, X, Info } from "lucide-react";
import { useScroll, useTransform, useMotionValue, motion, AnimatePresence } from "framer-motion";
import { AreaChart, Area, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell, PieChart, Pie } from 'recharts';
import { useRef } from "react";
import MealLogger from "@/components/MealLogger";
import InductionFlow from "@/components/InductionFlow";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState<'daily' | 'stats' | 'reports' | 'profile'>('daily');
  const [meals, setMeals] = useState<any[]>([]);
  const [isLogging, setIsLogging] = useState(false);
  const [stats, setStats] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [needsInduction, setNeedsInduction] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollY = useMotionValue(0);

  const summaryScale = useTransform(scrollY, [0, 200], [1, 0.85]);
  const summaryOpacity = useTransform(scrollY, [0, 200], [1, 0.8]);
  const summaryY = useTransform(scrollY, [0, 200], [0, -20]);
  const [isEditingMeal, setIsEditingMeal] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedMeal, setEditedMeal] = useState<any>(null);
  const [subtractionMealId, setSubtractionMealId] = useState<number | null>(null);
  const [editedProfile, setEditedProfile] = useState<any>(null);
  const [isAnalyzingDay, setIsAnalyzingDay] = useState(false);
  const [dailyReport, setDailyReport] = useState<any>(null);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [selectedFeeling, setSelectedFeeling] = useState<string | null>(null);
  const [isSavingReport, setIsSavingReport] = useState(false);
  const [cumulativeData, setCumulativeData] = useState<any>(null);
  const [selectedRange, setSelectedRange] = useState<'daily' | 'weekly' | 'custom'>('weekly');
  const [customRange, setCustomRange] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [isFetchingCumulative, setIsFetchingCumulative] = useState(false);
  const [historicalReport, setHistoricalReport] = useState<any>(null);
  const [historicalDate, setHistoricalDate] = useState(new Date().toISOString().split('T')[0]);
  const [historicalMeals, setHistoricalMeals] = useState<any[]>([]);

  useEffect(() => {
    if (session) {
      fetchUserProfile();
      fetchMeals();
      fetchStats();
      fetchDailyReport();
      fetchCumulativeData(selectedRange);
      fetchHistoricalReport(historicalDate);
      fetchHistoricalMeals(historicalDate);
    }
  }, [session, selectedRange, customRange, historicalDate]);

  const fetchCumulativeData = async (range: string) => {
    setIsFetchingCumulative(true);
    try {
      let url = `/api/reports?range=${range}`;
      if (range === 'custom') {
        url += `&startDate=${customRange.start}&endDate=${customRange.end}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setCumulativeData(data);
      }
    } catch (e) {
      console.error("Failed to fetch cumulative data", e);
    } finally {
      setIsFetchingCumulative(false);
    }
  };

  const fetchHistoricalReport = async (date: string) => {
    try {
      const res = await fetch(`/api/reports?date=${date}`);
      if (res.ok) {
        const data = await res.json();
        if (data) {
          setHistoricalReport(JSON.parse(data.analysis_content));
        } else {
          setHistoricalReport(null);
        }
      }
    } catch (e) {
      console.error("Failed to fetch historical report", e);
    }
  };

  const fetchHistoricalMeals = async (date: string) => {
    try {
      const res = await fetch(`/api/meals?date=${date}`);
      if (res.ok) {
        const data = await res.json();
        setHistoricalMeals(data);
      }
    } catch (e) {
      console.error("Failed to fetch historical meals", e);
    }
  };

  const fetchDailyReport = async () => {
    try {
      const res = await fetch('/api/reports');
      if (res.ok) {
        const data = await res.json();
        if (data) {
          setDailyReport(JSON.parse(data.analysis_content));
          setSelectedFeeling(data.feeling);
        }
      }
    } catch (e) {
      console.error("Failed to fetch daily report", e);
    }
  };



  const handleAnalyzeDay = async () => {
    if (meals.length === 0) return;
    setIsAnalyzingDay(true);
    setShowAnalysisModal(true);
    // Analysis is now triggered on the backend during the save flow or pre-view if needed
    // But user wants "In that I want the Nurtion and all the info" so we can generate it now if not exists
  };

  const saveDailyReport = async (feeling: string) => {
    setIsSavingReport(true);
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feeling })
      });
      if (res.ok) {
        const data = await res.json();
        setDailyReport(data.analysis);
        setSelectedFeeling(feeling);
      }
    } catch (e) {
      console.error("Failed to save report", e);
    } finally {
      setIsSavingReport(false);
    }
  };

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
    let url = `/api/stats?type=${selectedRange}`;
    if (selectedRange === 'custom') {
      url += `&startDate=${customRange.start}&endDate=${customRange.end}`;
    }
    const res = await fetch(url);
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

  const handleDeleteMeal = async (mealId: number) => {
    if (!confirm("Are you sure you want to delete this meal?")) return;
    try {
      const res = await fetch(`/api/meals/${mealId}`, { method: 'DELETE' });
      if (res.ok) {
        setSelectedMeal(null);
        fetchMeals();
        fetchStats();
      }
    } catch (e) {
      console.error("Failed to delete meal", e);
    }
  };

  const handleUpdateMeal = async () => {
    try {
      const res = await fetch(`/api/meals/${editedMeal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedMeal)
      });
      if (res.ok) {
        setIsEditingMeal(false);
        setSelectedMeal(editedMeal);
        fetchMeals();
        fetchStats();
      }
    } catch (e) {
      console.error("Failed to update meal", e);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const res = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedProfile)
      });
      if (res.ok) {
        setIsEditingProfile(false);
        fetchUserProfile();
        fetchStats();
      }
    } catch (e) {
      console.error("Failed to update profile", e);
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
        <nav className="fixed top-0 left-0 right-0 h-[52px] z-50 flex items-center justify-between px-8 bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl overflow-hidden shadow-lg shadow-blue-600/20">
              <img src="/logo.png" className="w-full h-full object-cover" alt="Logo" />
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
        <section className="relative pt-32 pb-20 px-8 flex flex-col items-center">
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

  const isDinnerTime = (() => {
    try {
      const now = new Date();
      const istDate = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
      return istDate.getHours() >= 19;
    } catch (e) {
      return false;
    }
  })();

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc] dark:bg-slate-950 pb-[115px]">
      {/* Navbar Upper */}
      <header className="py-1.5 px-6 flex items-center justify-between sticky top-0 z-40 bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-white/5 transition-all">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveTab('profile')}
            className="relative cursor-pointer hover:scale-105 transition-transform active:scale-95"
          >
            <img src={session.user?.image || ""} className="w-10 h-10 rounded-2xl border-2 border-slate-100 dark:border-white/10 shadow-sm" alt="Profile" />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-slate-950" />
          </button>
          <div>
            <h2 className="text-slate-900 dark:text-white font-black text-base font-display leading-tight">Hey, {session.user?.name?.split(' ')[0]}!</h2>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <ThemeToggle />
          {!userProfile?.daily_calorie_goal && (
            <button onClick={() => setNeedsInduction(true)} className="p-2.5 bg-white dark:bg-white/5 text-slate-600 dark:text-slate-400 rounded-2xl border border-slate-100 dark:border-white/10 hover:bg-slate-50 transition-all">
              <Target size={18} />
            </button>
          )}
          <button onClick={() => signOut()} className="p-2.5 bg-red-50 text-red-500 rounded-2xl hover:bg-red-100 transition-all">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main
        ref={scrollRef}
        onScroll={(e) => scrollY.set(e.currentTarget.scrollTop)}
        className="flex-1 overflow-y-auto pt-4 scroll-smooth"
      >
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
              <motion.div
                style={{ scale: summaryScale, opacity: summaryOpacity, y: summaryY }}
                className="relative group sticky top-0 z-20 origin-top"
              >
                <div className="absolute inset-0 bg-blue-600 rounded-[3rem] blur-3xl opacity-20 group-hover:opacity-30 transition-opacity" />
                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-7 text-slate-900 dark:text-white relative overflow-hidden shadow-2xl border border-slate-100 dark:border-white/5">
                  {/* Decorative Elements */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600 opacity-20 rounded-full blur-[60px] translate-x-1/2 -translate-y-1/2" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-600 opacity-20 rounded-full blur-[50px] -translate-x-1/2 translate-y-1/2" />

                  <div className="relative z-10 space-y-7">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1.5">Current Status</p>
                        <div className="flex items-baseline gap-2">
                          <h2 className="text-6xl font-black font-display leading-none tracking-tighter text-slate-900 dark:text-white">{totalCalories}</h2>
                          <span className="text-slate-400 font-bold text-lg">kcal</span>
                        </div>
                      </div>
                      <div className="w-14 h-14 bg-blue-600 text-white rounded-[1.25rem] shadow-lg shadow-blue-600/30 flex items-center justify-center">
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
                          className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                        />
                      </div>
                    </div>

                    {/* Optimized Target - Catchy Style */}
                    <div className="pt-5 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-blue-50 dark:bg-blue-600/10 rounded-lg flex items-center justify-center">
                          <Target size={12} className="text-blue-600" />
                        </div>
                        <div>
                          <p className="text-slate-400 text-[8px] font-black uppercase tracking-widest leading-none mb-1">Target Intake</p>
                          <p className="text-slate-900 dark:text-white text-xs font-black tracking-tight">{calorieGoal} <span className="text-[10px] text-slate-400">kcal</span></p>
                        </div>
                      </div>
                      <div className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${progress > 100 ? 'bg-red-100 text-red-600' : 'bg-blue-50 dark:bg-blue-600/20 text-blue-600'}`}>
                        {progress > 100 ? 'Over Limit' : 'On Track'}
                      </div>
                    </div>

                    {(isDinnerTime || dailyReport) && (
                      <div className="pt-3 mt-1">
                        <button
                          onClick={handleAnalyzeDay}
                          disabled={meals.length === 0}
                          className={`w-full py-3 ${dailyReport ? 'bg-slate-100 dark:bg-white/5 text-slate-500' : 'bg-blue-600 text-white shadow-xl shadow-blue-600/20'} rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 group disabled:opacity-50`}
                        >
                          <Sparkles size={14} className={dailyReport ? "" : "text-blue-200 group-hover:rotate-12 transition-transform"} />
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
                    meals.map((meal, i) => {
                      const mealColors = (() => {
                        switch (meal.meal_type?.toLowerCase()) {
                          case 'breakfast': return 'bg-blue-50/50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/30';
                          case 'lunch': return 'bg-emerald-50/50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/30';
                          case 'dinner': return 'bg-indigo-50/50 text-indigo-600 border-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-900/30';
                          case 'snack': return 'bg-amber-50/50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/30';
                          default: return 'bg-slate-50 text-slate-600 border-slate-100 dark:bg-white/5 dark:text-slate-400 dark:border-white/10';
                        }
                      })();

                      return (
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          onClick={() => setSelectedMeal(meal)}
                          key={i}
                          className={`flex gap-4 p-4 rounded-[2rem] items-center border shadow-sm hover:shadow-md hover:scale-[1.01] transition-all group cursor-pointer ${mealColors} bg-white dark:bg-slate-900`}
                        >
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black group-hover:scale-110 transition-transform ${mealColors.split(' ')[0]} ${mealColors.split(' ')[1]}`}>
                            {meal.calories}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-lg tracking-wider ${mealColors.split(' ')[0]} ${mealColors.split(' ')[1]}`}>
                                {meal.meal_type || 'snack'}
                              </span>
                              <p className="text-[10px] font-bold text-slate-400">{meal.time || 'Today'}</p>
                            </div>
                            <h4 className="text-sm font-black text-slate-900 dark:text-white truncate uppercase tracking-tight">{meal.food_name}</h4>
                            <p className="text-[10px] text-slate-400 font-medium truncate italic">"{meal.description}"</p>
                          </div>
                        </motion.div>
                      );
                    })
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
              {/* Unified Range Filter */}
              <div className="space-y-4">
                <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-2xl shadow-inner">
                  {(['daily', 'weekly', 'custom'] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => setSelectedRange(r)}
                      className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${selectedRange === r ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm' : 'text-slate-400'}`}
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
                      onChange={(e) => setCustomRange(prev => ({ ...prev, start: e.target.value }))}
                      className="flex-1 p-3 bg-slate-50 dark:bg-white/5 rounded-2xl text-[10px] font-black dark:text-white outline-none border border-slate-100 dark:border-white/10"
                    />
                    <span className="text-slate-400 font-black text-[10px] uppercase">to</span>
                    <input
                      type="date"
                      value={customRange.end}
                      onChange={(e) => setCustomRange(prev => ({ ...prev, end: e.target.value }))}
                      className="flex-1 p-3 bg-slate-50 dark:bg-white/5 rounded-2xl text-[10px] font-black dark:text-white outline-none border border-slate-100 dark:border-white/10"
                    />
                  </motion.div>
                )}
              </div>

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
              <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 border border-slate-100 dark:border-white/5 shadow-xl">
                <h4 className="font-black text-lg text-slate-900 dark:text-white mb-6 uppercase tracking-widest flex items-center gap-2">
                  <Utensils size={18} className="text-blue-600" /> Meal Breakdown
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
                        {['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'].map((color, index) => (
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
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'][i] }} />
                      <span className="text-[10px] font-black uppercase text-slate-400">{type}</span>
                      <span className="text-[10px] font-black text-slate-900 dark:text-white ml-auto">
                        {meals.filter(m => m.meal_type === type).reduce((a, b) => a + b.calories, 0)} kcal
                      </span>
                    </div>
                  ))}
                </div>
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

          {activeTab === 'reports' && (
            <motion.div
              key="reports"
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
                      className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${selectedRange === r ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm' : 'text-slate-400'}`}
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
                      onChange={(e) => setCustomRange(prev => ({ ...prev, start: e.target.value }))}
                      className="flex-1 p-3 bg-slate-50 dark:bg-white/5 rounded-2xl text-[10px] font-black dark:text-white outline-none border border-slate-100 dark:border-white/10"
                    />
                    <span className="text-slate-400 font-black text-[10px] uppercase">to</span>
                    <input
                      type="date"
                      value={customRange.end}
                      onChange={(e) => setCustomRange(prev => ({ ...prev, end: e.target.value }))}
                      className="flex-1 p-3 bg-slate-50 dark:bg-white/5 rounded-2xl text-[10px] font-black dark:text-white outline-none border border-slate-100 dark:border-white/10"
                    />
                  </motion.div>
                )}
              </div>

              {cumulativeData && (
                <div className="bg-slate-900 rounded-[2.5rem] p-7 text-white shadow-2xl relative overflow-hidden">
                  <div className="relative z-10 space-y-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Cumulative Stats</p>
                        <div className="flex items-baseline gap-2">
                          <h2 className="text-5xl font-black font-display leading-none tracking-tighter">
                            {Math.round(cumulativeData.summary?.total_calories || 0).toLocaleString()}
                          </h2>
                          <span className="text-slate-400 font-bold text-lg">total kcal</span>
                        </div>
                      </div>
                      <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center border border-blue-600/30">
                        <Activity className="text-blue-400" size={24} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-1">
                        <p className="text-slate-500 text-[8px] font-black uppercase tracking-widest leading-none">Avg Calories</p>
                        <p className="text-xl font-black text-white">{Math.round(cumulativeData.summary?.avg_calories || 0)} <span className="text-[10px] text-slate-500">kcal</span></p>
                        <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: '65%' }}
                            className="h-full bg-blue-500"
                          />
                        </div>
                      </div>
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-1">
                        <p className="text-slate-500 text-[8px] font-black uppercase tracking-widest leading-none">Days Tracked</p>
                        <p className="text-xl font-black text-white">{cumulativeData.summary?.days_logged || 0} <span className="text-[10px] text-slate-500">days</span></p>
                        <div className="flex gap-1 mt-1">
                          {[1, 2, 3, 4, 5].map(i => <div key={i} className={`w-1 h-1 rounded-full ${i <= ((cumulativeData.summary?.days_logged || 0) % 5) ? 'bg-blue-400' : 'bg-white/10'}`} />)}
                        </div>
                      </div>
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                        <p className="text-slate-500 text-[8px] font-black uppercase tracking-widest mb-1">Total Protein</p>
                        <p className="text-xl font-black text-emerald-400">{Math.round(cumulativeData.summary?.total_protein || 0)}g</p>
                      </div>
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                        <p className="text-slate-500 text-[8px] font-black uppercase tracking-widest mb-1">Total Carbs</p>
                        <p className="text-xl font-black text-amber-400">{Math.round(cumulativeData.summary?.total_carbs || 0)}g</p>
                      </div>
                    </div>

                    <div className="pt-4 h-48 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={cumulativeData.trend}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                          <XAxis dataKey="report_date" hide />
                          <Tooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                return (
                                  <div className="glass-dark p-4 rounded-2xl border-white/10 shadow-2xl space-y-2">
                                    <p className="text-[10px] font-black text-white/50">{new Date(payload[0].payload.report_date).toLocaleDateString()}</p>
                                    <div className="space-y-1">
                                      {payload.map((p: any) => (
                                        <div key={p.name} className="flex items-center justify-between gap-4">
                                          <span className="text-[9px] font-black uppercase text-slate-400">{p.name}</span>
                                          <span className="text-xs font-black text-white" style={{ color: p.color }}>{p.value}{p.name === 'Calories' ? 'kcal' : 'g'}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Bar name="Calories" dataKey="total_calories" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                          <Bar name="Protein" dataKey="total_protein" fill="#10b981" radius={[4, 4, 0, 0]} />
                          <Bar name="Carbs" dataKey="total_carbs" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                          <Bar name="Fats" dataKey="total_fats" fill="#ef4444" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-4 gap-2 pt-2">
                      {[
                        { label: 'Energy', color: 'bg-blue-600' },
                        { label: 'Protein', color: 'bg-emerald-500' },
                        { label: 'Carbs', color: 'bg-amber-500' },
                        { label: 'Fats', color: 'bg-red-500' }
                      ].map(item => (
                        <div key={item.label} className="flex items-center gap-1.5">
                          <div className={`w-1.5 h-1.5 rounded-full ${item.color}`} />
                          <span className="text-[8px] font-black uppercase text-slate-500">{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600 opacity-10 rounded-full blur-[80px]" />
                </div>
              )}

              <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-7 border border-slate-100 dark:border-white/5 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                    <History size={18} className="text-blue-600" /> Historical Reports
                  </h4>
                  <input
                    type="date"
                    value={historicalDate}
                    onChange={(e) => {
                      setHistoricalDate(e.target.value);
                      fetchHistoricalReport(e.target.value);
                      fetchHistoricalMeals(e.target.value);
                    }}
                    className="p-2 bg-slate-50 dark:bg-white/5 rounded-xl text-[10px] font-black tracking-tight dark:text-white outline-none"
                  />
                </div>

                <div className="space-y-8">
                  {/* AI Report Section - NOW FIRST */}
                  <div className="space-y-6">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">AI Intelligence Report</p>
                    {historicalReport ? (
                      <div className="space-y-6">
                        <div className="p-4 bg-blue-50 dark:bg-blue-600/5 rounded-2xl border border-blue-100 dark:border-blue-600/10">
                          <p className="text-slate-700 dark:text-slate-300 text-xs italic leading-relaxed">"{historicalReport.summary}"</p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          {historicalReport.table?.slice(0, 4).map((row: any, i: number) => (
                            <div key={i} className="flex flex-col gap-1 bg-white dark:bg-white/5 p-4 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
                              <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">{row.nutrient}</span>
                              <span className="text-base font-black text-slate-900 dark:text-white">{row.intake} <span className="text-[10px] text-slate-400 lowercase">{row.unit}</span></span>
                            </div>
                          ))}
                        </div>

                        <button
                          onClick={() => {
                            setDailyReport(historicalReport);
                            setShowAnalysisModal(true);
                          }}
                          className="w-full bg-blue-600 text-white p-5 rounded-[2rem] shadow-xl shadow-blue-600/20 flex items-center justify-between group hover:bg-blue-700 transition-all font-black text-[11px] uppercase tracking-widest"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                              <span className="relative">
                                <Sparkles size={16} />
                                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute inset-0 bg-white/20 blur-md rounded-full" />
                              </span>
                            </div>
                            Full Deep-Dive Analysis
                          </div>
                          <ChevronRight size={18} className="group-hover:translate-x-1 transition-all" />
                        </button>
                      </div>
                    ) : (
                      <div className="py-12 text-center bg-slate-50 dark:bg-white/5 rounded-[2rem] border-2 border-dashed border-slate-100 dark:border-white/5">
                        <Sparkles size={32} className="text-slate-200 mx-auto mb-3 opacity-30" />
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest leading-none mb-1">No AI Report</p>
                        <p className="text-[8px] text-slate-300 uppercase font-black tracking-widest">Select a date with logs</p>
                      </div>
                    )}
                  </div>

                  {/* Meals on this day Section - NOW SECOND */}
                  <div className="space-y-4 pt-6 border-t border-slate-50 dark:border-white/5">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Daily Log</p>
                    <div className="space-y-3">
                      {historicalMeals.length > 0 ? (
                        historicalMeals.map((meal, i) => (
                          <div
                            key={i}
                            onClick={() => setSelectedMeal(meal)}
                            className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/5 cursor-pointer hover:scale-[1.01] transition-all group shadow-sm bg-white hover:shadow-md"
                          >
                            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow-lg shadow-blue-600/20 group-hover:scale-110 transition-transform">
                              {meal.calories}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h5 className="text-xs font-black text-slate-900 dark:text-white truncate uppercase tracking-tight">{meal.food_name}</h5>
                              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{meal.meal_type || 'snack'}</p>
                            </div>
                            <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                          </div>
                        ))
                      ) : (
                        <div className="py-10 text-center bg-slate-50 dark:bg-white/5 rounded-[2rem] border-2 border-dashed border-slate-100 dark:border-white/5">
                          <History size={24} className="text-slate-200 mx-auto mb-2" />
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">No individual logs</p>
                        </div>
                      )}
                    </div>
                  </div>
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

                {!isEditingProfile ? (
                  <>
                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                          <Weight size={12} className="text-blue-500" /> Current Weight
                        </p>
                        <p className="text-2xl font-black text-slate-900">{userProfile?.weight || '--'}<span className="text-sm text-slate-400 ml-1">kg</span></p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                          <Target size={12} className="text-purple-500" /> Target Weight
                        </p>
                        <p className="text-2xl font-black text-slate-900">{userProfile?.target_weight || '--'}<span className="text-sm text-slate-400 ml-1">kg</span></p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                          <Activity size={12} className="text-orange-500" /> Daily Goal
                        </p>
                        <p className="text-2xl font-black text-slate-900">{userProfile?.daily_calorie_goal || '--'}<span className="text-sm text-slate-400 ml-1">kcal</span></p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                          <User size={12} className="text-green-500" /> Height
                        </p>
                        <p className="text-2xl font-black text-slate-900">{userProfile?.height || '--'}<span className="text-sm text-slate-400 ml-1">cm</span></p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setEditedProfile(userProfile);
                        setIsEditingProfile(true);
                      }}
                      className="w-full py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black rounded-3xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
                    >
                      <Edit size={20} /> Edit Profile
                    </button>
                  </>
                ) : (
                  <div className="space-y-8">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block">Weight (kg)</label>
                        <input
                          type="number"
                          value={editedProfile.weight}
                          onChange={(e) => setEditedProfile({ ...editedProfile, weight: parseFloat(e.target.value) })}
                          className="w-full p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border-2 border-transparent focus:border-blue-600 outline-none dark:text-white font-black text-xl transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block">Target (kg)</label>
                        <input
                          type="number"
                          value={editedProfile.target_weight}
                          onChange={(e) => setEditedProfile({ ...editedProfile, target_weight: parseFloat(e.target.value) })}
                          className="w-full p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border-2 border-transparent focus:border-blue-600 outline-none dark:text-white font-black text-xl transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block">Height (cm)</label>
                        <input
                          type="number"
                          value={editedProfile.height}
                          onChange={(e) => setEditedProfile({ ...editedProfile, height: parseInt(e.target.value) })}
                          className="w-full p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border-2 border-transparent focus:border-blue-600 outline-none dark:text-white font-black text-xl transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block">Daily Goal</label>
                        <input
                          type="number"
                          value={editedProfile.daily_calorie_goal}
                          onChange={(e) => setEditedProfile({ ...editedProfile, daily_calorie_goal: parseInt(e.target.value) })}
                          className="w-full p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border-2 border-transparent focus:border-blue-600 outline-none dark:text-white font-black text-xl transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block">Goal Type</label>
                      <div className="grid grid-cols-2 gap-2">
                        {['lose', 'maintain', 'gain', 'muscle'].map((g) => (
                          <button
                            key={g}
                            onClick={() => setEditedProfile({ ...editedProfile, goal: g })}
                            className={`py-3 px-4 rounded-xl border-2 font-black text-xs uppercase transition-all ${editedProfile.goal === g ? 'border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'border-slate-100 dark:border-white/5 text-slate-400 dark:text-slate-500 hover:border-slate-200'}`}
                          >
                            {g}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4">
                      <button
                        onClick={() => setIsEditingProfile(false)}
                        className="flex-1 py-5 bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white font-black rounded-3xl flex items-center justify-center gap-2"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleUpdateProfile}
                        className="flex-1 py-5 bg-blue-600 text-white font-black rounded-3xl flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
                      >
                        <Save size={20} /> Save
                      </button>
                    </div>
                  </div>
                )}

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
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto h-[70px] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-100 dark:border-white/5 px-6 flex items-center justify-between z-50 pb-2">
        <button
          onClick={() => setIsLogging(true)}
          className="relative flex flex-col items-center gap-1.5 group"
        >
          <div className="w-11 h-11 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-600/30 flex items-center justify-center group-hover:scale-110 group-active:scale-95 transition-all">
            <Plus size={22} className="group-hover:rotate-90 transition-transform duration-500" />
          </div>
          <span className="text-[9px] font-black uppercase tracking-widest text-blue-600/60 group-hover:text-blue-600 transition-colors">Add</span>
        </button>

        <button
          onClick={() => setActiveTab('daily')}
          className={`relative flex flex-col items-center gap-1.5 px-4 py-2 rounded-2xl transition-all ${activeTab === 'daily' ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'text-slate-400'}`}
        >
          <Utensils size={20} className={activeTab === 'daily' ? 'drop-shadow-[0_0_8px_rgba(79,70,229,0.5)]' : ''} />
          <span className="text-[9px] font-black uppercase tracking-widest">Home</span>
          {activeTab === 'daily' && <motion.div layoutId="tab-active" className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-indigo-600 rounded-full shadow-[0_0_10px_rgba(79,70,229,0.5)]" />}
        </button>

        <button
          onClick={() => setActiveTab('stats')}
          className={`relative flex flex-col items-center gap-1.5 px-4 py-2 rounded-2xl transition-all ${activeTab === 'stats' ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' : 'text-slate-400'}`}
        >
          <BarChart3 size={20} className={activeTab === 'stats' ? 'drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]' : ''} />
          <span className="text-[9px] font-black uppercase tracking-widest">Stats</span>
          {activeTab === 'stats' && <motion.div layoutId="tab-active" className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-emerald-600 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" />}
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`relative flex flex-col items-center gap-1.5 px-4 py-2 rounded-2xl transition-all ${activeTab === 'reports' ? 'text-purple-600 bg-purple-50 dark:bg-purple-900/20' : 'text-slate-400'}`}
        >
          <History size={20} className={activeTab === 'reports' ? 'drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]' : ''} />
          <span className="text-[9px] font-black uppercase tracking-widest">Reports</span>
          {activeTab === 'reports' && <motion.div layoutId="tab-active" className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-purple-600 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)]" />}
        </button>
      </nav>

      {/* Overlays */}
      <AnimatePresence>
        {isLogging && (
          <MealLogger
            onClose={() => { setIsLogging(false); setSubtractionMealId(null); }}
            onComplete={fetchMeals}
            subtractionMealId={subtractionMealId || undefined}
            initialMealType={subtractionMealId ? meals.find(m => m.id === subtractionMealId)?.meal_type : undefined}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {needsInduction && (
          <InductionFlow onComplete={handleInductionComplete} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAnalysisModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
            onClick={() => !isSavingReport && setShowAnalysisModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-lg bg-white dark:bg-slate-950 rounded-[3rem] p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowAnalysisModal(false)}
                className="absolute top-6 right-6 p-2 bg-slate-100 dark:bg-white/5 rounded-full hover:bg-slate-200 transition-all text-slate-500"
              >
                <X size={20} />
              </button>

              <div className="space-y-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="text-blue-600" size={32} />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white font-display">Daily Intelligence</h3>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">AI report</p>
                </div>

                {!dailyReport ? (
                  <div className="space-y-8 py-4">
                    <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-2xl border border-amber-100 dark:border-amber-900/30 flex items-start gap-3">
                      <Info className="text-amber-600 shrink-0 mt-0.5" size={18} />
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
                            onClick={() => saveDailyReport(f.label)}
                            disabled={isSavingReport}
                            className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl hover:bg-blue-600 hover:text-white transition-all flex flex-col items-center gap-1 group"
                          >
                            <span className="text-2xl group-hover:scale-125 transition-transform">{f.emoji}</span>
                            <span className="text-[10px] font-black uppercase tracking-tighter text-slate-500 dark:text-slate-400 group-hover:text-white/80">{f.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    {isSavingReport && (
                      <div className="flex flex-col items-center gap-4 py-8">
                        <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
                        <p className="font-black text-slate-900 dark:text-white animate-pulse">Consulting AI Dietitian...</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="p-6 bg-slate-900 rounded-[2rem] text-white overflow-hidden relative">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600 opacity-20 rounded-full blur-[60px]" />
                      <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-3 relative z-10">AI Synthesis</p>
                      <p className="text-lg font-bold leading-relaxed relative z-10">{dailyReport.summary}</p>
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
                              <td className="px-4 py-4 font-bold text-slate-900 dark:text-white text-sm">{row.nutrient}</td>
                              <td className="px-4 py-4 text-right whitespace-nowrap">
                                <span className="text-blue-600 font-black text-sm">{row.intake}</span>
                                <span className="text-[10px] text-slate-400 ml-1">{row.unit}</span>
                              </td>
                              <td className="px-4 py-4 text-right text-slate-400 text-xs font-bold whitespace-nowrap">{row.target} {row.unit}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      {dailyReport.metrics?.map((m: any, i: number) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{m.label}</p>
                            <p className="text-sm font-black text-slate-900 dark:text-white">{m.value}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${m.status === 'Positive' || m.status === 'Good' || m.status === 'Optimized'
                            ? 'bg-green-100 text-green-600'
                            : 'bg-orange-100 text-orange-600'
                            }`}>
                            {m.status}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="p-6 bg-blue-50 dark:bg-blue-600/10 rounded-[2rem] border-2 border-blue-600/10">
                      <div className="flex items-center gap-2 mb-2">
                        <Info size={16} className="text-blue-600" />
                        <p className="text-blue-600 text-[10px] font-black uppercase tracking-widest">Actionable Advice</p>
                      </div>
                      <p className="text-slate-700 dark:text-blue-100 font-bold text-sm leading-relaxed">{dailyReport.advice}</p>
                    </div>

                    <div className="flex items-center justify-center gap-3 py-4 border-t border-slate-100 dark:border-white/5">
                      <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">You felt:</p>
                      <span className="px-4 py-2 bg-blue-600 text-white rounded-full text-xs font-black shadow-lg shadow-blue-600/20">{selectedFeeling}</span>
                    </div>

                    <button
                      onClick={() => setShowAnalysisModal(false)}
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

      <AnimatePresence>
        {selectedMeal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-end justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setSelectedMeal(null)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-full max-w-md bg-white dark:bg-slate-950 rounded-[3rem] p-8 shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-1 bg-slate-200 dark:bg-white/10 rounded-full mx-auto mb-8" />

              <button
                onClick={() => setSelectedMeal(null)}
                className="absolute top-5 right-5 p-2.5 bg-slate-50 dark:bg-white/5 rounded-2xl hover:bg-slate-100 dark:hover:bg-white/10 transition-all text-slate-500 z-10"
              >
                <X size={18} />
              </button>

              <div className="space-y-6">
                {!isEditingMeal ? (
                  <>
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-blue-50 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 rounded-lg tracking-wider">
                            {selectedMeal.meal_type || 'snack'}
                          </span>
                          <span className="text-[9px] font-black text-slate-400 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-lg">
                            {selectedMeal.time}
                          </span>
                        </div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white font-display leading-tight">{selectedMeal.food_name}</h3>
                      </div>
                      <div className="px-5 py-3 bg-blue-50 dark:bg-blue-600/10 rounded-2xl">
                        <p className="text-xl font-black text-blue-600 dark:text-blue-400">{selectedMeal.calories}<span className="text-[10px] ml-1">kcal</span></p>
                      </div>
                    </div>

                    <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-[2rem] border border-slate-100 dark:border-white/5">
                      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 leading-relaxed italic">
                        "{selectedMeal.description}"
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => {
                          setEditedMeal(selectedMeal);
                          setIsEditingMeal(true);
                        }}
                        className="flex-1 py-4 bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-200 transition-all text-xs"
                      >
                        <Edit size={16} /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteMeal(selectedMeal.id)}
                        className="flex-1 py-4 bg-red-50 dark:bg-red-500/10 text-red-600 font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-red-100 transition-all text-xs"
                      >
                        <Trash2 size={16} /> Delete
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        setSubtractionMealId(selectedMeal.id);
                        setSelectedMeal(null);
                        setIsLogging(true);
                      }}
                      className="w-full py-4 bg-orange-50 dark:bg-orange-500/10 text-orange-600 font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-orange-100 transition-all border border-orange-200 dark:border-orange-500/20 text-xs"
                    >
                      <Camera size={16} /> Subtract Leftovers
                    </button>

                    <button
                      onClick={() => setSelectedMeal(null)}
                      className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl text-xs"
                    >
                      Done
                    </button>
                  </>
                ) : (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Meal Type</label>
                        <div className="grid grid-cols-4 gap-2">
                          {['breakfast', 'lunch', 'dinner', 'snack'].map((type) => (
                            <button
                              key={type}
                              onClick={() => setEditedMeal({ ...editedMeal, meal_type: type })}
                              className={`py-3 rounded-xl border-2 text-[10px] font-black uppercase transition-all ${editedMeal.meal_type === type ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-100 dark:border-white/5 text-slate-400'}`}
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Meal Name</label>
                        <input
                          type="text"
                          value={editedMeal.food_name}
                          onChange={(e) => setEditedMeal({ ...editedMeal, food_name: e.target.value })}
                          className="w-full p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border-2 border-transparent focus:border-blue-600 outline-none font-black text-lg transition-all"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Calories</label>
                          <input
                            type="number"
                            value={editedMeal.calories}
                            onChange={(e) => setEditedMeal({ ...editedMeal, calories: parseInt(e.target.value) })}
                            className="w-full p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border-2 border-transparent focus:border-blue-600 outline-none font-black text-lg transition-all"
                          />
                        </div>
                        <div className="flex flex-col justify-end">
                          <span className="text-slate-400 font-black mb-4 ml-1">kcal</span>
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Description</label>
                        <textarea
                          value={editedMeal.description}
                          onChange={(e) => setEditedMeal({ ...editedMeal, description: e.target.value })}
                          className="w-full p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border-2 border-transparent focus:border-blue-600 outline-none font-bold text-sm transition-all h-24 resize-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => setIsEditingMeal(false)}
                        className="flex-1 py-5 bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white font-black rounded-2xl flex items-center justify-center gap-2"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleUpdateMeal}
                        className="flex-1 py-5 bg-blue-600 text-white font-black rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
                      >
                        <Save size={18} /> Save
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
