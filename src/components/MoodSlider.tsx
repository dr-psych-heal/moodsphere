
import React, { useState } from 'react';
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Smile, SlidersHorizontal, Info } from "lucide-react";
import MoodEmoji from './MoodEmoji';
import GradientMoodSelector from './GradientMoodSelector';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MoodSliderProps {
  question: string;
  description?: string;
  value: number;
  onChange: (value: number) => void;
  questionType?: 'general' | 'stress' | 'social' | 'energy' | 'satisfaction';
}

const MoodSlider: React.FC<MoodSliderProps> = ({
  question,
  description,
  value,
  onChange,
  questionType = 'general'
}) => {
  const [useGradient, setUseGradient] = useState(false);

  const toggleInterface = () => {
    setUseGradient(!useGradient);
  };

  return (
    <div className="w-full p-4 md:p-5 rounded-lg bg-card border border-border">
      <div className="flex justify-between items-center mb-4 md:mb-5">
        <div className="flex items-center gap-2">
          <h3 className="text-sm md:text-base font-semibold text-foreground">{question}</h3>
          {description && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help opacity-60 hover:opacity-100 transition-opacity" />
                </TooltipTrigger>
                <TooltipContent className="p-3">
                  <p className="max-w-xs text-sm leading-relaxed">{description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleInterface}
          className="h-7 w-7 p-0 rounded-md"
          title={useGradient ? "Switch to slider" : "Switch to emoji selector"}
        >
          {useGradient ? <SlidersHorizontal size={14} /> : <Smile size={14} />}
        </Button>
      </div>

      {useGradient ? (
        <GradientMoodSelector
          value={value}
          onChange={onChange}
          questionType={questionType}
        />
      ) : (
        <div className="flex flex-col items-center gap-4 md:gap-5 mb-2">
          <MoodEmoji score={value} className="animate-float" />
          <Slider
            value={[value]}
            min={0}
            max={10}
            step={1}
            onValueChange={(vals) => onChange(vals[0])}
            className="w-full max-w-md mx-auto"
          />
          <div className="flex justify-between w-full max-w-md mx-auto text-sm text-muted-foreground">
            <span>Low</span>
            <span className="font-semibold text-foreground">{value}/10</span>
            <span>High</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MoodSlider;
