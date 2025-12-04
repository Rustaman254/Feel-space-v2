import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface LoadingBarProps {
    message?: string;
    progress?: number; // 0-100, if undefined shows indeterminate
    className?: string;
}

export function LoadingBar({ message = 'Loading...', progress, className = '' }: LoadingBarProps) {
    return (
        <div className={`flex flex-col items-center justify-center gap-4 ${className}`}>
            {/* Loading Message */}
            <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-lg font-black uppercase tracking-wide"
            >
                {message}
            </motion.p>

            {/* Loading Bar Container - Diagonal Corners */}
            <div className="relative w-full max-w-md">
                <div
                    className="h-12 bg-white border-2 border-black shadow-flat overflow-hidden"
                    style={{
                        clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)',
                    }}
                >
                    {/* Progress Bar */}
                    <motion.div
                        className="h-full bg-accent border-r-2 border-black"
                        initial={{ width: 0 }}
                        animate={{
                            width: progress !== undefined ? `${progress}%` : '100%',
                        }}
                        transition={
                            progress !== undefined
                                ? { duration: 0.3 }
                                : {
                                    duration: 1.5,
                                    repeat: Infinity,
                                    ease: 'easeInOut',
                                    repeatType: 'reverse',
                                }
                        }
                    />
                </div>

                {/* Animated Dots */}
                {progress === undefined && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-2">
                        {[0, 1, 2].map((i) => (
                            <motion.div
                                key={i}
                                className="w-2 h-2 bg-black rounded-full"
                                animate={{
                                    scale: [1, 1.5, 1],
                                    opacity: [0.5, 1, 0.5],
                                }}
                                transition={{
                                    duration: 1,
                                    repeat: Infinity,
                                    delay: i * 0.2,
                                }}
                            />
                        ))}
                    </div>
                )}

                {/* Progress Percentage */}
                {progress !== undefined && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        <span className="text-sm font-black text-black drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]">
                            {Math.round(progress)}%
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}

interface TransactionLoadingProps {
    step: 'signing' | 'confirming' | 'processing' | 'success';
    message?: string;
}

export function TransactionLoading({ step, message }: TransactionLoadingProps) {
    const stepMessages = {
        signing: message || 'Please sign the transaction in your wallet...',
        confirming: message || 'Confirming transaction...',
        processing: message || 'Processing on blockchain...',
        success: message || 'Transaction successful!',
    };

    const stepProgress = {
        signing: 25,
        confirming: 50,
        processing: 75,
        success: 100,
    };

    return (
        <div className="flex flex-col items-center justify-center gap-6 p-8">
            {/* Wallet Icon Animation */}
            {step === 'signing' && (
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                    }}
                    className="p-6 bg-gradient-to-br from-primary/20 to-secondary/20 border-2 border-black rounded-2xl shadow-flat"
                >
                    <Loader2 className="w-12 h-12 text-primary animate-spin" />
                </motion.div>
            )}

            <LoadingBar message={stepMessages[step]} progress={stepProgress[step]} />

            {step === 'signing' && (
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm font-bold text-slate-500 text-center max-w-sm"
                >
                    Check your wallet for a transaction approval request
                </motion.p>
            )}

            {step === 'success' && (
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    className="text-6xl"
                >
                    🎉
                </motion.div>
            )}
        </div>
    );
}

interface FullPageLoadingProps {
    message?: string;
    subMessage?: string;
}

export function FullPageLoading({ message = 'Loading...', subMessage }: FullPageLoadingProps) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-8 bg-gradient-to-br from-accent/30 to-primary/30 border-2 border-black rounded-2xl shadow-flat"
            >
                <Loader2 className="w-16 h-16 text-primary animate-spin" />
            </motion.div>

            <LoadingBar message={message} className="w-full max-w-md px-4" />

            {subMessage && (
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-sm font-bold text-slate-500 text-center max-w-sm px-4"
                >
                    {subMessage}
                </motion.p>
            )}
        </div>
    );
}
