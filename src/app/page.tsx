"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { Camera, Plus, BarChart3, History, LogOut, Utensils, Flame, User, Target, ChevronRight, Activity, Weight, Sparkles, Trash2, Edit, Save, X, Info, Sun, CloudSun, Moon, Coffee, Clock } from "lucide-react";
import { useScroll, useTransform, useMotionValue, motion, AnimatePresence } from "framer-motion";
import { AreaChart, Area, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell, PieChart, Pie } from 'recharts';
import { useRef } from "react";
import MealLogger from "@/components/MealLogger";
import InductionFlow from "@/components/InductionFlow";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Header } from "@/components/dashboard/Header";
import { TabNavigation } from "@/components/dashboard/TabNavigation";
import { DailyTab } from "@/components/dashboard/DailyTab";
import { StatsTab } from "@/components/dashboard/StatsTab";
import { ReportsTab } from "@/components/dashboard/ReportsTab";
import { ProfileTab } from "@/components/dashboard/ProfileTab";
import { AnalysisModal } from "@/components/modals/AnalysisModal";
import { MealDetailModal } from "@/components/modals/MealDetailModal";

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
  const [lastReport, setLastReport] = useState<any>(null);
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
        } else {
          setDailyReport(null);
          setSelectedFeeling(null);

          // Fallback to fetch latest report for "View Last Report" button
          const latestRes = await fetch('/api/reports?latest=true');
          if (latestRes.ok) {
            const latestData = await latestRes.json();
            if (latestData) {
              setLastReport(JSON.parse(latestData.analysis_content));
            }
          }
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
        fetchDailyReport();
        if (historicalDate) {
          fetchHistoricalReport(historicalDate);
          fetchHistoricalMeals(historicalDate);
        }
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
        setSelectedMeal({ ...editedMeal });
        fetchMeals();
        fetchStats();
        fetchDailyReport(); // Corrected from fetchReports
        if (historicalDate) {
          fetchHistoricalReport(historicalDate);
        }
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
        className="w-16 h-16 bg-blue-600 dark:bg-gold rounded-[1.5rem] flex items-center justify-center text-white dark:text-slate-950 mb-4 shadow-xl shadow-blue-600/30 dark:shadow-gold/30"
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
          <div className="absolute top-[-10%] left-[-10%] w-[50%] aspect-square bg-blue-600/10 dark:bg-gold/10 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] aspect-square bg-purple-600/10 dark:bg-gold/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />

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
            <div className="w-10 h-10 bg-blue-600 dark:bg-gold rounded-xl overflow-hidden shadow-lg shadow-blue-600/20 dark:shadow-gold/20">
              <img src="/logo.png" className="w-full h-full object-cover" alt="Logo" />
            </div>
            <span className="text-xl font-black font-display tracking-tight text-slate-900 dark:text-white">My Calories.</span>
          </div>
          <button
            onClick={() => signIn("google")}
            className="px-6 py-2.5 bg-blue-600 dark:bg-gold text-white dark:text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-blue-600/20 dark:shadow-gold/20 hover:bg-blue-700 dark:hover:bg-gold/90 transition-all hover:scale-105 active:scale-95"
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
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-gold/10 text-blue-600 dark:text-gold rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4">
              <Sparkles size={12} className="fill-blue-600 dark:fill-gold" />
              Next Gen Nutrition Tracking
            </div>
            <h1 className="text-6xl md:text-8xl font-black font-display tracking-tight text-slate-900 dark:text-white leading-[0.95] md:leading-[0.9]">
              Eat. Snap.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-gold dark:to-muted-gold">Level Up.</span>
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
                <Activity size={16} className="text-blue-500 dark:text-gold" />
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
            <div className="absolute inset-0 bg-blue-600/30 dark:bg-gold/20 blur-[100px] -z-10 opacity-30" />
            <div className="glass dark:glass-dark border border-white/50 dark:border-white/10 rounded-[4rem] p-4 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] dark:shadow-none">
              <div className="bg-[#f8fafc] dark:bg-slate-950 rounded-[3.5rem] overflow-hidden aspect-video relative flex items-center justify-center">
                <div className="absolute inset-0 bg-blue-600/5 dark:bg-gold/5" />
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
                    <div className="w-1.5 h-1.5 bg-blue-600 dark:bg-gold rounded-full" /> {f}
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
              <button onClick={() => signIn("google")} className="group flex items-center gap-3 font-black text-sm uppercase tracking-widest text-blue-600 dark:text-gold">
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
      <Header
        user={session!.user || {}}
        userProfile={userProfile}
        onProfileClick={() => setActiveTab("profile")}
        onNeedsInduction={() => setNeedsInduction(true)}
        onSignOut={() => signOut()}
      />

      {/* Main Content Area */}
      <main
        ref={scrollRef}
        onScroll={(e) => scrollY.set(e.currentTarget.scrollTop)}
        className="flex-1 overflow-y-auto pt-4 scroll-smooth"
      >
        <AnimatePresence mode="wait">
          {activeTab === 'daily' && (
            <DailyTab
              totalCalories={totalCalories}
              progress={progress}
              calorieGoal={calorieGoal}
              meals={meals}
              onMealClick={setSelectedMeal}
              onAnalyzeDay={handleAnalyzeDay}
              dailyReport={dailyReport}
              lastReport={lastReport}
              summaryScale={summaryScale}
              summaryOpacity={summaryOpacity}
              summaryY={summaryY}
              isDinnerTime={isDinnerTime}
            />
          )}

          {activeTab === 'stats' && (
            <StatsTab
              selectedRange={selectedRange}
              setSelectedRange={setSelectedRange}
              customRange={customRange}
              setCustomRange={(range) => setCustomRange(range)}
              stats={(stats as any).trend || []}
              breakdown={(stats as any).breakdown || []}
              meals={meals}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsTab
              selectedRange={selectedRange}
              setSelectedRange={setSelectedRange}
              customRange={customRange}
              setCustomRange={(range) => setCustomRange(range)}
              cumulativeData={cumulativeData}
              historicalDate={historicalDate}
              onHistoricalDateChange={(date) => {
                setHistoricalDate(date);
                fetchHistoricalReport(date);
                fetchHistoricalMeals(date);
              }}
              historicalReport={historicalReport}
              historicalMeals={historicalMeals}
              onMealClick={setSelectedMeal}
              onViewFullReport={(report) => {
                setDailyReport(report);
                setShowAnalysisModal(true);
              }}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileTab
              user={session?.user || {}}
              userProfile={userProfile}
              isEditingProfile={isEditingProfile}
              setIsEditingProfile={setIsEditingProfile}
              editedProfile={editedProfile}
              setEditedProfile={setEditedProfile}
              onUpdateProfile={handleUpdateProfile}
              setNeedsInduction={setNeedsInduction}
            />
          )}
        </AnimatePresence>
      </main>

      <TabNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        setIsLogging={setIsLogging}
      />

      {/* Overlays */}
      <AnimatePresence>
        {isLogging && (
          <MealLogger
            onClose={() => { setIsLogging(false); setSubtractionMealId(null); }}
            onComplete={() => {
              fetchMeals();
              fetchStats();
              fetchDailyReport();
            }}
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
          <AnalysisModal
            isOpen={showAnalysisModal}
            onClose={() => !isSavingReport && setShowAnalysisModal(false)}
            dailyReport={dailyReport}
            isSavingReport={isSavingReport}
            onSaveReport={saveDailyReport}
            selectedFeeling={selectedFeeling}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedMeal && (
          <MealDetailModal
            isOpen={!!selectedMeal}
            meal={selectedMeal}
            onClose={() => setSelectedMeal(null)}
            isEditing={isEditingMeal}
            setIsEditing={setIsEditingMeal}
            editedMeal={editedMeal}
            setEditedMeal={setEditedMeal}
            onUpdateMeal={handleUpdateMeal}
            onDeleteMeal={handleDeleteMeal}
            onSubtractLeftovers={(mealId) => {
              setSubtractionMealId(mealId);
              setSelectedMeal(null);
              setIsLogging(true);
            }}
          />
        )}
      </AnimatePresence>
    </div >
  );
}
