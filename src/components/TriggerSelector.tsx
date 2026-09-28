
import React, { useState } from 'react';
import { Check, Info } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TriggerSelectorProps {
  onSelectTriggers: (triggers: string[]) => void;
  selectedTriggers?: string[];
}

const triggerData: Record<string, string> = {
  "Work stress": "Pressure from deadlines, workload, or colleagues.",
  "Family conflict": "Disagreements or tension with family members.",
  "Financial concerns": "Worries about money, bills, or financial stability.",
  "Health issues": "Physical symptoms or concerns about your well-being.",
  "Social anxiety": "Worry or fear of social judgment or interactions.",
  "Sleep problems": "Difficulty falling asleep, staying asleep, or poor sleep quality.",
  "Relationship issues": "Tension or conflict in romantic or close relationships.",
  "Academic pressure": "Stress from studies, exams, or educational expectations.",
  "Traumatic memory": "Distressing thoughts about past difficult events.",
  "Loneliness": "Feeling isolated or lacking meaningful connection.",
  "Rejection": "Experience of being turned down or excluded.",
  "Criticism": "Negative feedback or judgment from others.",
  "Major life change": "Significant events like moving, job change, or loss.",
  "Substance use": "Impact of alcohol or other substances on mood.",
  "Performance anxiety": "Fear of failing in tasks or under-performing."
};

const commonTriggers = Object.keys(triggerData);

const TriggerSelector: React.FC<TriggerSelectorProps> = ({
  onSelectTriggers,
  selectedTriggers = []
}) => {
  const [triggers, setTriggers] = useState<string[]>(selectedTriggers);

  const handleToggleTrigger = (trigger: string) => {
    setTriggers(prev => {
      const newTriggers = prev.includes(trigger)
        ? prev.filter(t => t !== trigger)
        : [...prev, trigger];

      onSelectTriggers(newTriggers);
      return newTriggers;
    });
  };

  return (
    <div className="w-full p-4 md:p-5 rounded-lg bg-card border border-border">
      <h3 className="text-sm md:text-base font-semibold text-foreground mb-3">Common Triggers</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Select any triggers you've experienced today:
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        <TooltipProvider>
          {triggers.map(trigger => (
            <Tooltip key={trigger}>
              <TooltipTrigger asChild>
                <div className="px-2.5 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium flex items-center gap-1 cursor-help">
                  {trigger}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleTrigger(trigger);
                    }}
                    className="ml-0.5 hover:text-destructive"
                  >
                    ×
                  </button>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{triggerData[trigger]}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
        {triggers.length === 0 && (
          <p className="text-sm text-muted-foreground">No triggers selected</p>
        )}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="w-full justify-between">
            Add triggers
            <span className="opacity-70">+</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64 max-h-[300px] overflow-y-auto">
          <TooltipProvider>
            {commonTriggers.map(trigger => (
              <DropdownMenuItem key={trigger} onSelect={(e) => {
                e.preventDefault();
                handleToggleTrigger(trigger);
              }}>
                <div className="flex items-center gap-2 w-full">
                  <Checkbox
                    id={`trigger-${trigger}`}
                    checked={triggers.includes(trigger)}
                    onCheckedChange={() => handleToggleTrigger(trigger)}
                  />
                  <span>{trigger}</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="ml-auto h-3.5 w-3.5 text-muted-foreground opacity-50 hover:opacity-100" />
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p className="max-w-[150px] text-xs">{triggerData[trigger]}</p>
                    </TooltipContent>
                  </Tooltip>
                  {triggers.includes(trigger) && <Check className="ml-1 h-4 w-4 text-primary" />}
                </div>
              </DropdownMenuItem>
            ))}
          </TooltipProvider>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default TriggerSelector;
