"use client";

import { useState, useRef } from "react";
import { Camera, Upload, X, Send, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function MealLogger({ onClose, onComplete }: { onClose: () => void, onComplete: () => void }) {
    const [image, setImage] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [description, setDescription] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

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
            className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm z-50 flex flex-col p-6"
        >
            <div className="flex justify-between items-center text-white mb-8">
                <h3 className="text-xl font-bold">Log New Meal</h3>
                <button onClick={onClose} className="p-2 bg-white/10 rounded-full"><X size={24} /></button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center">
                {preview ? (
                    <div className="w-full space-y-6">
                        <div className="w-full aspect-square bg-slate-800 rounded-[2.5rem] overflow-hidden border-4 border-white/10 relative shadow-2xl">
                            <img src={preview} className="w-full h-full object-cover" alt="Preview" />
                            {isAnalyzing && (
                                <div className="absolute inset-0 bg-blue-600/40 flex flex-col items-center justify-center text-white">
                                    <Sparkles size={48} className="animate-pulse mb-4" />
                                    <p className="font-bold">Gemini is analyzing...</p>
                                </div>
                            )}
                        </div>

                        {!isAnalyzing && (
                            <div className="w-full space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Optional Details</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Add ingredients, brand, or context..."
                                    className="w-full p-6 bg-white/5 rounded-2xl border-2 border-transparent focus:border-blue-600 focus:bg-white/10 outline-none text-white transition-all resize-none h-24"
                                />
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-6 w-full">
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full aspect-[4/3] bg-white/5 rounded-[2.5rem] border-4 border-dashed border-white/10 flex flex-col items-center justify-center text-slate-400 hover:bg-white/10 hover:border-white/20 transition-all group"
                        >
                            <Camera size={48} className="mb-4 group-hover:scale-110 transition-transform" />
                            <p className="font-bold">Take Photo or Upload</p>
                            <p className="text-xs opacity-60 mt-2">Mobile camera supported</p>
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            capture="environment"
                            className="hidden"
                        />
                    </div>
                )}
            </div>

            <div className="mt-8 space-y-4">
                {preview && !isAnalyzing && (
                    <div className="flex gap-4">
                        <button
                            onClick={() => { setImage(null); setPreview(null); setDescription(""); }}
                            className="flex-1 py-5 bg-white/10 text-white font-bold rounded-2xl hover:bg-white/20 transition-all"
                        >
                            Retake
                        </button>
                        <button
                            onClick={handleUpload}
                            className="flex-[2] py-5 bg-blue-600 text-white font-bold rounded-2xl shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-3"
                        >
                            Analyze Meal <Send size={20} />
                        </button>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
