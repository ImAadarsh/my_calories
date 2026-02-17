"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Edit, Trash2, Camera, Save, Sun, CloudSun, Moon, Coffee, Utensils } from "lucide-react";

interface MealDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    meal: any;
    isEditing: boolean;
    setIsEditing: (isEditing: boolean) => void;
    editedMeal: any;
    setEditedMeal: (meal: any) => void;
    onUpdateMeal: () => void;
    onDeleteMeal: (id: number) => void;
    onSubtractLeftovers: (id: number) => void;
}

export function MealDetailModal({
    isOpen,
    onClose,
    meal,
    isEditing,
    setIsEditing,
    editedMeal,
    setEditedMeal,
    onUpdateMeal,
    onDeleteMeal,
    onSubtractLeftovers
}: MealDetailModalProps) {
    if (!meal) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[60] flex items-end justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
                    onClick={onClose}
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
                            onClick={onClose}
                            className="absolute top-5 right-5 p-2.5 bg-slate-50 dark:bg-white/5 rounded-2xl hover:bg-slate-100 dark:hover:bg-white/10 transition-all text-slate-500 z-10"
                        >
                            <X size={18} />
                        </button>

                        <div className="space-y-6">
                            {!isEditing ? (
                                <>
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-blue-50 dark:bg-gold/20 text-blue-600 dark:text-gold rounded-lg tracking-wider">
                                                    {meal.meal_type || 'snack'}
                                                </span>
                                                <span className="text-[9px] font-black text-slate-400 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-lg">
                                                    {meal.time}
                                                </span>
                                            </div>
                                            <h3 className="text-xl font-black text-slate-900 dark:text-white font-display leading-tight">{meal.food_name}</h3>
                                        </div>
                                        <div className="px-5 py-3 bg-blue-50 dark:bg-gold/10 rounded-2xl">
                                            <p className="text-xl font-black text-blue-600 dark:text-gold">{meal.calories}<span className="text-[10px] ml-1">kcal</span></p>
                                        </div>
                                    </div>

                                    <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-[2rem] border border-slate-100 dark:border-white/5">
                                        <p className="text-xs font-bold text-slate-500 dark:text-cream/50 leading-relaxed italic">
                                            "{meal.description}"
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl border border-emerald-100 dark:border-emerald-500/20 text-center">
                                            <p className="text-[8px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">Protein</p>
                                            <p className="text-lg font-black text-emerald-700 dark:text-emerald-300">{meal.protein || 0}<span className="text-[10px] ml-0.5">g</span></p>
                                        </div>
                                        <div className="p-4 bg-amber-50 dark:bg-amber-500/10 rounded-2xl border border-amber-100 dark:border-amber-500/20 text-center">
                                            <p className="text-[8px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-1">Carbs</p>
                                            <p className="text-lg font-black text-amber-700 dark:text-amber-300">{meal.carbs || 0}<span className="text-[10px] ml-0.5">g</span></p>
                                        </div>
                                        <div className="p-4 bg-rose-50 dark:bg-rose-500/10 rounded-2xl border border-rose-100 dark:border-rose-500/20 text-center">
                                            <p className="text-[8px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest mb-1">Fats</p>
                                            <p className="text-lg font-black text-rose-700 dark:text-rose-300">{meal.fats || 0}<span className="text-[10px] ml-0.5">g</span></p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            onClick={() => {
                                                setEditedMeal(meal);
                                                setIsEditing(true);
                                            }}
                                            className="flex-1 py-4 bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-200 transition-all text-xs"
                                        >
                                            <Edit size={16} /> Edit
                                        </button>
                                        <button
                                            onClick={() => onDeleteMeal(meal.id)}
                                            className="flex-1 py-4 bg-red-50 dark:bg-red-500/10 text-red-600 font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-red-100 transition-all text-xs"
                                        >
                                            <Trash2 size={16} /> Delete
                                        </button>
                                    </div>

                                    <button
                                        onClick={() => onSubtractLeftovers(meal.id)}
                                        className="w-full py-4 bg-orange-50 dark:bg-gold/10 text-orange-600 dark:text-gold font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-orange-100 transition-all border border-orange-200 dark:border-gold/20 text-xs"
                                    >
                                        <Camera size={16} /> Subtract Leftovers
                                    </button>

                                    <button
                                        onClick={onClose}
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
                                                        className={`py-3 rounded-xl border-2 text-[10px] font-black uppercase transition-all ${editedMeal.meal_type === type ? 'border-blue-600 dark:border-gold bg-blue-600 dark:bg-gold text-white dark:text-slate-950' : 'border-slate-100 dark:border-white/5 text-slate-400 dark:text-cream/40'}`}
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
                                                className="w-full p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border-2 border-transparent focus:border-blue-600 dark:focus:border-gold outline-none font-black text-lg transition-all dark:text-cream"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Calories</label>
                                                <input
                                                    type="number"
                                                    value={editedMeal.calories}
                                                    onChange={(e) => setEditedMeal({ ...editedMeal, calories: parseInt(e.target.value) || 0 })}
                                                    className="w-full p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border-2 border-transparent focus:border-blue-600 dark:focus:border-gold outline-none font-black text-lg transition-all dark:text-cream"
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
                                                className="w-full p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border-2 border-transparent focus:border-blue-600 dark:focus:border-gold outline-none font-bold text-sm transition-all h-24 resize-none dark:text-cream"
                                            />
                                        </div>

                                        <div className="grid grid-cols-3 gap-3">
                                            <div className="space-y-1.5">
                                                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Protein (g)</label>
                                                <input
                                                    type="number"
                                                    value={editedMeal.protein || 0}
                                                    onChange={(e) => setEditedMeal({ ...editedMeal, protein: parseInt(e.target.value) || 0 })}
                                                    className="w-full p-3 bg-slate-50 dark:bg-white/5 rounded-xl border-2 border-transparent focus:border-emerald-500 outline-none font-black text-sm text-center dark:text-cream"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Carbs (g)</label>
                                                <input
                                                    type="number"
                                                    value={editedMeal.carbs || 0}
                                                    onChange={(e) => setEditedMeal({ ...editedMeal, carbs: parseInt(e.target.value) || 0 })}
                                                    className="w-full p-3 bg-slate-50 dark:bg-white/5 rounded-xl border-2 border-transparent focus:border-amber-500 outline-none font-black text-sm text-center dark:text-cream"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Fats (g)</label>
                                                <input
                                                    type="number"
                                                    value={editedMeal.fats || 0}
                                                    onChange={(e) => setEditedMeal({ ...editedMeal, fats: parseInt(e.target.value) || 0 })}
                                                    className="w-full p-3 bg-slate-50 dark:bg-white/5 rounded-xl border-2 border-transparent focus:border-rose-500 outline-none font-black text-sm text-center dark:text-cream"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            onClick={() => setIsEditing(false)}
                                            className="flex-1 py-5 bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white font-black rounded-2xl flex items-center justify-center gap-2"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={onUpdateMeal}
                                            className="flex-1 py-5 bg-blue-600 dark:bg-gold text-white dark:text-slate-950 font-black rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 dark:shadow-gold/20"
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
    );
}
