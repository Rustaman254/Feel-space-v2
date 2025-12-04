'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Leaf,
    Droplets,
    Wind,
    Sparkles,
    Play,
    Pause,
    CheckCircle2,
    Loader2,
    Trees,
    Star,
    Waves,
    Moon,
} from 'lucide-react';
import { useWeb3 } from '@/hooks/use-web3';

type GardenItemType = 'stone' | 'plant' | 'ripple';

interface GardenItem {
    id: string;
    type: GardenItemType;
    x: number;
    y: number;
    rotation: number;
    size: number;
}

type Phase = 'intro' | 'play' | 'reflect' | 'complete';

export default function ZenGardenGame() {
    const { isConnected, address, logEmotion } = useWeb3();

    const [phase, setPhase] = useState<Phase>('intro');
    const [items, setItems] = useState<GardenItem[]>([]);
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
    const [isBreathing, setIsBreathing] = useState(true);
    const [reflectionNote, setReflectionNote] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [emotionChoice, setEmotionChoice] = useState<'calm' | 'grateful'>(
        'calm'
    );

    useEffect(() => {
        document.title = 'Feel Space | Zen Garden';
    }, []);

    // Initialize a few items in the garden
    useEffect(() => {
        const initial: GardenItem[] = [
            {
                id: 'stone-1',
                type: 'stone',
                x: 20,
                y: 65,
                rotation: -8,
                size: 1,
            },
            {
                id: 'stone-2',
                type: 'stone',
                x: 55,
                y: 60,
                rotation: 6,
                size: 1.15,
            },
            {
                id: 'plant-1',
                type: 'plant',
                x: 30,
                y: 30,
                rotation: 0,
                size: 1,
            },
            {
                id: 'plant-2',
                type: 'plant',
                x: 70,
                y: 40,
                rotation: -3,
                size: 1.1,
            },
            {
                id: 'ripple-1',
                type: 'ripple',
                x: 45,
                y: 45,
                rotation: 0,
                size: 1.1,
            },
        ];
        setItems(initial);
    }, []);

    const handleStart = () => {
        setPhase('play');
    };

    const handleDoneArranging = () => {
        setPhase('reflect');
    };

    const handleLogCalm = async () => {
        if (!isConnected || !address) return;
        try {
            setSubmitting(true);
            setEmotionChoice('calm');
            await logEmotion('calm', 7, reflectionNote || 'Zen garden session');
            setPhase('complete');
        } finally {
            setSubmitting(false);
        }
    };

    const handleLogGrateful = async () => {
        if (!isConnected || !address) return;
        try {
            setSubmitting(true);
            setEmotionChoice('grateful');
            await logEmotion('grateful', 8, reflectionNote || 'Zen garden gratitude');
            setPhase('complete');
        } finally {
            setSubmitting(false);
        }
    };

    const handlePlayAgain = () => {
        setPhase('intro');
        setReflectionNote('');
        setSelectedItemId(null);
        setIsBreathing(true);
    };

    const handleDragEnd = (
        id: string,
        event: MouseEvent | TouchEvent | PointerEvent,
        info: { point: { x: number; y: number } }
    ) => {
        const container = document.getElementById('zen-garden-container');
        if (!container) return;

        const rect = container.getBoundingClientRect();
        const relX = ((info.point.x - rect.left) / rect.width) * 100;
        const relY = ((info.point.y - rect.top) / rect.height) * 100;

        setItems((prev) =>
            prev.map((item) =>
                item.id === id
                    ? {
                        ...item,
                        x: Math.min(90, Math.max(10, relX)),
                        y: Math.min(85, Math.max(15, relY)),
                    }
                    : item
            )
        );
    };

    const renderItemIcon = (item: GardenItem) => {
        const base = 'w-6 h-6';
        if (item.type === 'stone') {
            return <Waves className={base} />;
        }
        if (item.type === 'plant') {
            return <Trees className={base} />;
        }
        return <Star className={base} />;
    };

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="border-b-2 border-black pb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div>
                    <h1 className="text-5xl font-heading font-black text-black uppercase tracking-tighter">
                        Zen Garden
                    </h1>
                    <p className="text-xl font-bold text-slate-500 mt-2">
                        Arrange your quiet space, breathe with the garden, and leave calmer
                        than you arrived.
                    </p>
                </div>

                <div className="flex flex-col items-end gap-2">
                    {!isConnected && (
                        <p className="text-xs font-bold text-red-500">
                            Connect your wallet to earn FEELS after your session.
                        </p>
                    )}
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                        <Droplets className="w-4 h-4" />
                        <span>Breathe in as the circle expands, breathe out as it softens.</span>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[2fr,1.2fr]">
                {/* Left: Garden & breathing */}
                <div className="space-y-4">
                    {/* Instructions / Objectives */}
                    {phase === 'intro' && (
                        <motion.div
                            key="zen-intro"
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white border-2 border-black rounded-2xl shadow-flat p-6 md:p-8"
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <Leaf className="w-5 h-5 text-black" />
                                <p className="text-sm font-bold uppercase text-slate-500 tracking-wide">
                                    How to play · Objectives
                                </p>
                            </div>
                            <h2 className="text-2xl font-heading font-black mb-3">
                                Build your tiny, tranquil world
                            </h2>
                            <ul className="space-y-2 text-sm font-medium text-slate-700 mb-6">
                                <li>
                                    • Drag stones, plants, and ripples to arrange your perfect
                                    mini-garden.
                                </li>
                                <li>
                                    • Follow the breathing circle: inhale as it grows, exhale as it
                                    shrinks.
                                </li>
                                <li>
                                    • When you feel a little softer inside, write a short reflection.
                                </li>
                                <li>
                                    • Optionally log a calm or grateful check-in on-chain to earn
                                    FEELS.
                                </li>
                            </ul>
                            <button
                                type="button"
                                onClick={handleStart}
                                className="px-6 py-2 text-xs font-bold uppercase border-2 border-black rounded-lg bg-black text-accent hover:bg-slate-900 flex items-center gap-2"
                            >
                                Begin Zen Session
                                <Play className="w-4 h-4" />
                            </button>
                        </motion.div>
                    )}

                    {/* Garden & breathing surface */}
                    {(phase === 'play' || phase === 'reflect' || phase === 'complete') && (
                        <motion.div
                            key="zen-garden"
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gradient-to-br from-slate-50 via-emerald-50 to-sky-50 border-2 border-black rounded-2xl shadow-flat p-4 md:p-6"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <Wind className="w-4 h-4 text-black" />
                                    <p className="text-xs font-bold uppercase text-slate-600 tracking-wide">
                                        Zen Garden Canvas
                                    </p>
                                </div>
                                {phase === 'play' && (
                                    <button
                                        type="button"
                                        onClick={handleDoneArranging}
                                        className="px-4 py-1.5 text-[11px] font-bold uppercase border-2 border-black rounded-lg bg-white hover:bg-slate-50 flex items-center gap-1"
                                    >
                                        I Feel Calmer
                                        <CheckCircle2 className="w-3 h-3" />
                                    </button>
                                )}
                            </div>

                            <div className="grid gap-4 md:grid-cols-[3fr,1.4fr]">
                                {/* Garden area */}
                                <div
                                    id="zen-garden-container"
                                    className="relative overflow-hidden border-2 border-black rounded-2xl bg-emerald-50/60 h-72 md:h-80 shadow-inner"
                                >
                                    {/* Sand stripes */}
                                    <div className="absolute inset-0 bg-[repeating-linear-gradient(135deg,#ecfdf3, #ecfdf3 10px,#d9f99d 11px,#d9f99d 12px)] opacity-60 pointer-events-none" />

                                    {/* Garden items */}
                                    {items.map((item) => (
                                        <motion.div
                                            key={item.id}
                                            drag={phase === 'play'}
                                            dragMomentum={false}
                                            onDragEnd={handleDragEnd.bind(null, item.id)}
                                            onMouseDown={() => setSelectedItemId(item.id)}
                                            onTouchStart={() => setSelectedItemId(item.id)}
                                            className={`absolute cursor-grab active:cursor-grabbing`}
                                            style={{
                                                left: `${item.x}%`,
                                                top: `${item.y}%`,
                                                x: '-50%',
                                                y: '-50%',
                                                rotate: item.rotation,
                                                zIndex: selectedItemId === item.id ? 20 : 10,
                                            }}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.97 }}
                                        >
                                            <div
                                                className={`border-2 border-black rounded-xl bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-flat`}
                                                style={{
                                                    width: `${40 * item.size}px`,
                                                    height: `${40 * item.size}px`,
                                                }}
                                            >
                                                {renderItemIcon(item)}
                                            </div>
                                        </motion.div>
                                    ))}

                                    {/* Breathing circle */}
                                    <AnimatePresence>
                                        {(phase === 'play' || phase === 'reflect') && (
                                            <motion.div
                                                key="breath"
                                                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                                            >
                                                <motion.div
                                                    animate={
                                                        isBreathing
                                                            ? {
                                                                scale: [0.8, 1.1, 0.8],
                                                                opacity: [0.6, 1, 0.6],
                                                            }
                                                            : {}
                                                    }
                                                    transition={
                                                        isBreathing
                                                            ? {
                                                                duration: 8,
                                                                repeat: Infinity,
                                                                ease: 'easeInOut',
                                                            }
                                                            : {}
                                                    }
                                                    className="w-40 h-40 md:w-48 md:h-48 rounded-full border-[3px] border-black bg-emerald-100/70 flex items-center justify-center shadow-flat"
                                                >
                                                    <div className="text-center px-4">
                                                        <p className="text-[11px] font-bold uppercase text-slate-700 mb-1">
                                                            Breathe with the garden
                                                        </p>
                                                        <p className="text-xs font-medium text-slate-700">
                                                            Inhale as the circle grows. Exhale as it softens.
                                                        </p>
                                                    </div>
                                                </motion.div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Controls / phase info */}
                                <div className="flex flex-col gap-3">
                                    <div className="bg-white border-2 border-black rounded-xl p-3 shadow-flat">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Moon className="w-4 h-4 text-black" />
                                            <p className="text-[11px] font-bold uppercase text-slate-600 tracking-wide">
                                                Session status
                                            </p>
                                        </div>
                                        <p className="text-sm font-medium text-slate-700 mb-2">
                                            {phase === 'play' &&
                                                'Gently drag items until the scene feels soothing.'}
                                            {phase === 'reflect' &&
                                                'Take a moment to notice how your body feels now.'}
                                            {phase === 'complete' &&
                                                'Your calm check-in has been recorded. Thank you.'}
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <button
                                                type="button"
                                                onClick={() => setIsBreathing((prev) => !prev)}
                                                className="px-3 py-1.5 text-[11px] font-bold uppercase border-2 border-black rounded-lg bg-emerald-100 hover:bg-emerald-200 flex items-center gap-1"
                                            >
                                                {isBreathing ? (
                                                    <>
                                                        <Pause className="w-3 h-3" />
                                                        Pause Breath
                                                    </>
                                                ) : (
                                                    <>
                                                        <Play className="w-3 h-3" />
                                                        Resume Breath
                                                    </>
                                                )}
                                            </button>
                                            <span className="text-[10px] font-semibold text-slate-500">
                                                Tiny moves, gentle breaths.
                                            </span>
                                        </div>
                                    </div>

                                    {phase === 'play' && (
                                        <div className="bg-sky-50 border-2 border-black rounded-xl p-3 shadow-flat">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Waves className="w-4 h-4 text-black" />
                                                <p className="text-[11px] font-bold uppercase text-slate-600 tracking-wide">
                                                    Tips
                                                </p>
                                            </div>
                                            <ul className="space-y-1 text-[11px] font-medium text-slate-700">
                                                <li>• Cluster stones for stability.</li>
                                                <li>• Place plants near edges for softness.</li>
                                                <li>• Keep ripples near the center for focus.</li>
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Reflection & logging */}
                    {phase === 'reflect' && (
                        <motion.div
                            key="zen-reflect"
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white border-2 border-black rounded-2xl shadow-flat p-6 md:p-8"
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <Sparkles className="w-5 h-5 text-black" />
                                <p className="text-sm font-bold uppercase text-slate-500 tracking-wide">
                                    Reflection · Optional FEELS reward
                                </p>
                            </div>
                            <h2 className="text-2xl font-heading font-black mb-2">
                                What feels different after the garden?
                            </h2>
                            <p className="text-sm font-medium text-slate-600 mb-4">
                                In a few lines, describe how you feel now compared to when you
                                started. This helps your brain recognize the shift you created.
                            </p>
                            <textarea
                                value={reflectionNote}
                                onChange={(e) => setReflectionNote(e.target.value)}
                                rows={4}
                                className="w-full border-2 border-black rounded-xl p-3 text-sm font-medium text-slate-800 resize-none focus:outline-none focus:ring-2 focus:ring-accent mb-4"
                                placeholder="Example: My shoulders feel softer and my thoughts are a bit slower..."
                            />

                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                <p className="text-xs font-semibold text-slate-500">
                                    When you are ready, you can log this as a calm or grateful
                                    moment and earn FEELS.
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        disabled={!isConnected || submitting}
                                        onClick={handleLogCalm}
                                        className={`px-4 py-2 text-[11px] font-bold uppercase border-2 border-black rounded-lg flex items-center gap-1 ${!isConnected
                                                ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                                                : 'bg-emerald-500 text-black hover:bg-emerald-400'
                                            }`}
                                    >
                                        {submitting && emotionChoice === 'calm' && (
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                        )}
                                        Log Calm +10 FEELS
                                    </button>
                                    <button
                                        type="button"
                                        disabled={!isConnected || submitting}
                                        onClick={handleLogGrateful}
                                        className={`px-4 py-2 text-[11px] font-bold uppercase border-2 border-black rounded-lg flex items-center gap-1 ${!isConnected
                                                ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                                                : 'bg-yellow-400 text-black hover:bg-yellow-300'
                                            }`}
                                    >
                                        {submitting && emotionChoice === 'grateful' && (
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                        )}
                                        Log Grateful +10 FEELS
                                    </button>
                                    {!isConnected && (
                                        <span className="text-[11px] font-semibold text-red-500">
                                            Connect wallet to earn FEELS.
                                        </span>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {phase === 'complete' && (
                        <motion.div
                            key="zen-complete"
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white border-2 border-black rounded-2xl shadow-flat p-6 md:p-8"
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                                <p className="text-sm font-bold uppercase text-slate-500 tracking-wide">
                                    Session complete
                                </p>
                            </div>
                            <h2 className="text-2xl font-heading font-black mb-2">
                                Your {emotionChoice === 'calm' ? 'calm' : 'gratitude'} has been
                                recorded.
                            </h2>
                            <p className="text-sm font-medium text-slate-600 mb-4">
                                Thank you for giving yourself a few quiet minutes. Your garden,
                                your breath, and your words are now part of your emotional
                                journey on-chain.
                            </p>
                            <button
                                type="button"
                                onClick={handlePlayAgain}
                                className="px-6 py-2 text-xs font-bold uppercase border-2 border-black rounded-lg bg-black text-accent hover:bg-slate-900 flex items-center gap-2"
                            >
                                Create Another Garden
                                <Play className="w-4 h-4" />
                            </button>
                        </motion.div>
                    )}
                </div>

                {/* Right: Supportive sidebar */}
                <div className="space-y-4">
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white border-2 border-black rounded-2xl p-5 shadow-flat"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <Leaf className="w-4 h-4 text-black" />
                            <p className="text-[11px] font-bold uppercase text-slate-700 tracking-wide">
                                Why a zen garden?
                            </p>
                        </div>
                        <ul className="space-y-2 text-sm font-medium text-slate-700">
                            <li>• Small physical actions help slow racing thoughts.</li>
                            <li>• Repetition (drag, breathe, notice) soothes the nervous system.</li>
                            <li>• A tiny visual ritual makes it easier to return tomorrow.</li>
                        </ul>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 }}
                        className="bg-slate-50 border-2 border-black rounded-2xl p-5 shadow-flat"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <Star className="w-4 h-4 text-black" />
                            <p className="text-[11px] font-bold uppercase text-slate-700 tracking-wide">
                                Gentle ground rules
                            </p>
                        </div>
                        <ul className="space-y-2 text-sm font-medium text-slate-700">
                            <li>• There is no perfect layout—only what feels a bit softer.</li>
                            <li>• If your mind wanders, that is okay; just notice and return.</li>
                            <li>• You can exit anytime. The garden will be here when you return.</li>
                        </ul>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
