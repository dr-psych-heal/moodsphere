
import React from 'react';
import { Slider } from "@/components/ui/slider";
import MoodEmoji from './MoodEmoji';

interface MoodSliderProps {
  question: string;
  value: number;
  onChange: (value: number) => void;
}

const MoodSlider: React.FC<MoodSliderProps> = ({ question, value, onChange }) => {
  return (
    <div className="w-full p-4 md:p-6 rounded-lg bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow border border-primary/10">
      <h3 className="text-base md:text-lg font-medium mb-4 md:mb-6">{question}</h3>
      <div className="flex flex-col items-center gap-4 md:gap-6 mb-3">
        <MoodEmoji score={value} className="animate-float" />
        <Slider
          value={[value]}
          min={0}
          max={10}
          step={1}
          onValueChange={(vals) => onChange(vals[0])}
          className="w-full max-w-md mx-auto"
        />
        <div className="flex justify-between w-full max-w-md mx-auto text-sm text-gray-500 dark:text-gray-400">
          <span>Low</span>
          <span className="font-semibold text-primary">{value}/10</span>
          <span>High</span>
        </div>
      </div>
    </div>
  );
};

export default MoodSlider;
