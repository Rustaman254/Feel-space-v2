import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DisconnectDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export function DisconnectDialog({ isOpen, onClose, onConfirm }: DisconnectDialogProps) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                    >
                        {/* Dialog */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white border-4 border-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-md w-full p-6 relative"
                        >
                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            {/* Icon */}
                            <div className="flex justify-center mb-4">
                                <div className="p-4 bg-destructive/10 border-2 border-black rounded-full">
                                    <AlertTriangle className="w-12 h-12 text-destructive" />
                                </div>
                            </div>

                            {/* Content */}
                            <div className="text-center space-y-3 mb-6">
                                <h2 className="text-2xl font-black font-heading uppercase tracking-tight">
                                    Disconnect Wallet?
                                </h2>
                                <p className="text-base font-bold text-slate-600">
                                    Are you sure you want to disconnect your wallet?
                                </p>
                                <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-3 mt-4">
                                    <p className="text-sm font-bold text-yellow-800">
                                        ⚠️ All local data will be cleared
                                    </p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <Button
                                    onClick={onClose}
                                    variant="outline"
                                    className="flex-1 border-2 border-black font-bold hover:bg-slate-100 shadow-flat-sm hover:shadow-none hover:translate-y-[2px] transition-all"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={onConfirm}
                                    className="flex-1 bg-destructive text-white font-bold border-2 border-black shadow-flat-sm hover:shadow-none hover:translate-y-[2px] transition-all"
                                >
                                    Disconnect
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
