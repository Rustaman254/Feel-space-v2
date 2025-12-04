import React, { createContext, useContext, useState, useEffect } from 'react';

interface TutorialContextType {
    isActive: boolean;
    currentStep: number;
    totalSteps: number;
    startTutorial: () => void;
    nextStep: () => void;
    prevStep: () => void;
    skipTutorial: () => void;
    completeTutorial: () => void;
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

export function TutorialProvider({ children }: { children: React.ReactNode }) {
    const [isActive, setIsActive] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const totalSteps = 7; // Total number of tutorial steps

    useEffect(() => {
        // Check if user has completed tutorial before
        const hasCompletedTutorial = localStorage.getItem('feel-space-tutorial-completed');
        const hasConnectedBefore = localStorage.getItem('feel-space-has-connected');

        // Auto-start tutorial for first-time users after they connect wallet
        if (!hasCompletedTutorial && hasConnectedBefore) {
            const timer = setTimeout(() => {
                setIsActive(true);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const startTutorial = () => {
        setIsActive(true);
        setCurrentStep(0);
    };

    const nextStep = () => {
        if (currentStep < totalSteps - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            completeTutorial();
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const skipTutorial = () => {
        setIsActive(false);
        localStorage.setItem('feel-space-tutorial-completed', 'true');
    };

    const completeTutorial = () => {
        setIsActive(false);
        setCurrentStep(0);
        localStorage.setItem('feel-space-tutorial-completed', 'true');
    };

    return (
        <TutorialContext.Provider
            value={{
                isActive,
                currentStep,
                totalSteps,
                startTutorial,
                nextStep,
                prevStep,
                skipTutorial,
                completeTutorial,
            }}
        >
            {children}
        </TutorialContext.Provider>
    );
}

export function useTutorial() {
    const context = useContext(TutorialContext);
    if (context === undefined) {
        throw new Error('useTutorial must be used within a TutorialProvider');
    }
    return context;
}
