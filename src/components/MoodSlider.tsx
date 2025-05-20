
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
    <div className="w-full p-4 rounded-lg bg-white shadow-md hover:shadow-lg transition-shadow">
      <h3 className="text-lg font-medium mb-6">{question}</h3>
      <div className="flex flex-col items-center gap-6 mb-3">
        <MoodEmoji score={value} />
        <Slider
          value={[value]}
          min={0}
          max={10}
          step={1}
          onValueChange={(vals) => onChange(vals[0])}
          className="w-full"
        />
        <div className="flex justify-between w-full text-sm text-gray-500">
          <span>Low</span>
          <span className="font-semibold">{value}/10</span>
          <span>High</span>
        </div>
      </div>
    </div>
  );
};

export default MoodSlider;
