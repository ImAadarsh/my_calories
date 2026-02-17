"use client";

import { useState, useRef } from "react";
import { Camera, Upload, X, Send, Sparkles, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function MealLogger({ onClose, onComplete }: { onClose: () => void, onComplete: () => void }) {
    const [image, setImage] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [description, setDescription] = useState("");
    const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('snack');
    const cameraInputRef = useRef<HTMLInputElement>(null);
    const galleryInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleUpload = async () => {
        if (!image) return;
        setIsAnalyzing(true);

        const formData = new FormData();
        formData.append('image', image);
        if (description) {
            formData.append('userDescription', description);
        }
        formData.append('mealType', mealType);

        try {
            const res = await fetch('/api/meals', {
                method: 'POST',
                body: formData,
            });

            if (res.ok) {
                onComplete();
                onClose();
            }
        } catch (error) {
            console.error("Upload failed", error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 glass-dark z-50 flex flex-col p-6 items-center justify-center"
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-[3rem] p-8 shadow-2xl relative overflow-hidden"
            >
                <div className="flex justify-between items-center mb-10">
                    <h3 className="text-2xl font-black font-display text-slate-900 dark:text-white">Log Nutrition</h3>
                    <button onClick={onClose} className="p-3 bg-slate-50 dark:bg-white/10 rounded-2xl hover:bg-slate-100 transition-all">
                        <X size={20} className="text-slate-500" />
                    </button>
                </div>

                <div className="space-y-8">
                    {preview ? (
                        <div className="space-y-6">
                            <div className="w-full aspect-[4/3] bg-slate-100 dark:bg-white/5 rounded-[2.5rem] overflow-hidden relative group border-4 border-slate-50 dark:border-white/5 shadow-xl">
                                <img src={preview} className="w-full h-full object-cover" alt="Preview" />
                                <AnimatePresence>
                                    {isAnalyzing && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="absolute inset-0 bg-blue-600/80 backdrop-blur-md flex flex-col items-center justify-center text-white"
                                        >
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                                className="mb-6"
                                            >
                                                <Sparkles size={64} />
                                            </motion.div>
                                            <p className="font-black text-xl font-display tracking-tight">GPT Analysis in Progress</p>
                                            <p className="text-blue-100 text-xs mt-2 uppercase tracking-widest font-black opacity-60">Wait for accuracy...</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {!isAnalyzing && (
                                <>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Meal Type</label>
                                        <div className="grid grid-cols-4 gap-2">
                                            {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((type) => (
                                                <button
                                                    key={type}
                                                    type="button"
                                                    onClick={() => setMealType(type)}
                                                    className={`py-3 px-1 rounded-xl border-2 text-[10px] font-black uppercase transition-all ${mealType === type ? 'border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'border-slate-100 dark:border-white/5 text-slate-400'}`}
                                                >
                                                    {type}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Optional Insight</label>
                                        <textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder="Organic, large portion, extra spicy..."
                                            className="w-full p-4 bg-slate-50 dark:bg-white/5 rounded-[1.5rem] border-2 border-transparent focus:border-blue-600 outline-none text-slate-900 dark:text-white transition-all resize-none h-24 text-sm font-medium"
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <button
                                onClick={() => cameraInputRef.current?.click()}
                                className="w-full aspect-square bg-slate-50 dark:bg-white/5 rounded-[3rem] border-4 border-dashed border-slate-200 dark:border-white/10 flex flex-col items-center justify-center text-slate-400 hover:border-blue-600 hover:bg-blue-50/30 transition-all group relative overflow-hidden"
                            >
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-blue-600/10 to-transparent" />
                                <div className="w-20 h-20 bg-white dark:bg-white/10 rounded-[2rem] shadow-xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-all duration-500">
                                    <Camera size={32} />
                                </div>
                                <p className="font-black text-slate-900 dark:text-white text-lg font-display">Capture Food</p>
                                <p className="text-[10px] font-black uppercase tracking-widest mt-2 opacity-60">Powered by Gemini 2.5</p>
                            </button>

                            <button
                                onClick={() => galleryInputRef.current?.click()}
                                className="w-full py-5 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-[2rem] flex items-center justify-center gap-3 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-50 transition-all"
                            >
                                <ImageIcon size={20} />
                                Select from Gallery
                            </button>

                            {/* Hidden Inputs */}
                            <input
                                type="file"
                                ref={cameraInputRef}
                                onChange={handleFileChange}
                                accept="image/*"
                                capture="environment"
                                className="hidden"
                            />
                            <input
                                type="file"
                                ref={galleryInputRef}
                                onChange={handleFileChange}
                                accept="image/*"
                                className="hidden"
                            />
                        </div>
                    )}

                    <div className="pt-4 flex gap-3">
                        {preview && !isAnalyzing ? (
                            <>
                                <button
                                    onClick={() => { setImage(null); setPreview(null); setDescription(""); }}
                                    className="flex-1 py-6 bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white font-black rounded-[2rem] hover:bg-slate-200 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpload}
                                    className="flex-[2] py-6 bg-blue-600 text-white font-black rounded-[2rem] shadow-[0_20px_40px_rgba(59,130,246,0.3)] hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group"
                                >
                                    Log Nutrition <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                </button>
                            </>
                        ) : null}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
