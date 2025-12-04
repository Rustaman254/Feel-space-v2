'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Smile,
    Frown,
    CloudRain,
    Zap,
    Heart,
    Sun,
    Flame,
    Brain,
    Sparkles,
    Play,
    CheckCircle2,
    Loader2,
} from 'lucide-react';
import { useWeb3 } from '@/hooks/use-web3';

type EmotionKey =
    | 'happy'
    | 'grateful'
    | 'calm'
    | 'excited'
    | 'anxious'
    | 'sad'
    | 'angry'
    | 'tired';

const EMOTION_CONFIG: Record<
    EmotionKey,
    {
        icon: React.ElementType;
        label: string;
        color: string;
        description: string;
        notePrompt: string;
    }
> = {
    happy: {
        icon: Smile,
        label: 'Happy',
        color: 'bg-accent text-black',
        description: 'Light, energized, and hopeful.',
        notePrompt: 'What made you smile today?',
    },
    grateful: {
        icon: Heart,
        label: 'Grateful',
        color: 'bg-pink-400 text-white',
        description: 'Appreciating people, moments, or small wins.',
        notePrompt: 'What are you thankful for right now?',
    },
    calm: {
        icon: Sun,
        label: 'Calm',
        color: 'bg-yellow-200 text-yellow-800',
        description: 'Steady, grounded, present in the moment.',
        notePrompt: 'What is helping you feel grounded?',
    },
    excited: {
        icon: Flame,
        label: 'Excited',
        color: 'bg-orange-400 text-black',
        description: 'Buzzing with anticipation or joy.',
        notePrompt: 'What are you looking forward to?',
    },
    anxious: {
        icon: Zap,
        label: 'Anxious',
        color: 'bg-primary text-white',
        description: 'On edge, worried, or overthinking.',
        notePrompt: 'What thoughts are looping in your mind?',
    },
    sad: {
        icon: CloudRain,
        label: 'Sad',
        color: 'bg-secondary text-white',
        description: 'Heavy, low, or missing something important.',
        notePrompt: 'What feels heavy on your heart?',
    },
    angry: {
        icon: Frown,
        label: 'Frustrated',
        color: 'bg-destructive text-white',
        description: 'Irritated, blocked, or feeling unheard.',
        notePrompt: 'What crossed a boundary for you?',
    },
    tired: {
        icon: Brain,
        label: 'Tired',
        color: 'bg-slate-300 text-slate-700',
        description: 'Drained, foggy, or out of energy.',
        notePrompt: 'What has been draining your energy?',
    },
};

type Step = 1 | 2 | 3 | 4;

export default function MoodJournalGame() {
    const { isConnected, address, logEmotion, balances } = useWeb3();

    const [step, setStep] = useState<Step>(1);
    const [selectedEmotion, setSelectedEmotion] = useState<EmotionKey | null>(
        null
    );
    const [intensity, setIntensity] = useState<number>(5);
    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [txHash, setTxHash] = useState<string | undefined>(undefined);

    useEffect(() => {
        document.title = 'Feel Space | Mood Journal';
    }, []);

    const handleEmotionSelect = (key: EmotionKey) => {
        setSelectedEmotion(key);
        setStep(2);
    };

    const handleNextToNotes = () => {
        if (!selectedEmotion) return;
        setStep(3);
    };

    const handleSubmit = async () => {
        if (!selectedEmotion || !isConnected || !address) {
            return;
        }
        try {
            setSubmitting(true);
            setTxHash(undefined);
            await logEmotion(selectedEmotion, intensity, notes);
            setStep(4);
        } finally {
            setSubmitting(false);
        }
    };

    const handleRestart = () => {
        setSelectedEmotion(null);
        setIntensity(5);
        setNotes('');
        setTxHash(undefined);
        setStep(1);
    };

    const currentEmotionConfig = selectedEmotion
        ? EMOTION_CONFIG[selectedEmotion]
        : null;

    const feelsBalance = balances?.FEELS ?? 0;

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="border-b-2 border-black pb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div>
                    <h1 className="text-5xl font-heading font-black text-black uppercase tracking-tighter">
                        Mood Journal
                    </h1>
                    <p className="text-xl font-bold text-slate-500 mt-2">
                        Turn today&apos;s feelings into a gentle game of self-reflection.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="px-3 py-2 bg-black text-white border-2 border-black rounded-xl flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-accent" />
                        <span className="text-xs font-bold uppercase tracking-wide">
                            FEELS Balance
                        </span>
                        <span className="text-lg font-heading font-black">
                            {feelsBalance.toFixed ? feelsBalance.toFixed(2) : feelsBalance}
                        </span>
                    </div>
                    {!isConnected && (
                        <span className="text-xs font-bold text-red-500">
                            Connect your wallet to earn FEELS.
                        </span>
                    )}
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[2fr,1.2fr]">
                {/* Left: Game steps */}
                <div className="space-y-6">
                    {/* Step indicator */}
                    <div className="flex items-center gap-4">
                        {[1, 2, 3, 4].map((s) => {
                            const active = step === s;
                            const completed = step > (s as Step);
                            return (
                                <div key={s} className="flex items-center gap-2">
                                    <motion.div
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className={`w-8 h-8 rounded-full border-2 border-black flex items-center justify-center font-heading font-black text-sm ${completed
                                            ? 'bg-green-400 text-black'
                                            : active
                                                ? 'bg-black text-accent'
                                                : 'bg-white text-black'
                                            }`}
                                    >
                                        {completed ? <CheckCircle2 className="w-5 h-5" /> : s}
                                    </motion.div>
                                    {s < 4 && (
                                        <div className="w-8 h-1 bg-black/10 rounded-full" />
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Step content */}
                    {step === 1 && (
                        <motion.div
                            key="step-1"
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white border-2 border-black rounded-2xl shadow-flat p-6 md:p-8"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <Play className="w-5 h-5 text-black" />
                                <p className="text-sm font-bold uppercase text-slate-500 tracking-wide">
                                    Step 1 · Pick your core emotion
                                </p>
                            </div>
                            <h2 className="text-2xl font-heading font-black mb-4">
                                What feels most true right now?
                            </h2>
                            <p className="text-sm font-medium text-slate-600 mb-6">
                                Tap the card that best matches your current emotional weather.
                                There is no right or wrong answer—only honest.
                            </p>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {(Object.keys(EMOTION_CONFIG) as EmotionKey[]).map((key) => {
                                    const cfg = EMOTION_CONFIG[key];
                                    const Icon = cfg.icon;
                                    const selected = selectedEmotion === key;

                                    return (
                                        <motion.button
                                            key={key}
                                            whileHover={{ y: -4 }}
                                            whileTap={{ scale: 0.97 }}
                                            onClick={() => handleEmotionSelect(key)}
                                            className={`flex flex-col items-stretch text-left border-2 border-black rounded-xl p-3 shadow-flat transition-all ${selected ? 'bg-black text-white' : 'bg-white'
                                                }`}
                                        >
                                            <div
                                                className={`inline-flex items-center justify-center w-10 h-10 border-2 border-black rounded-lg mb-2 ${selected ? 'bg-accent text-black' : cfg.color
                                                    }`}
                                            >
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <span className="text-xs font-bold uppercase tracking-wide mb-1">
                                                {cfg.label}
                                            </span>
                                            <span className="text-[11px] font-medium text-slate-600 leading-snug">
                                                {cfg.description}
                                            </span>
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && currentEmotionConfig && (
                        <motion.div
                            key="step-2"
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white border-2 border-black rounded-2xl shadow-flat p-6 md:p-8"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <Sun className="w-5 h-5 text-black" />
                                <p className="text-sm font-bold uppercase text-slate-500 tracking-wide">
                                    Step 2 · Set intensity
                                </p>
                            </div>

                            <div className="flex items-center gap-4 mb-4">
                                <div
                                    className={`p-3 border-2 border-black rounded-xl ${currentEmotionConfig.color}`}
                                >
                                    <currentEmotionConfig.icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold uppercase text-slate-500">
                                        You chose
                                    </p>
                                    <p className="text-xl font-heading font-black">
                                        {currentEmotionConfig.label}
                                    </p>
                                </div>
                            </div>

                            <p className="text-sm font-medium text-slate-600 mb-4">
                                On a scale from 1 (barely there) to 10 (all-consuming), how
                                strong does this emotion feel?
                            </p>

                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold uppercase text-slate-500">
                                        Intensity
                                    </span>
                                    <span className="text-sm font-heading font-black">
                                        {intensity}/10
                                    </span>
                                </div>
                                <div className="flex gap-1 mb-2">
                                    {Array.from({ length: 10 }).map((_, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => setIntensity(i + 1)}
                                            className={`flex-1 h-4 rounded-sm border border-black transition-colors ${i + 1 <= intensity
                                                ? 'bg-black'
                                                : 'bg-slate-100 hover:bg-slate-200'
                                                }`}
                                        />
                                    ))}
                                </div>
                                <input
                                    type="range"
                                    min={1}
                                    max={10}
                                    value={intensity}
                                    onChange={(e) => setIntensity(parseInt(e.target.value, 10))}
                                    className="w-full accent-black"
                                />
                                <div className="flex justify-between text-[11px] font-semibold text-slate-500 mt-1">
                                    <span>Gentle</span>
                                    <span>Intense</span>
                                </div>
                            </div>

                            <div className="flex justify-between gap-3">
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="px-4 py-2 text-xs font-bold uppercase border-2 border-black rounded-lg bg-white hover:bg-slate-50"
                                >
                                    Back
                                </button>
                                <button
                                    type="button"
                                    onClick={handleNextToNotes}
                                    className="px-6 py-2 text-xs font-bold uppercase border-2 border-black rounded-lg bg-black text-accent hover:bg-slate-900 flex items-center gap-2"
                                >
                                    Continue
                                    <Sparkles className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && currentEmotionConfig && (
                        <motion.div
                            key="step-3"
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white border-2 border-black rounded-2xl shadow-flat p-6 md:p-8"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <Heart className="w-5 h-5 text-black" />
                                <p className="text-sm font-bold uppercase text-slate-500 tracking-wide">
                                    Step 3 · Add a gentle note
                                </p>
                            </div>

                            <h2 className="text-2xl font-heading font-black mb-2">
                                Give this feeling a few words
                            </h2>
                            <p className="text-sm font-medium text-slate-600 mb-4">
                                You can write as much or as little as you like. This note is for
                                you. FEELS will still be rewarded even if you keep it short.
                            </p>

                            <p className="text-xs font-bold uppercase text-slate-500 mb-2">
                                Prompt
                            </p>
                            <p className="text-sm font-semibold text-slate-700 mb-4">
                                {currentEmotionConfig.notePrompt}
                            </p>

                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={5}
                                className="w-full border-2 border-black rounded-xl p-3 text-sm font-medium text-slate-800 resize-none focus:outline-none focus:ring-2 focus:ring-accent"
                                placeholder="Write a few sentences about what is happening, how it feels in your body, or what you need right now..."
                            />

                            <div className="flex justify-between items-center mt-4 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setStep(2)}
                                    className="px-4 py-2 text-xs font-bold uppercase border-2 border-black rounded-lg bg-white hover:bg-slate-50"
                                >
                                    Back
                                </button>
                                <button
                                    type="button"
                                    disabled={!isConnected || submitting}
                                    onClick={handleSubmit}
                                    className={`px-6 py-2 text-xs font-bold uppercase border-2 border-black rounded-lg flex items-center gap-2 ${!isConnected
                                        ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                                        : 'bg-primary text-white hover:bg-primary/90'
                                        }`}
                                >
                                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {isConnected
                                        ? submitting
                                            ? 'Logging Emotion...'
                                            : '+10 FEELS · Log Emotion'
                                        : 'Connect Wallet to Log'}
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {step === 4 && currentEmotionConfig && (
                        <motion.div
                            key="step-4"
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white border-2 border-black rounded-2xl shadow-flat p-6 md:p-8"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                                <p className="text-sm font-bold uppercase text-slate-500 tracking-wide">
                                    Step 4 · Check-in complete
                                </p>
                            </div>

                            <div className="flex items-center gap-4 mb-4">
                                <div
                                    className={`p-3 border-2 border-black rounded-xl ${currentEmotionConfig.color}`}
                                >
                                    <currentEmotionConfig.icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold uppercase text-slate-500">
                                        You logged
                                    </p>
                                    <p className="text-xl font-heading font-black">
                                        {currentEmotionConfig.label}{' '}
                                        <span className="text-sm font-normal text-slate-500">
                                            ({intensity}/10)
                                        </span>
                                    </p>
                                </div>
                            </div>

                            <div className="bg-green-100 border-2 border-green-800 rounded-xl px-4 py-3 mb-4 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <Sparkles className="w-5 h-5 text-green-800" />
                                    <div>
                                        <p className="text-xs font-bold uppercase text-green-800">
                                            FEELS earned
                                        </p>
                                        <p className="text-lg font-heading font-black text-green-900">
                                            +10 FEELS
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[11px] font-semibold text-green-900">
                                        Thank you for checking in.
                                    </p>
                                    <p className="text-[11px] font-medium text-green-900/70">
                                        Consistent journaling strengthens your emotional muscles.
                                    </p>
                                </div>
                            </div>

                            {txHash && (
                                <p className="text-[11px] font-mono text-slate-500 mb-4 break-all">
                                    Tx Hash: {txHash}
                                </p>
                            )}

                            <button
                                type="button"
                                onClick={handleRestart}
                                className="px-6 py-2 text-xs font-bold uppercase border-2 border-black rounded-lg bg-black text-accent hover:bg-slate-900 flex items-center gap-2"
                            >
                                Play Again
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
                        className="bg-yellow-50 border-2 border-black rounded-2xl p-5 shadow-flat"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="w-4 h-4 text-black" />
                            <p className="text-xs font-bold uppercase text-slate-700 tracking-wide">
                                How this mini-game works
                            </p>
                        </div>
                        <ul className="space-y-2 text-sm font-medium text-slate-700">
                            <li>• Pick the emotion that feels most true right now.</li>
                            <li>• Set how strong it is on a 1–10 scale.</li>
                            <li>• Add a short note to give your feeling a voice.</li>
                            <li>• Earn FEELS for every honest check-in on-chain.</li>
                        </ul>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white border-2 border-black rounded-2xl p-5 shadow-flat"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <Brain className="w-4 h-4 text-black" />
                            <p className="text-xs font-bold uppercase text-slate-700 tracking-wide">
                                Gentle reminders
                            </p>
                        </div>
                        <ul className="space-y-2 text-sm font-medium text-slate-700">
                            <li>• All emotions are valid, even the messy ones.</li>
                            <li>• You can come back and log more than once a day.</li>
                            <li>• Your entries are stored immutably on Celo, under your control.</li>
                            <li>• Sharing how you feel is a quiet form of courage.</li>
                        </ul>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
