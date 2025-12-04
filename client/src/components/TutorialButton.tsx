import React from 'react';
import { HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTutorial } from '@/contexts/TutorialContext';

export function TutorialButton() {
    const { startTutorial } = useTutorial();

    return (
        <Button
            onClick={startTutorial}
            variant="outline"
            size="sm"
            className="fixed bottom-24 md:bottom-8 right-4 z-50 border-2 border-black font-bold shadow-flat hover:shadow-flat-sm hover:translate-y-[2px] transition-all bg-white"
            title="Start Tutorial"
        >
            <HelpCircle className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">Tutorial</span>
        </Button>
    );
}
