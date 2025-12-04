import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { TransactionLoading } from '@/components/ui/loading';

interface EmotionDialogProps {
    isOpen: boolean;
    onClose: () => void;
    emotion: {
        id: string;
        label: string;
        icon: React.ComponentType<{ className?: string }>;
        color: string;
        description: string;
    } | null;
    onConfirm: (intensity: number, reason: string) => Promise<void>;
    isLoading?: boolean;
    transactionStep?: 'signing' | 'confirming' | 'processing' | 'success';
}

export function EmotionDialog({ isOpen, onClose, emotion, onConfirm, isLoading = false, transactionStep }: EmotionDialogProps) {
    const [intensity, setIntensity] = useState<number>(5);
    const [reason, setReason] = useState<string>('');

    if (!emotion) return null;

    const Icon = emotion.icon;

    const handleConfirm = async () => {
        await onConfirm(intensity, reason);
        // Reset for next time (only if successful)
        if (!isLoading) {
            setIntensity(5);
            setReason('');
        }
    };

    const handleClose = () => {
        // Don't allow closing during transaction
        if (isLoading) return;

        // Reset on close
        setIntensity(5);
        setReason('');
        onClose();
    };

    const intensityLabels = [
        'Very Low',
        'Low',
        'Mild',
        'Moderate',
        'Medium',
        'Strong',
        'Very Strong',
        'Intense',
        'Very Intense',
        'Extreme'
    ];

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px] border-2 border-black shadow-flat">
                {isLoading && transactionStep ? (
                    // Transaction Loading State
                    <div className="py-8">
                        <TransactionLoading step={transactionStep} />
                    </div>
                ) : (
                    <>
                        <DialogHeader>
                            <div className="flex items-center gap-3 mb-2">
                                <div className={`w-14 h-14 rounded-full border-2 border-black flex items-center justify-center ${emotion.color} shadow-sm`}>
                                    <Icon className="w-7 h-7" />
                                </div>
                                <div>
                                    <DialogTitle className="text-2xl font-black uppercase tracking-tight">
                                        {emotion.label}
                                    </DialogTitle>
                                    <DialogDescription className="text-sm font-bold text-slate-500">
                                        {emotion.description}
                                    </DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>

                        <div className="space-y-6 py-4">
                            {/* Intensity Selector - Game-like */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <Label htmlFor="intensity" className="text-base font-bold">
                                        Intensity Level
                                    </Label>
                                    <span className="text-sm font-black text-primary px-3 py-1 bg-primary/10 rounded-full border border-primary">
                                        {intensity}/10 - {intensityLabels[intensity - 1]}
                                    </span>
                                </div>

                                {/* Game-like Block Selector */}
                                <div className="grid grid-cols-10 gap-2">
                                    {Array.from({ length: 10 }).map((_, i) => {
                                        const level = i + 1;
                                        const isSelected = level <= intensity;
                                        const isActive = level === intensity;

                                        return (
                                            <motion.button
                                                key={level}
                                                type="button"
                                                onClick={() => setIntensity(level)}
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.95 }}
                                                className={`
                                                    aspect-square rounded-lg border-2 border-black font-black text-xs
                                                    transition-all duration-200
                                                    ${isSelected
                                                        ? 'bg-accent text-black shadow-flat'
                                                        : 'bg-white text-slate-400 hover:bg-slate-50'
                                                    }
                                                    ${isActive ? 'ring-2 ring-primary ring-offset-2' : ''}
                                                `}
                                            >
                                                {level}
                                            </motion.button>
                                        );
                                    })}
                                </div>

                                <div className="flex justify-between text-xs font-bold text-slate-400 px-1">
                                    <span>Low</span>
                                    <span>High</span>
                                </div>
                            </div>

                            {/* Optional Reason */}
                            <div className="space-y-2">
                                <Label htmlFor="reason" className="text-base font-bold">
                                    Reason <span className="text-slate-400 font-normal text-sm">(Optional)</span>
                                </Label>
                                <Textarea
                                    id="reason"
                                    placeholder="What's making you feel this way? (optional)"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    className="min-h-[100px] border-2 border-black resize-none font-medium"
                                    maxLength={500}
                                />
                                <p className="text-xs text-slate-400 font-bold text-right">
                                    {reason.length}/500 characters
                                </p>
                            </div>
                        </div>

                        <DialogFooter className="gap-2">
                            <Button
                                variant="outline"
                                onClick={handleClose}
                                className="border-2 border-black font-bold hover:bg-slate-100"
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleConfirm}
                                className="bg-black text-white font-bold border-2 border-black shadow-flat hover:shadow-flat-sm hover:translate-y-[1px]"
                                disabled={isLoading}
                            >
                                Log Emotion +10 FEELS
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
