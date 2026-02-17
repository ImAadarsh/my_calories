"use client";

import { motion } from "framer-motion";
import { Plus, Weight, Target, Activity, User, Edit, Save, ChevronRight, Flame } from "lucide-react";

interface ProfileTabProps {
    user: {
        name?: string | null;
        email?: string | null;
        image?: string | null;
    };
    userProfile: any;
    isEditingProfile: boolean;
    setIsEditingProfile: (isEditing: boolean) => void;
    editedProfile: any;
    setEditedProfile: (profile: any) => void;
    onUpdateProfile: () => void;
}

export function ProfileTab({
    user,
    userProfile,
    isEditingProfile,
    setIsEditingProfile,
    editedProfile,
    setEditedProfile,
    onUpdateProfile
}: ProfileTabProps) {
    return (
        <motion.div
            key="profile"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="px-6 space-y-10"
        >
            <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-100 dark:border-white/5 shadow-xl space-y-10">
                <div className="flex flex-col items-center gap-4 border-b border-slate-50 dark:border-white/5 pb-8">
                    <div className="relative">
                        <img
                            src={user?.image || ""}
                            className="w-24 h-24 rounded-[2.5rem] border-4 border-[#f8fafc] dark:border-slate-800 shadow-2xl"
                            alt="Profile"
                        />
                        <div className="absolute -bottom-2 -right-2 bg-blue-600 dark:bg-gold text-white dark:text-slate-950 p-2 rounded-2xl shadow-lg">
                            <Plus size={20} />
                        </div>
                    </div>
                    <div className="text-center">
                        <h2 className="text-2xl font-black text-slate-900 dark:text-cream font-display">{user?.name}</h2>
                        <p className="text-sm font-bold text-slate-400 dark:text-cream/40">{user?.email}</p>
                    </div>
                </div>

                {!isEditingProfile ? (
                    <>
                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <p className="text-[10px] font-black text-slate-400 dark:text-cream/40 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Weight size={12} className="text-blue-500 dark:text-gold" /> Current Weight
                                </p>
                                <p className="text-2xl font-black text-slate-900 dark:text-cream">{userProfile?.weight || '--'}<span className="text-sm text-slate-400 dark:text-cream/30 ml-1">kg</span></p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-[10px] font-black text-slate-400 dark:text-cream/40 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Target size={12} className="text-purple-500 dark:text-gold" /> Target Weight
                                </p>
                                <p className="text-2xl font-black text-slate-900 dark:text-cream">{userProfile?.target_weight || '--'}<span className="text-sm text-slate-400 dark:text-cream/30 ml-1">kg</span></p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-[10px] font-black text-slate-400 dark:text-cream/40 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Activity size={12} className="text-orange-500 dark:text-gold" /> Daily Goal
                                </p>
                                <p className="text-2xl font-black text-slate-900 dark:text-cream">{userProfile?.daily_calorie_goal || '--'}<span className="text-sm text-slate-400 dark:text-cream/30 ml-1">kcal</span></p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-[10px] font-black text-slate-400 dark:text-cream/40 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <User size={12} className="text-green-500 dark:text-gold" /> Height
                                </p>
                                <p className="text-2xl font-black text-slate-900 dark:text-cream">{userProfile?.height || '--'}<span className="text-sm text-slate-400 dark:text-cream/30 ml-1">cm</span></p>
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
                                <label className="text-[10px] font-black text-slate-400 dark:text-cream/40 uppercase tracking-widest ml-1 block">Weight (kg)</label>
                                <input
                                    type="number"
                                    value={editedProfile.weight}
                                    onChange={(e) => setEditedProfile({ ...editedProfile, weight: parseFloat(e.target.value) })}
                                    className="w-full p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border-2 border-transparent focus:border-blue-600 dark:focus:border-gold outline-none dark:text-cream font-black text-xl transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 dark:text-cream/40 uppercase tracking-widest ml-1 block">Target (kg)</label>
                                <input
                                    type="number"
                                    value={editedProfile.target_weight}
                                    onChange={(e) => setEditedProfile({ ...editedProfile, target_weight: parseFloat(e.target.value) })}
                                    className="w-full p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border-2 border-transparent focus:border-blue-600 dark:focus:border-gold outline-none dark:text-cream font-black text-xl transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 dark:text-cream/40 uppercase tracking-widest ml-1 block">Height (cm)</label>
                                <input
                                    type="number"
                                    value={editedProfile.height}
                                    onChange={(e) => setEditedProfile({ ...editedProfile, height: parseInt(e.target.value) })}
                                    className="w-full p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border-2 border-transparent focus:border-blue-600 dark:focus:border-gold outline-none dark:text-cream font-black text-xl transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 dark:text-cream/40 uppercase tracking-widest ml-1 block">Daily Goal</label>
                                <input
                                    type="number"
                                    value={editedProfile.daily_calorie_goal}
                                    onChange={(e) => setEditedProfile({ ...editedProfile, daily_calorie_goal: parseInt(e.target.value) })}
                                    className="w-full p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border-2 border-transparent focus:border-blue-600 dark:focus:border-gold outline-none dark:text-cream font-black text-xl transition-all"
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
                                        className={`py-3 px-4 rounded-xl border-2 font-black text-xs uppercase transition-all ${editedProfile.goal === g ? 'border-blue-600 dark:border-gold bg-blue-600 dark:bg-gold text-white dark:text-slate-950 shadow-lg shadow-blue-600/20 dark:shadow-gold/20' : 'border-slate-100 dark:border-white/5 text-slate-400 dark:text-slate-500 hover:border-slate-200'}`}
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
                                onClick={onUpdateProfile}
                                className="flex-1 py-5 bg-blue-600 dark:bg-gold text-white dark:text-slate-950 font-black rounded-3xl flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 dark:shadow-gold/20"
                            >
                                <Save size={20} /> Save
                            </button>
                        </div>
                    </div>
                )}

                <div className="pt-4">
                    <p className="text-[10px] font-black text-slate-400 dark:text-cream/40 mb-4 uppercase tracking-widest">Selected Goal</p>
                    <div className="p-5 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-600 dark:bg-gold rounded-2xl flex items-center justify-center text-white dark:text-slate-950">
                                <Flame size={20} />
                            </div>
                            <p className="font-black text-slate-900 dark:text-cream capitalize">{userProfile?.goal || 'Maintain'}</p>
                        </div>
                        <ChevronRight size={20} className="text-slate-300 dark:text-cream/30" />
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
