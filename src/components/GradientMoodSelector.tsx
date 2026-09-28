
import React from 'react';
import { Smile, Laugh, Meh, Frown, Angry, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GradientMoodSelectorProps {
  value: number;
  onChange: (value: number) => void;
  questionType?: 'general' | 'stress' | 'social' | 'energy' | 'satisfaction';
}

const GradientMoodSelector: React.FC<GradientMoodSelectorProps> = ({
  value,
  onChange,
  questionType = 'general'
}) => {
  // Define smiley face options for each value
  const options = [
    { value: 0, label: 'Terrible' },
    { value: 2, label: 'Bad' },
    { value: 4, label: 'Okay' },
    { value: 6, label: 'Good' },
    { value: 8, label: 'Great' },
    { value: 10, label: 'Excellent' }
  ];
  
  // Get the appropriate icon based on question type and mood value
  const getIcon = (val: number, type: string) => {
    // Base icons for general mood
    if (val >= 8) {
      return <Laugh size={32} />;
    } else if (val >= 6) {
      return <Smile size={32} />;
    } else if (val >= 4) {
      return <Meh size={32} />;
    } else if (val >= 2) {
      return <Frown size={32} />;
    } else {
      return <Angry size={32} />;
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center my-3 px-1 py-2 rounded-lg bg-muted border border-border">
        {options.map((option) => (
          <div
            key={option.value}
            className={cn(
              "flex flex-col items-center cursor-pointer transition-all",
              "p-2 rounded-md",
              value === option.value ? "bg-card shadow-sm border border-border" : "hover:bg-card/50"
            )}
            onClick={() => onChange(option.value)}
          >
            <div className={cn(
              "text-muted-foreground transition-colors",
              value === option.value ? "text-foreground" : ""
            )}>
              {getIcon(option.value, questionType)}
            </div>
            <span className={cn(
              "text-[10px] font-medium mt-1 text-muted-foreground",
              value === option.value ? "font-semibold text-foreground" : ""
            )}>
              {option.label}
            </span>
          </div>
        ))}
      </div>
      <div className="flex justify-between text-xs text-muted-foreground px-2">
        <span>0</span>
        <span className="font-semibold text-foreground">{value}/10</span>
        <span>10</span>
      </div>
    </div>
  );
};

export default GradientMoodSelector;
