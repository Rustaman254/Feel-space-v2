import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTutorial } from '@/contexts/TutorialContext';

interface TutorialStep {
    title: string;
    description: string;
    targetId?: string;
    position: 'top' | 'bottom' | 'left' | 'right' | 'center';
    highlightArea?: {
        top: string;
        left: string;
        width: string;
        height: string;
    };
}

const tutorialSteps: TutorialStep[] = [
    {
        title: 'Welcome to Feel Space! 🎮',
        description: 'Your emotional wellness journey starts here. Track your emotions, play therapeutic games, and earn rewards on the blockchain!',
        position: 'center',
    },
    {
        title: 'Log Your Emotions',
        description: 'Click on any emotion card to log how you\'re feeling. Choose your intensity level and add optional notes. You\'ll earn 10 FEELS tokens for each log!',
        targetId: 'emotion-grid',
        position: 'top',
    },
    {
        title: 'Play Therapeutic Games',
        description: 'Visit the Arcade to play games designed to regulate your emotions. Each game completion earns you rewards and helps improve your mood!',
        targetId: 'nav-games',
        position: 'bottom',
    },
    {
        title: 'Track Your Progress',
        description: 'View your complete emotion logging history with timestamps, notes, and blockchain transaction hashes. Filter and search through your entries!',
        targetId: 'nav-history',
        position: 'bottom',
    },
    {
        title: 'Discover Insights',
        description: 'Get personalized insights about your emotional patterns. See trends, time-of-day patterns, and receive game recommendations based on your mood!',
        targetId: 'nav-insights',
        position: 'bottom',
    },
    {
        title: 'Join the Community',
        description: 'Connect with others on their wellness journey. Share experiences and support each other in the Feel Space community!',
        targetId: 'nav-community',
        position: 'bottom',
    },
    {
        title: 'You\'re All Set! 🚀',
        description: 'Start by logging your current emotion. Your journey to better emotional wellness begins now. Remember, consistency is key!',
        position: 'center',
    },
];

export function TutorialOverlay() {
    const { isActive, currentStep, totalSteps, nextStep, prevStep, skipTutorial } = useTutorial();

    if (!isActive) return null;

    const step = tutorialSteps[currentStep];
    const isFirstStep = currentStep === 0;
    const isLastStep = currentStep === totalSteps - 1;

    // Get target element position if targetId exists
    const getTargetPosition = () => {
        if (!step.targetId) return null;

        const element = document.getElementById(step.targetId);
        if (!element) return null;

        const rect = element.getBoundingClientRect();
        return {
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
        };
    };

    const targetPos = getTargetPosition();

    // Calculate tooltip position based on target and position preference
    const getTooltipStyle = () => {
        if (step.position === 'center' || !targetPos) {
            return {
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
            };
        }

        const offset = 20;
        let style: any = {};

        switch (step.position) {
            case 'top':
                style = {
                    top: `${targetPos.top - offset}px`,
                    left: `${targetPos.left + targetPos.width / 2}px`,
                    transform: 'translate(-50%, -100%)',
                };
                break;
            case 'bottom':
                style = {
                    top: `${targetPos.top + targetPos.height + offset}px`,
                    left: `${targetPos.left + targetPos.width / 2}px`,
                    transform: 'translateX(-50%)',
                };
                break;
            case 'left':
                style = {
                    top: `${targetPos.top + targetPos.height / 2}px`,
                    left: `${targetPos.left - offset}px`,
                    transform: 'translate(-100%, -50%)',
                };
                break;
            case 'right':
                style = {
                    top: `${targetPos.top + targetPos.height / 2}px`,
                    left: `${targetPos.left + targetPos.width + offset}px`,
                    transform: 'translateY(-50%)',
                };
                break;
        }

        return style;
    };

    return (
        <AnimatePresence>
            {isActive && (
                <>
                    {/* Backdrop with spotlight effect */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100]"
                        style={{
                            background: targetPos
                                ? `radial-gradient(circle at ${targetPos.left + targetPos.width / 2}px ${targetPos.top + targetPos.height / 2}px, transparent 0%, transparent ${Math.max(targetPos.width, targetPos.height) / 2 + 20}px, rgba(0,0,0,0.7) ${Math.max(targetPos.width, targetPos.height) / 2 + 100}px)`
                                : 'rgba(0, 0, 0, 0.7)',
                        }}
                    />

                    {/* Highlight border around target */}
                    {targetPos && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="fixed z-[101] border-4 border-accent rounded-xl pointer-events-none"
                            style={{
                                top: `${targetPos.top - 8}px`,
                                left: `${targetPos.left - 8}px`,
                                width: `${targetPos.width + 16}px`,
                                height: `${targetPos.height + 16}px`,
                                boxShadow: '0 0 0 4px rgba(0,0,0,0.3), 0 0 20px rgba(251, 191, 36, 0.5)',
                            }}
                        />
                    )}

                    {/* Tutorial Card */}
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed z-[102] bg-white border-4 border-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 max-w-md w-[90vw] md:w-full"
                        style={getTooltipStyle()}
                    >
                        {/* Close button */}
                        <button
                            onClick={skipTutorial}
                            className="absolute top-3 right-3 p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Icon */}
                        <div className="flex justify-center mb-4">
                            <div className="p-3 bg-accent border-2 border-black rounded-full">
                                <Sparkles className="w-8 h-8 text-black" />
                            </div>
                        </div>

                        {/* Content */}
                        <div className="text-center space-y-3 mb-6">
                            <h3 className="text-2xl font-black font-heading uppercase tracking-tight">
                                {step.title}
                            </h3>
                            <p className="text-base font-bold text-slate-600 leading-relaxed">
                                {step.description}
                            </p>
                        </div>

                        {/* Progress indicator */}
                        <div className="flex justify-center gap-2 mb-6">
                            {Array.from({ length: totalSteps }).map((_, i) => (
                                <div
                                    key={i}
                                    className={`h-2 rounded-full border-2 border-black transition-all ${i === currentStep
                                            ? 'w-8 bg-accent'
                                            : i < currentStep
                                                ? 'w-2 bg-black'
                                                : 'w-2 bg-white'
                                        }`}
                                />
                            ))}
                        </div>

                        {/* Navigation */}
                        <div className="flex gap-3">
                            {!isFirstStep && (
                                <Button
                                    onClick={prevStep}
                                    variant="outline"
                                    className="flex-1 border-2 border-black font-bold shadow-flat-sm hover:shadow-none hover:translate-y-[2px] transition-all"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Back
                                </Button>
                            )}
                            <Button
                                onClick={nextStep}
                                className={`${isFirstStep ? 'flex-1' : 'flex-1'} bg-black text-white font-bold border-2 border-black shadow-flat-sm hover:shadow-none hover:translate-y-[2px] transition-all`}
                            >
                                {isLastStep ? 'Get Started!' : 'Next'}
                                {!isLastStep && <ArrowRight className="w-4 h-4 ml-2" />}
                            </Button>
                        </div>

                        {/* Skip option */}
                        <button
                            onClick={skipTutorial}
                            className="w-full mt-3 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            Skip Tutorial
                        </button>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
